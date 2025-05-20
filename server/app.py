from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from enum import Enum
from typing import Optional
import chess
import logging
import os

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BlundrBot API",
    description="API for finding the worst possible chess moves",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://blundrbot.vercel.app"],  
    allow_credentials=False,  
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600
)
class GameStatus(str, Enum):
    CHECKMATE = "checkmate"
    STALEMATE = "stalemate"
    INSUFFICIENT_MATERIAL = "insufficient_material"
    FIFTY_MOVES = "fifty_moves"
    REPETITION = "repetition"
    CHECK = "check"
    ONGOING = "ongoing"

class MoveResponse(BaseModel):
    move: Optional[str] = None
    san: Optional[str] = None
    score: int
    game_over: bool
    status: str
    game_status: Optional[GameStatus] = None
    
class MoveRequest(BaseModel):
    fen: str

def evaluate_board(board: chess.Board) -> int:
    """Simple evaluation function that only considers material."""
    if board.is_checkmate():
        return -9999 if board.turn == chess.WHITE else 9999
    
    if board.is_stalemate() or board.is_insufficient_material() or board.is_fifty_moves() or board.is_repetition():
        return 0
    
    piece_values = {
        chess.PAWN: 1,
        chess.KNIGHT: 3,
        chess.BISHOP: 3,
        chess.ROOK: 5,
        chess.QUEEN: 9,
        chess.KING: 0
    }
    
    score = 0
    for piece_type, value in piece_values.items():
        white_pieces = len(board.pieces(piece_type, chess.WHITE))
        black_pieces = len(board.pieces(piece_type, chess.BLACK))
        score += (white_pieces - black_pieces) * value
    
    if board.is_check():
        score += -5 if board.turn == chess.WHITE else 5
    
    return score

def get_worst_move(board: chess.Board):
    """Find the worst legal move in the given position."""
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None, 0
    
    if len(legal_moves) == 1:
        return legal_moves[0], 0
    
    move_scores = []
    for move in legal_moves:
        board.push(move)
        score = evaluate_board(board)
        move_scores.append((move, score))
        board.pop()
    
    if board.turn == chess.WHITE:
        return min(move_scores, key=lambda x: x[1])
    return max(move_scores, key=lambda x: x[1])

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "BlundrBot API is running",
        "endpoints": {"POST /worst-move": "Get the worst move for a given FEN position"}
    }

@app.post("/worst-move", response_model=MoveResponse)
async def worst_move(request: MoveRequest):
    try:
        board = chess.Board(request.fen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid FEN: {str(e)}")
    
    move, score = get_worst_move(board)
    game_status = get_game_status(board)
    
    if move is None:
        return MoveResponse(
            move=None,
            san=None,
            score=0,
            game_over=board.is_game_over(),
            status="no_moves",
            game_status=game_status
        )
    
    return MoveResponse(
        move=move.uci(),
        san=board.san(move),
        score=score,
        game_over=False,
        status="success",
        game_status=game_status
    )

def get_game_status(board: chess.Board) -> GameStatus:
    if board.is_checkmate():
        return GameStatus.CHECKMATE
    elif board.is_stalemate():
        return GameStatus.STALEMATE
    elif board.is_insufficient_material():
        return GameStatus.INSUFFICIENT_MATERIAL
    elif board.is_fifty_moves():
        return GameStatus.FIFTY_MOVES
    elif board.is_repetition():
        return GameStatus.REPETITION
    elif board.is_check():
        return GameStatus.CHECK
    return GameStatus.ONGOING

# For Render deployment
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
