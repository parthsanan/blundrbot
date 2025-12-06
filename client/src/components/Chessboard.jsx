import React, { useState } from "react";
import { Chessboard as ReactChessboard } from "react-chessboard";
import { Chess } from "chess.js";

/**
 * Props:
 * - position: FEN string representing the current board state
 * - onPieceDrop: Function to call when a move is made
 * - orientation: "white" or "black" - which side is at bottom
 * - boardWidth: Size of the board in pixels
 * - gameState: Object with loading and isPlayerTurn flags
 */
const CustomChessboard = ({
  position,
  onPieceDrop,
  orientation,
  boardWidth,
  gameState,
  customDarkSquareStyle,
  customLightSquareStyle,
}) => {
  // Track which square is selected and what moves are possible
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

  // When a square is clicked
  const handleSquareClick = (square) => {
    // Don't do anything if game is loading or not player's turn
    if (gameState?.loading || !gameState?.isPlayerTurn) return;

    // If no square is selected yet, select this one
    if (!selectedSquare) {
      const chess = new Chess(position);
      const moves = chess.moves({ square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
        setPossibleMoves(moves);
      }
      return;
    }

    // If clicking the same square, deselect it
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // Try to make a move from selected square to clicked square
    const move = possibleMoves.find((m) => m.to === square);
    if (move) {
      const success = onPieceDrop({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });
      if (success) {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else {
      // If not a valid move, try selecting the new square instead
      const chess = new Chess(position);
      const moves = chess.moves({ square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
        setPossibleMoves(moves);
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  // When a piece is dragged and dropped
  const handlePieceDrop = (from, to) => {
    if (gameState?.loading || !gameState?.isPlayerTurn) return false;

    const chess = new Chess(position);
    const moves = chess.moves({ square: from, verbose: true });
    const move = moves.find((m) => m.to === to);

    if (move) {
      return onPieceDrop({ from, to, promotion: "q" });
    }
    return false;
  };

  // Highlight legal move squares
  const squareStyles = {};
  possibleMoves.forEach((move) => {
    squareStyles[move.to] = {
      background:
        "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
    };
  });

  return (
    <div style={{ width: boardWidth, height: boardWidth }}>
      <ReactChessboard
        position={position}
        onPieceDrop={handlePieceDrop}
        onSquareClick={handleSquareClick}
        boardWidth={boardWidth}
        boardOrientation={orientation}
        customSquareStyles={squareStyles}
        customDarkSquareStyle={
          customDarkSquareStyle || { backgroundColor: "#7B61FF" }
        }
        customLightSquareStyle={
          customLightSquareStyle || { backgroundColor: "#E8E9FF" }
        }
      />
    </div>
  );
};

export default CustomChessboard;
