from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from enum import Enum
from typing import Optional
from app.engine.evaluator import get_worst_move
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
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameStatus(str, Enum):
    """Enum representing possible game statuses."""
    CHECKMATE = "checkmate"
    STALEMATE = "stalemate"
    INSUFFICIENT_MATERIAL = "insufficient_material"
    FIFTY_MOVES = "fifty_moves"
    REPETITION = "repetition"
    CHECK = "check"
    ONGOING = "ongoing"

class MoveRequest(BaseModel):
    """Request model for the worst-move endpoint."""
    fen: str

class MoveResponse(BaseModel):
    """Response model for the worst-move endpoint."""
    move: Optional[str] = None
    san: Optional[str] = None
    score: int
    game_over: bool
    status: str
    game_status: Optional[GameStatus] = None

def get_game_status(board: chess.Board) -> GameStatus:
    """Determine the current game status after a move."""
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

@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint with basic API information."""
    return {
        "status": "ok",
        "message": "BlundrBot API is running",
        "endpoints": {
            "POST /worst-move": "Get the worst move for a given FEN position"
        }
    }

@app.post("/worst-move", response_model=MoveResponse)
async def worst_move(request: MoveRequest) -> MoveResponse:
    """
    Find the worst legal move for the given FEN position.
    
    Args:
        request: MoveRequest containing the FEN string
        
    Returns:
        MoveResponse: Contains the worst move information
    """
    try:
        # Validate FEN
        try:
            board = chess.Board(request.fen)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid FEN: {str(e)}")
        
        # Get the worst move
        move, score = get_worst_move(board)
        
        # Get game status
        game_status = get_game_status(board)
        game_over = board.is_game_over()
        
        if move is None:
            return MoveResponse(
                move=None,
                san=None,
                score=0,
                game_over=game_over,
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
        
    except Exception as e:
        logger.error(f"Error in /worst-move: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Add CORS headers for OPTIONS requests
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    """Middleware to handle CORS preflight requests."""
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )
    
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

# Run the application with uvicorn directly for development
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
