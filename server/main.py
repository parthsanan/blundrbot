from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.engine.evaluator import get_worst_move
import chess
from enum import Enum
from typing import Literal

app = FastAPI(
    title="BlundrBot API",
    description="Chess API that suggests the worst possible legal move",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://blundrbot.onrender.com",  # Production frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameStatus(str, Enum):
    CHECKMATE = "checkmate"
    STALEMATE = "stalemate"
    DRAW_INSUFFICIENT = "draw_insufficient_material"
    DRAW_FIFTY = "draw_fifty_moves"
    DRAW_REPETITION = "draw_repetition"
    CHECK = "check"
    ONGOING = "ongoing"

class FENRequest(BaseModel):
    fen: str

class MoveResponse(BaseModel):
    move: str
    game_status: GameStatus
    error_score: int

def get_game_status(board: chess.Board) -> GameStatus:
    """Determine the current game status after a move."""
    if board.is_checkmate():
        return GameStatus.CHECKMATE
    elif board.is_stalemate():
        return GameStatus.STALEMATE
    elif board.is_insufficient_material():
        return GameStatus.DRAW_INSUFFICIENT
    elif board.is_fifty_moves():
        return GameStatus.DRAW_FIFTY
    elif board.is_repetition():
        return GameStatus.DRAW_REPETITION
    elif board.is_check():
        return GameStatus.CHECK
    return GameStatus.ONGOING

@app.post("/worst-move", response_model=MoveResponse)
async def worst_move_endpoint(request: FENRequest) -> MoveResponse:
    try:
        board = chess.Board(request.fen)
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail="Invalid FEN string provided."
        )

    if board.is_game_over():
        raise HTTPException(
            status_code=400, 
            detail=f"Game is already over. Result: {board.result()}"
        )

    legal_moves = list(board.legal_moves)
    if not legal_moves:
        raise HTTPException(
            status_code=400, 
            detail="No legal moves available in this position."
        )

    try:
        move, worst_eval = get_worst_move(board)
        print(f"DEBUG - Move: {move}, Eval: {worst_eval}")  # Debug log
        
        if not move:
            raise HTTPException(
                status_code=500, 
                detail="Failed to evaluate moves."
            )
            
        if move not in legal_moves:
            raise HTTPException(
                status_code=500, 
                detail="Engine returned an illegal move."
            )
        
        # Make the move to determine game status
        board.push(move)
        game_status = get_game_status(board)
        print(f"DEBUG - Game status: {game_status}")  # Debug log
        
        response = MoveResponse(
            move=move.uci(),
            game_status=game_status,
            error_score=worst_eval  # Removed abs() since we're already doing it in get_worst_move
        )
        print(f"DEBUG - Response: {response}")  # Debug log
        return response
        
    except Exception as e:
        print(f"ERROR in worst_move_endpoint: {str(e)}")  # Debug log
        print(traceback.format_exc())  # Full traceback
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )
