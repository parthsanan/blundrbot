import random
from typing import List, Optional, Tuple

import chess

# Piece values for simple evaluation
PIECE_VALUES = {
    chess.PAWN: 1,
    chess.KNIGHT: 3,
    chess.BISHOP: 3,
    chess.ROOK: 5,
    chess.QUEEN: 9,
    chess.KING: 0,
}


# Simple evaluation function
def evaluate_position(board: chess.Board) -> int:
    if board.is_checkmate():
        return -9999 if board.turn == chess.WHITE else 9999

    if (
        board.is_stalemate()
        or board.is_insufficient_material()
        or board.is_fifty_moves()
        or board.is_repetition()
    ):
        return 0

    score = 0

    for piece_type in PIECE_VALUES:
        white_pieces = len(board.pieces(piece_type, chess.WHITE))
        black_pieces = len(board.pieces(piece_type, chess.BLACK))
        score += (white_pieces - black_pieces) * PIECE_VALUES[piece_type]

    if board.is_check():
        score += -5 if board.turn == chess.WHITE else 5

    return score


# Get the worst move for the current player
def get_worst_move(
    board: chess.Board, recent_moves: Optional[List[str]] = None, n: int = 5
) -> Tuple[Optional[chess.Move], int]:
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None, 0

    if len(legal_moves) == 1:
        return legal_moves[0], 0

    move_scores = []

    for move in legal_moves:
        board.push(move)
        score = evaluate_position(board)
        move_scores.append((move, score))
        board.pop()

    # Sort moves by score
    is_white_turn = board.turn == chess.WHITE
    move_scores.sort(key=lambda x: x[1], reverse=not is_white_turn)

    # Get the top N worst moves
    worst_moves_pool = move_scores[:n]

    # Filter out recent moves
    if recent_moves:
        non_recent_moves = [
            (move, score)
            for move, score in worst_moves_pool
            if move.uci() not in recent_moves
        ]

        if non_recent_moves:
            # Pick a random move from the non-recent worst moves
            chosen_move, score = random.choice(non_recent_moves)
            return chosen_move, score

    # Fallback: if no non-recent moves are available in the pool, or if no history was provided,
    # pick a random move from the original pool of worst moves.
    if worst_moves_pool:
        chosen_move, score = random.choice(worst_moves_pool)
        return chosen_move, score

    # Ultimate fallback: return the single worst move if the pool is empty for some reason
    return move_scores[0]
