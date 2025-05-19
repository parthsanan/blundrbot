import chess
import os
import logging
import traceback
import subprocess
import time
from typing import Optional, Tuple
from dataclasses import dataclass

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get the absolute path to the stockfish executable
STOCKFISH_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "stockfish", "stockfish.exe")

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
    if not os.path.exists(STOCKFISH_PATH):
        raise RuntimeError(f"Stockfish engine not found at {STOCKFISH_PATH}")

    # Prepare subprocess startup info
    startupinfo = None
    if os.name == 'nt':  # Only use CREATE_NO_WINDOW on Windows
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        startupinfo.wShowWindow = subprocess.SW_HIDE

    process = subprocess.Popen(
        [STOCKFISH_PATH],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        startupinfo=startupinfo,
        # Redirect input/output for non-Windows platforms
        **({'creationflags': subprocess.CREATE_NO_WINDOW} if os.name == 'nt' else {})
    )

    # Initialize UCI
    send_command(process, "uci")
    while True:
        line = read_line(process)
        if not line:
            raise RuntimeError("No response from Stockfish during initialization")
        if "error" in line.lower():
            raise RuntimeError(f"Stockfish error: {line}")
        if line == "uciok":
            break

    # Configure engine
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

def get_worst_move(board: chess.Board) -> Optional[chess.Move]:
    """
    Find the worst legal move in the given position.
    
    Args:
        board: A chess.Board object representing the current position
        
    Returns:
        The worst legal move found, or None if no moves could be evaluated
        
    Raises:
        RuntimeError: If there's an error with the Stockfish engine
    """
    try:
        process = initialize_engine()
        try:
            worst_eval = float('inf')
            worst_move = None
            eval_board = board.copy()

            for move in eval_board.legal_moves:
                eval_board.push(move)
                result = evaluate_position(process, eval_board)
                eval_board.pop()

                if result is None:
                    continue

                if result.score < worst_eval:
                    worst_eval = result.score
                    worst_move = move
                    logger.debug(f"New worst move found: {move}, score: {result.score}")

            if worst_move is None:
                logger.error("No legal moves could be evaluated")
                raise RuntimeError("Failed to evaluate any moves")

            logger.info(f"Selected worst move: {worst_move}, score: {worst_eval}")
            return worst_move, abs(worst_eval)

        finally:
            try:
                send_command(process, "quit")
                process.wait(timeout=1)
            except Exception as e:
                logger.error(f"Error during cleanup: {e}")
                process.kill()

    except subprocess.SubprocessError as e:
        error_msg = f"Stockfish process error: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)
    except Exception as e:
        error_msg = f"Failed to evaluate position: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)