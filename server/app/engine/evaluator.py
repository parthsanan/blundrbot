import chess
import os
import logging
import traceback
import subprocess
import time
from typing import Optional
from dataclasses import dataclass

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_stockfish_path() -> str:
    """Get the Stockfish binary path, trying multiple methods."""
    try:
        import chess.engine
        
        if hasattr(chess.engine, 'STOCKFISH_BIN'):
            return chess.engine.STOCKFISH_BIN
            
        import shutil
        stockfish_path = shutil.which('stockfish')
        if stockfish_path:
            return stockfish_path
            
        if os.name == 'nt':
            return 'stockfish.exe'
        else:
            return 'stockfish'
            
    except Exception as e:
        logger.error(f"Error finding Stockfish: {e}")
        return 'stockfish'

# Get the Stockfish path
STOCKFISH_PATH = get_stockfish_path()
logger.info(f"Using Stockfish at: {STOCKFISH_PATH}")

# Engine configuration
ENGINE_CONFIG = {
    "MultiPV": "1",
    "Threads": "4",
    "Hash": "128",
    "Minimum Thinking Time": "10",
}

# Constants
EVALUATION_DEPTH = 12
MATE_SCORE = 100000
PROCESS_TIMEOUT = 10
READ_TIMEOUT = 5

@dataclass
class EvalResult:
    score: int
    is_mate: bool = False
    mate_in: Optional[int] = None

def send_command(process: subprocess.Popen, command: str) -> None:
    """Send a command to the Stockfish process."""
    logger.debug(f"Sending command: {command}")
    process.stdin.write(f"{command}\n")
    process.stdin.flush()

