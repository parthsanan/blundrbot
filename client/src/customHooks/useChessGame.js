import { useState, useRef } from "react";
import { Chess } from "chess.js";
import { makeBlunderMove } from "../lib/api";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const BOT_MOVE_HISTORY_LENGTH = 5; // Number of recent bot moves to track

/**
 * Hook to manage the chess game state and actions
 */
export const useChessGame = () => {
  const game = useRef(new Chess(INITIAL_FEN));

  const [state, setState] = useState({
    loading: false,
    playerColor: null,
    isPlayerTurn: true,
    showColorSelection: true,
  });

  // Track recent bot moves to prevent repetition
  const [botMoveHistory, setBotMoveHistory] = useState([]);

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
    setBotMoveHistory([]); // Reset history on new game
    setState({
      loading: playerColor === "black",
      playerColor,
      isPlayerTurn: playerColor === "white",
      showColorSelection: false,
    });

    // If player chose black, bot goes first
    if (playerColor === "black") {
      try {
        const response = await makeBlunderMove(INITIAL_FEN, []);
        const botMove = response.data.move;
        if (botMove) {
          game.current.move(botMove);
          setBotMoveHistory([botMove]);
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
      // Make the player's move first
      game.current.move(move);

      // Update state to show the player's move immediately
      setState((prev) => ({ ...prev, loading: true, isPlayerTurn: false }));

      // Check if game is over after player's move
      if (game.current.isGameOver()) {
        setState((prev) => ({ ...prev, loading: false, isPlayerTurn: false }));
        return true;
      }

      // Get bot's move
      const response = await makeBlunderMove(
        game.current.fen(),
        botMoveHistory
      );
      const botMove = response.data.move;

      // delay before bot move is played for better UX
      const botThinkingTime = 200; // 200ms
      await new Promise((resolve) => setTimeout(resolve, botThinkingTime));

      if (botMove) {
        game.current.move(botMove);
        setBotMoveHistory((prev) =>
          [botMove, ...prev].slice(0, BOT_MOVE_HISTORY_LENGTH)
        );
      }

      setState((prev) => ({ ...prev, loading: false, isPlayerTurn: true }));
      return true;
    } catch (error) {
      console.error("Move failed:", error);
      // Revert the player's move if bot move fails
      game.current.undo();
      setState((prev) => ({ ...prev, loading: false, isPlayerTurn: true }));
      return false;
    }
  };

  // Reset the game to show color selection again
  const resetGame = () => {
    game.current = new Chess(INITIAL_FEN);
    setBotMoveHistory([]);
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
