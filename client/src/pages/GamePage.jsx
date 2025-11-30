import { useMemo, useCallback, useState, useEffect } from "react";
import { useChessGame } from "../customHooks/useChessGame";
import Header from "../components/Header";
import Chessboard from "../components/Chessboard";
import GamePanel from "../components/GamePanel";
import MoveTable from "../components/MoveTable";
import ColorSelection from "../components/ColorSelection";
import GameOver from "../components/GameOver";
import { toast } from "react-hot-toast";
import { Chess } from "chess.js";

const GamePage = () => {
  const { gameState, makeMove, resetGame, startGame } = useChessGame();
  const {
    fen,
    status,
    moveHistory,
    isPlayerTurn,
    playerColor,
    showColorSelection,
  } = gameState;

  const isGameOver = useMemo(
    () => ["checkmate", "stalemate", "draw", "game_over"].includes(status),
    [status]
  );

  const isPlayerWinner = useMemo(
    () =>
      isGameOver &&
      status === "checkmate" &&
      moveHistory.length % 2 === (playerColor === "black" ? 0 : 1),
    [isGameOver, status, moveHistory.length, playerColor]
  );

  const [boardSize, setBoardSize] = useState(() => {
    if (typeof window === "undefined") return 600;
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.7;
    return Math.min(maxWidth, maxHeight, 600);
  });

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.7;
      setBoardSize(Math.min(maxWidth, maxHeight, 600));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCopyFEN = useCallback(async () => {
    try {
      const game = new Chess(fen);
      await navigator.clipboard.writeText(game.fen());
      toast.success("FEN copied to clipboard!");
    } catch (err) {
      console.error("Error copying FEN:", err);
      toast.error("Failed to copy FEN");
    }
  }, [fen]);

  const handleNewGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handleSelectColor = useCallback(
    (color) => {
      startGame(color);
    },
    [startGame]
  );

  if (showColorSelection) {
    return <ColorSelection onSelectColor={handleSelectColor} />;
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <Header activePage="game" />
      {isGameOver && (
        <GameOver
          status={status}
          onNewGame={handleNewGame}
          isPlayerWinner={isPlayerWinner}
        />
      )}
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Spacer */}
          <div className="hidden lg:block flex-1"></div>

          {/* Left Panel - Game Controls */}
          <div className="w-full lg:w-64 order-2 lg:order-none">
            <GamePanel
              status={status}
              onReset={handleNewGame}
              onCopyFEN={handleCopyFEN}
              isPlayerTurn={isPlayerTurn}
            />
          </div>

          {/* Center - Chessboard */}
          <div className="flex-shrink-0 order-1 lg:order-none mx-auto lg:mx-0">
            <div className="bg-zinc-800/90 p-4 rounded-xl">
              <Chessboard
                position={fen}
                onPieceDrop={makeMove}
                orientation={gameState.playerColor || "white"}
                boardWidth={boardSize}
                gameState={{
                  loading: gameState.loading,
                  isPlayerTurn: gameState.isPlayerTurn,
                }}
              />
            </div>
          </div>

          {/* Right Panel - Move History */}
          <div className="w-full lg:w-80 order-3 lg:order-none">
            <div
              className="card overflow-hidden flex flex-col"
              style={{ height: `${boardSize + 32}px` }}
            >
              <h3 className="text-sm font-medium text-zinc-300 mb-3 flex-shrink-0">
                Move History
              </h3>
              <div className="overflow-auto flex-1">
                <MoveTable moveHistory={moveHistory} />
              </div>
            </div>
          </div>

          {/* Right Spacer */}
          <div className="hidden lg:block flex-1"></div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
