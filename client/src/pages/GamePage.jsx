import { useMemo, useState, useEffect, useCallback } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import Header from '../components/layout/Header';
import Chessboard from '../components/chess/Chessboard';
import GamePanel from '../components/chess/GamePanel';
import MoveTable from '../components/chess/MoveTable';
import BlunderMeter from '../components/chess/BlunderMeter';
import ColorSelection from '../components/chess/ColorSelection';
import GameOver from '../components/chess/GameOver';
import { Toaster, toast } from 'react-hot-toast';
import { Chess } from 'chess.js';

const GamePage = () => {
  const { gameState, makeMove, resetGame, startGame } = useChessGame();
  const { 
    fen, 
    status, 
    moveHistory,
    isPlayerTurn,
    cumulativeError,
    lastMoveError,
    playerColor,
    showColorSelection
  } = gameState;
  
  const isGameOver = useMemo(() => 
    ['checkmate', 'stalemate', 'draw', 'game_over'].includes(status)
  , [status]);
  
  const isPlayerWinner = useMemo(() => 
    isGameOver && status === 'checkmate' && moveHistory.length % 2 === (playerColor === 'black' ? 0 : 1)
  , [isGameOver, status, moveHistory.length, playerColor]);

  const boardSize = useMemo(() => {
    if (typeof window === 'undefined') return 600;
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.7;
    return Math.min(maxWidth, maxHeight, 600);
  }, []);
  
  const handleCopyFEN = useCallback(async () => {
    try {
      const game = new Chess(fen);
      await navigator.clipboard.writeText(game.fen());
      toast.success('FEN copied to clipboard!');
    } catch (err) {
      console.error('Error copying FEN:', err);
      toast.error('Failed to copy FEN');
    }
  }, [fen]);
  
  const handleNewGame = useCallback(() => {
    resetGame();
  }, [resetGame]);
  
  const handleSelectColor = useCallback((color) => {
    startGame(color);
  }, [startGame]);
  
  if (showColorSelection) {
    return <ColorSelection onSelectColor={handleSelectColor} />;
  }
  
  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <Header />
      {isGameOver && (
        <GameOver 
          status={status} 
          onNewGame={handleNewGame} 
          isPlayerWinner={isPlayerWinner} 
        />
      )}
      <div className="px-4 py-4 lg:pl-64 lg:pr-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-48 xl:w-56">
            <GamePanel
              status={status}
              onReset={handleNewGame}
              onCopyFEN={handleCopyFEN}
              isPlayerTurn={isPlayerTurn}
            />
          </div>

          <div className="flex justify-center">
            <div className="bg-zinc-800/90 p-2 sm:p-4 md:p-6 rounded-xl">
              <Chessboard
                position={fen}
                onPieceDrop={makeMove}
                orientation={gameState.playerColor || 'white'}
                boardWidth={boardSize}
                gameState={{
                  loading: gameState.loading,
                  isPlayerTurn: gameState.isPlayerTurn
                }}
              />
            </div>
          </div>

          <div className="relative w-full lg:w-72 xl:w-80">
            <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col gap-3">
              <div className="flex-1 min-h-0">
                <div className="h-full bg-zinc-800/80 rounded-xl border border-zinc-700/50 overflow-hidden p-2">
                  <div className="h-full">
                    <MoveTable moveHistory={moveHistory} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-zinc-800 to-zinc-900/90 p-3 rounded-xl border border-zinc-700/50 shadow-lg backdrop-blur-sm">
                <h3 className="text-xs font-medium text-zinc-300 mb-2 text-center">Blunder Meter</h3>
                <div className="h-40"> 
                  <BlunderMeter score={lastMoveError > 0 ? cumulativeError : null} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default GamePage;