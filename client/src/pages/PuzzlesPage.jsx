import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Chessboard from "../components/chess/Chessboard";
import { Chess } from "chess.js";
import { toast } from "react-hot-toast";
import PUZZLES from "../data/puzzles.json";

const PuzzlesPage = () => {
  const [position, setPosition] = useState(null);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMove, setSelectedMove] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(0);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  // Set up a puzzle by index
  const setupPuzzle = (index) => {
    setLoading(true);
    setShowSolution(false);
    setSolved(false);

    const puzzleIndex = index % PUZZLES.length;
    const currentPuzzle = PUZZLES[puzzleIndex];
    const game = new Chess(currentPuzzle.fen);

    // Get all legal moves
    const legalMoves = game.moves({ verbose: true });

    // Get the move notation for the worst move
    let sanMove = null;
    try {
      const moveResult = game.move({
        from: currentPuzzle.worstMove.from,
        to: currentPuzzle.worstMove.to,
      });
      if (moveResult) {
        sanMove = moveResult.san;
        game.undo();
      }
    } catch (error) {
      console.error("Invalid move:", error);
    }

    setPuzzle({
      fen: currentPuzzle.fen,
      legalMoves,
      worstMove: {
        uci: currentPuzzle.worstMove.from + currentPuzzle.worstMove.to,
        explanation: currentPuzzle.explanation,
        move: {
          from: currentPuzzle.worstMove.from,
          to: currentPuzzle.worstMove.to,
          san: sanMove || "(see explanation)",
        },
      },
    });

    setPosition(currentPuzzle.fen);
    setBoardOrientation(game.turn() === "w" ? "white" : "black");
    setCurrentPuzzleIndex(puzzleIndex);
    setLoading(false);
  };

  useEffect(() => {
    setupPuzzle(currentPuzzleIndex);
  }, [currentPuzzleIndex]);

  const handleMove = (move) => {
    if (loading || solved) return false;

    const uci = move.from + move.to;

    const game = new Chess(puzzle.fen);
    const moveObj = puzzle.legalMoves.find((m) => m.from + m.to === uci);

    if (moveObj) {
      game.move(moveObj);
      setPosition(game.fen());

      // Check if this was the worst move
      if (uci === puzzle.worstMove.uci) {
        toast.success("Correct! You found the worst move!");
        setStreak((prev) => prev + 1);
        setSolved(true);
        setShowSolution(true);
      } else {
        setStreak(0);
        toast.error("Not the worst move. Try again!");

        // Reset position after a delay
        setTimeout(() => {
          setPosition(puzzle.fen);
        }, 1500);
      }
    }

    return true;
  };

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  const handleNextPuzzle = () => {
    setupPuzzle(currentPuzzleIndex + 1);
  };

  // Calculate board size based on window dimensions
  const calculateBoardSize = () => {
    if (typeof window === "undefined") return 600;
    return Math.min(window.innerWidth * 0.8, window.innerHeight * 0.7, 600);
  };

  const [boardSize, setBoardSize] = useState(calculateBoardSize());

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(calculateBoardSize());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <Header activePage="puzzles" />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-white mb-6">
            Find the Worst Move
          </h1>

          <div className="bg-zinc-800/90 p-6 rounded-xl shadow-lg mb-6 w-full max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 order-2 md:order-1">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Instructions
                  </h2>
                  <p className="text-zinc-300">
                    In each puzzle, your goal is to find the{" "}
                    <span className="text-red-400 font-semibold">
                      worst possible move
                    </span>{" "}
                    in the position. This is the opposite of traditional puzzles
                    where you look for the best move!
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Current Streak: {streak}
                  </h2>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleShowSolution}
                    disabled={loading || solved || showSolution}
                    className="btn-secondary disabled:bg-zinc-800 disabled:text-zinc-500"
                  >
                    Show Solution
                  </button>

                  <button
                    onClick={handleNextPuzzle}
                    className="btn bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    Next Puzzle
                  </button>
                </div>

                {showSolution && puzzle && (
                  <div className="panel mt-6">
                    <h3 className="text-lg font-medium text-white mb-2">
                      Solution
                    </h3>
                    <p className="text-zinc-300">
                      The worst move is:{" "}
                      <span className="text-red-400 font-bold">
                        {puzzle.worstMove.move.san}
                      </span>
                    </p>
                    <div className="mt-2">
                      <p className="text-zinc-300">
                        Explanation: {puzzle.worstMove.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex justify-center items-center order-1 md:order-2">
                {position && (
                  <div className="bg-zinc-700/50 p-3 rounded-xl">
                    <Chessboard
                      position={position}
                      onPieceDrop={handleMove}
                      orientation={boardOrientation}
                      boardWidth={boardSize}
                      gameState={{
                        loading: loading,
                        isPlayerTurn: !loading && !solved,
                      }}
                    />
                    <div className="mt-3 text-center text-zinc-300 font-medium py-2 bg-zinc-800 rounded">
                      {boardOrientation === "white" ? "White" : "Black"} to move
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzlesPage;
