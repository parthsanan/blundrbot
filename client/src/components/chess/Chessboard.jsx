import React, { useCallback, useState, useMemo } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const CustomChessboard = ({ 
  position, 
  onPieceDrop, 
  orientation, 
  boardWidth,
  gameState
}) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [hoveredSquare, setHoveredSquare] = useState(null);

  const handleMove = useCallback((from, to) => {
  if (gameState?.loading || !gameState?.isPlayerTurn) return false;
  
  const game = new Chess(position);
  const moves = game.moves({ square: from, verbose: true });
  const moveObj = moves.find(move => move.to === to);
  
  if (moveObj) {
    const move = {
      from,
      to,
      promotion: moveObj.promotion || 'q'
    };
    const success = onPieceDrop(move);
    if (success) {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
    return success;
  }
  return false;
}, [position, onPieceDrop, gameState?.loading, gameState?.isPlayerTurn]);

const handleSquareClick = useCallback((square) => {
  if (gameState?.loading || !gameState?.isPlayerTurn) return;

  if (!selectedSquare) {
    const game = new Chess(position);
    const moves = game.moves({ square, verbose: true });
    if (moves.length > 0) {
      setSelectedSquare(square);
      setLegalMoves(moves);
    }
    return;
  }

  if (selectedSquare === square) {
    setSelectedSquare(null);
    setLegalMoves([]);
    return;
  }

  const moveMade = handleMove(selectedSquare, square);
  if (!moveMade) {
    const game = new Chess(position);
    const newMoves = game.moves({ square, verbose: true });
    if (newMoves.length > 0) {
      setSelectedSquare(square);
      setLegalMoves(newMoves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }
}, [selectedSquare, position, handleMove, gameState?.loading, gameState?.isPlayerTurn]);

const handlePieceDrop = useCallback((sourceSquare, targetSquare) => {
  return handleMove(sourceSquare, targetSquare);
}, [handleMove]);

  const handleSquareHover = useCallback((square) => {
    setHoveredSquare(square);
  }, []);

  const customSquareStyles = useMemo(() => {
    const styles = {};

    legalMoves.forEach(move => {
      styles[move.to] = move.captured
        ? {
            boxShadow: 'inset 0 0 0 3px rgba(255, 0, 0, 0.6)',
            background: 'rgba(255, 0, 0, 0.2)'
          }
        : {
            background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.3) 25%, transparent 26%)'
          };
    });

    if (hoveredSquare) {
      styles[hoveredSquare] = {
        background: 'rgba(20, 85, 255, 0.2)'
      };
    }

    return styles;
  }, [legalMoves, hoveredSquare]);

  return (
    <div className="chessboard-container" style={{
      width: boardWidth,
      height: boardWidth,
      margin: '0 auto',
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <ReactChessboard
        position={position}
        onPieceDrop={handlePieceDrop}
        onSquareClick={handleSquareClick}
        onMouseOverSquare={handleSquareHover}
        boardWidth={boardWidth}
        showBoardNotation={true}
        animationDuration={200}
        boardOrientation={orientation}
        boardStyle={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        }}
        customDarkSquareStyle={{ 
          backgroundColor: '#7B61FF',
        }}
        customLightSquareStyle={{ 
          backgroundColor: '#E8E9FF',
        }}
        customSquareStyles={customSquareStyles}
      />
    </div>
  );
};

export default CustomChessboard;