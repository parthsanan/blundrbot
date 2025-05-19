import chess
import logging
from typing import Optional, Tuple, List
import random

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Piece values for simple evaluation
PIECE_VALUES = {
    chess.PAWN: 1,
    chess.KNIGHT: 3,
    chess.BISHOP: 3,
    chess.ROOK: 5,
    chess.QUEEN: 9,
    chess.KING: 0  # King has no value in evaluation
}

def evaluate_board(board: chess.Board) -> int:
    """Simple evaluation function that only considers material."""
    if board.is_checkmate():
        return -9999 if board.turn == chess.WHITE else 9999
    
    if board.is_stalemate() or board.is_insufficient_material() or board.is_fifty_moves() or board.is_repetition():
        return 0
    
    score = 0
    
    # Material score
    for piece_type in PIECE_VALUES:
        white_pieces = len(board.pieces(piece_type, chess.WHITE))
        black_pieces = len(board.pieces(piece_type, chess.BLACK))
        score += (white_pieces - black_pieces) * PIECE_VALUES[piece_type]
    
    # Add a small penalty for being in check
    if board.is_check():
        score += -5 if board.turn == chess.WHITE else 5
    
    return score

def get_worst_move(board: chess.Board) -> Tuple[Optional[chess.Move], int]:
    """
    Find the worst legal move in the given position.
    Returns a tuple of (move, score)
    """
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None, 0
    
    # If only one move, return it
    if len(legal_moves) == 1:
        return legal_moves[0], 0
    
    # Evaluate each move
    move_scores = []
    
    for move in legal_moves:
        # Make the move
        board.push(move)
        
        # Evaluate the position
        score = evaluate_board(board)
        
        # Store the move and its score
        move_scores.append((move, score))
        
        # Undo the move
        board.pop()
    
    # Find the worst move (lowest score for current player)
    if board.turn == chess.WHITE:
        worst_move, worst_score = min(move_scores, key=lambda x: x[1])
    else:
        worst_move, worst_score = max(move_scores, key=lambda x: x[1])
    
    return worst_move, worst_score