import { useState, useRef } from "react";
import { Chess } from "chess.js";
import { makeBlunderMove } from "../lib/api";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Hook to manage the chess game state and actions
 */
export const useChessGame = () => {
  // The chess game instance - tracks the actual game state
  const game = useRef(new Chess(INITIAL_FEN));

  // UI state - tracks things like loading, player color, etc.
  const [state, setState] = useState({
    loading: false,
    playerColor: null,
    isPlayerTurn: true,
    showColorSelection: true,
  });

  // Get the current game status (checkmate, stalemate, etc.)
  const getStatus = () => {
    if (game.current.isCheckmate()) return "checkmate";
    if (game.current.isStalemate()) return "stalemate";
    if (game.current.isDraw()) return "draw";
    if (game.current.isCheck()) return "check";
    return "ongoing";
  };

  // Start a new game with the chosen color
  const startGame = async (playerColor) => {
    game.current = new Chess(INITIAL_FEN);
    setState({
      loading: playerColor === "black",
      playerColor,
      isPlayerTurn: playerColor === "white",
      showColorSelection: false,
    });

    // If player chose black, bot goes first
    if (playerColor === "black") {
      try {
        const response = await makeBlunderMove(INITIAL_FEN);
        const botMove = response.data.move;
        if (botMove) {
          game.current.move(botMove);
        }
        setState((prev) => ({ ...prev, loading: false, isPlayerTurn: true }));
      } catch (error) {
        console.error("Bot move failed:", error);
        setState((prev) => ({ ...prev, loading: false, isPlayerTurn: true }));
      }
    }
  };

  // Make a move for the player, then get bot's response
  const makeMove = async (move) => {
    // Don't allow moves if it's not player's turn or if loading
    if (!state.isPlayerTurn || state.loading) return false;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Make the player's move
      game.current.move(move);

      // Check if game is over after player's move
      if (game.current.isGameOver()) {
        setState((prev) => ({ ...prev, loading: false }));
        return true;
      }

      // Get bot's move
      const response = await makeBlunderMove(game.current.fen());
      const botMove = response.data.move;
      if (botMove) {
        game.current.move(botMove);
      }

      setState((prev) => ({ ...prev, loading: false, isPlayerTurn: true }));
      return true;
    } catch (error) {
      console.error("Move failed:", error);
      setState((prev) => ({ ...prev, loading: false, isPlayerTurn: true }));
      return false;
    }
  };

  // Reset the game to show color selection again
  const resetGame = () => {
    game.current = new Chess(INITIAL_FEN);
    setState({
      loading: false,
      playerColor: null,
      isPlayerTurn: true,
      showColorSelection: true,
    });
  };

  // Return everything the UI needs
  return {
    gameState: {
      fen: game.current.fen(),
      moveHistory: game.current.history({ verbose: true }),
      status: getStatus(),
      orientation: state.playerColor === "black" ? "black" : "white",
      isGameOver: game.current.isGameOver(),
      ...state,
    },
    makeMove,
    resetGame,
    startGame,
  };
};