def read_line(process: subprocess.Popen, timeout: int = READ_TIMEOUT) -> Optional[str]:
    """Read a line from the Stockfish process with timeout."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if process.stdout is None:
            return None
        line = process.stdout.readline().strip()
        if line:
            logger.debug(f"Received: {line}")
            return line
        time.sleep(0.1)
    return None

def parse_evaluation(info_line: str) -> Optional[EvalResult]:
    """Parse the evaluation score from a Stockfish info line."""
    try:
        if "score mate" in info_line:
            mate_str = info_line.split("score mate")[1].split()[0]
            mate_score = int(mate_str)
            return EvalResult(
                score=-MATE_SCORE if mate_score > 0 else MATE_SCORE,
                is_mate=True,
                mate_in=mate_score
            )
        elif "score cp" in info_line:
            score_str = info_line.split("score cp")[1].split()[0]
            return EvalResult(score=-int(score_str))
        return None
    except (IndexError, ValueError) as e:
        logger.warning(f"Failed to parse score from line: {info_line}, error: {e}")
        return None

def initialize_engine() -> subprocess.Popen:
    """Initialize and configure the Stockfish engine."""
    global STOCKFISH_PATH
    
    # Try to find stockfish if the current path doesn't exist
    if not os.path.exists(STOCKFISH_PATH):
        logger.warning(f"Stockfish not found at {STOCKFISH_PATH}, trying to find it...")
        STOCKFISH_PATH = get_stockfish_path()
    
    # Prepare the command
    command = [STOCKFISH_PATH]
    
    kwargs = {
        'stdin': subprocess.PIPE,
        'stdout': subprocess.PIPE,
        'stderr': subprocess.PIPE,
        'text': True,
        'bufsize': 1,
    }
    
    if os.name == 'nt':
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        startupinfo.wShowWindow = subprocess.SW_HIDE
        kwargs['startupinfo'] = startupinfo
        kwargs['creationflags'] = subprocess.CREATE_NO_WINDOW
    else:
        kwargs['start_new_session'] = True

    logger.info(f"Starting Stockfish with command: {' '.join(command)}")
    
    try:
        # Try to start the process
        process = subprocess.Popen(command, **kwargs)
        
        # Test if the process started successfully
        if process.poll() is not None:
            _, stderr = process.communicate()
            raise RuntimeError(f"Stockfish process terminated immediately. Error: {stderr}")
            
        # Test if the process responds to UCI
        process.stdin.write("uci\n")
        process.stdin.flush()
        
        # Wait for a response with a timeout
        start_time = time.time()
        while time.time() - start_time < 5:  # 5 second timeout
            if process.stdout and process.stdout.readable():
                line = process.stdout.readline().strip()
                if line == 'uciok':
                    break
                elif 'error' in line.lower():
                    raise RuntimeError(f"Stockfish error: {line}")
            time.sleep(0.1)
        else:
            raise RuntimeError("Stockfish did not respond to UCI command")
            
        logger.info("Stockfish initialized successfully")
        return process
        
    except Exception as e:
        error_msg = f"Failed to start Stockfish: {e}"
        logger.error(error_msg)
        
        # Provide helpful error message
        if os.name != 'nt':
            error_msg += ("\n\nIf you're running locally, you may need to install Stockfish:\n"
                         "  Ubuntu/Debian: sudo apt-get install stockfish\n"
                         "  MacOS: brew install stockfish\n\n"
                         "Make sure it's in your PATH or specify the full path.")
        
        raise RuntimeError(error_msg)

    send_command(process, "uci")
    while True:
        line = read_line(process)
        if not line:
            raise RuntimeError("No response from Stockfish during initialization")
        if "error" in line.lower():
            raise RuntimeError(f"Stockfish error: {line}")
        if line == "uciok":
            break

    for option, value in ENGINE_CONFIG.items():
        send_command(process, f"setoption name {option} value {value}")

    return process

def evaluate_position(process: subprocess.Popen, board: chess.Board) -> Optional[EvalResult]:
    """Evaluate a single chess position using Stockfish."""
    send_command(process, f"position fen {board.fen()}")
    send_command(process, f"go depth {EVALUATION_DEPTH}")

    best_eval: Optional[EvalResult] = None
    while True:
        line = read_line(process, PROCESS_TIMEOUT)
        if not line:
            logger.warning("Timeout analyzing position")
            break
        if line.startswith("bestmove"):
            break
        if line.startswith("info") and ("score cp" in line or "score mate" in line):
            current_eval = parse_evaluation(line)
            if current_eval is not None:
                best_eval = current_eval

    return best_eval

def get_worst_move(board: chess.Board) -> tuple[Optional[chess.Move], int]:
    """
    Find the worst legal move in the given position.
    
    Args:
        board: A chess.Board object representing the current position
        
    Returns:
        A tuple containing the worst move and its evaluation score
        
    Raises:
        RuntimeError: If there's an error evaluating the position
    """
    process = None
    try:
        process = initialize_engine()
        if not process or process.poll() is not None:
            raise RuntimeError("Failed to initialize Stockfish engine")
            
        # Get the current position's evaluation
        current_eval = evaluate_position(process, board)
        
        # Get all legal moves
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            return None, 0
            
        # Evaluate each move
        worst_move = None
        worst_eval = -MATE_SCORE * 2  # Start with worst possible score
        
        for move in legal_moves:
            # Make the move
            board.push(move)
            
            try:
                # Evaluate the resulting position
                eval_result = evaluate_position(process, board)
                
                # If this is the worst move so far, save it
                if eval_result.score < worst_eval:
                    worst_move = move
                    worst_eval = eval_result.score
                    
            except Exception as e:
                logger.warning(f"Error evaluating move {move}: {e}")
                # Continue with next move even if one fails
                continue
                
            finally:
                # Always undo the move
                board.pop()
        
        if worst_move is None and legal_moves:
            # If all evaluations failed, return a random move
            import random
            worst_move = random.choice(legal_moves)
            worst_eval = 0  # Neutral evaluation as fallback
            
        return worst_move, worst_eval
        
    except Exception as e:
        error_msg = f"Failed to evaluate position: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise RuntimeError(error_msg)
        
    finally:
        # Ensure process is terminated
        if process and process.poll() is None:
            try:
                process.terminate()
                process.wait(timeout=2)
            except (subprocess.SubprocessError, OSError) as e:
                logger.warning(f"Error terminating Stockfish process: {e}")
                try:
                    process.kill()
                except:
                    pass