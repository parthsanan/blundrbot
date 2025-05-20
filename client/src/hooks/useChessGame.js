import { useState, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { INITIAL_FEN } from '../lib/constants';
import { makeBlunderMove } from '../lib/api';
import { toast } from 'react-hot-toast';

const toastStyle = {
  style: {
    background: '#1f2937',
    color: '#f3f4f6',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
  },
  duration: 2000,
  position: 'bottom-right',
};

export const useChessGame = () => {
  const gameRef = useRef(new Chess(INITIAL_FEN));
  const [gameState, setGameState] = useState({
    fen: INITIAL_FEN,
    orientation: 'white',
    status: 'ongoing',
    loading: false,
    moveHistory: [],
    error: null,
    playerColor: null, 
    isPlayerTurn: true,
    cumulativeError: 0,
    lastMoveError: 0,
    showColorSelection: true 
  });

  const startGame = useCallback((playerColor) => {
    const newGame = new Chess(INITIAL_FEN);
    gameRef.current = newGame;
    const orientation = playerColor === 'black' ? 'black' : 'white';
    
    setGameState(prev => ({
      ...prev,
      fen: INITIAL_FEN,
      orientation,
      status: 'ongoing',
      moveHistory: [],
      error: null,
      cumulativeError: 0,
      lastMoveError: 0,
      playerColor,
      isPlayerTurn: playerColor === 'white',
      loading: playerColor === 'black',
      showColorSelection: false
    }));

    if (playerColor === 'black') {
      makeBlunderMove(INITIAL_FEN).then(response => {
        const { move: botMove, game_status, error_score } = response.data;
        if (botMove) {
          gameRef.current.move(botMove);
          setGameState(prev => ({
            ...prev,
            lastMoveError: error_score,
            cumulativeError: (prev.cumulativeError || 0) + (error_score || 0),
            fen: gameRef.current.fen(),
            moveHistory: gameRef.current.history({ verbose: true }),
            status: game_status,
            loading: false,
            isPlayerTurn: true
          }));

          if (error_score >= 800) {
            toast.error(`Yikes—catastrophic blunder: -${error_score} cp!`, toastStyle);
          } else if (error_score >= 500) {
            toast.warning(`Oops—BlundrBot blundered by -${error_score} cp!`, toastStyle);
          }
        }
      }).catch(error => {
        logger.error('Error in bot move:', { error: error.message });
        setGameState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to make bot move. Please try again.'
        }));
      });
    }
  }, [  ]);

  const makeMove = useCallback(async (move) => {
    if (!gameState.isPlayerTurn || gameState.loading) {
      return false;
    }

    try {
      setGameState(prev => ({ ...prev, loading: true, error: null }));
      gameRef.current.move(move);
      const playerMoveHistory = gameRef.current.history({ verbose: true });
      
      setGameState(prev => ({
        ...prev,
        fen: gameRef.current.fen(),
        moveHistory: playerMoveHistory,
        isPlayerTurn: false
      }));
      
      if (gameRef.current.isGameOver()) {
        setGameState(prev => ({
          ...prev,
          status: gameRef.current.isCheckmate() ? 'checkmate' : 
                 gameRef.current.isStalemate() ? 'stalemate' : 
                 gameRef.current.isDraw() ? 'draw' : 'game_over',
          loading: false
        }));
        return true;
      }
      
      const response = await makeBlunderMove(gameRef.current.fen());
      const { move: botMove, game_status, error_score } = response.data;
      
      if (botMove) {
        gameRef.current.move(botMove);
      }

      setGameState(prev => ({
        ...prev,
        fen: gameRef.current.fen(),
        moveHistory: gameRef.current.history({ verbose: true }),
        status: game_status,
        loading: false,
        isPlayerTurn: true,
        lastMoveError: error_score || 0,
        cumulativeError: (prev.cumulativeError || 0) + (error_score || 0)
      }));

      if (error_score >= 300) {
        toast.error(`Yikes—catastrophic blunder: -${error_score} cp!`, {
          duration: 2000,
          position: 'bottom-right',
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #4b5563',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
          }
        });
      } else if (error_score >= 100) {
        toast.warning(`Oops—BlundrBot blundered by -${error_score} cp!`, {
          duration: 2000,
          position: 'bottom-right',
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #4b5563',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
          }
        });
      }
      
      return true;
    } catch (err) {
      logger.error('Error making move', { error: error.message, move: move.san });;
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || 'Failed to make move. Please try again.',
        isPlayerTurn: true
      }));
      return false;
    }
  }, [gameState.isPlayerTurn, gameState.loading]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showColorSelection: true
    }));
  }, []);

  return {
    gameState,
    makeMove,
    resetGame,
    startGame
  };
};