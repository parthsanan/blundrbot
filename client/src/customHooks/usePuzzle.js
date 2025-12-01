import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { toast } from "react-hot-toast";
import PUZZLES from "../data/puzzles.json";

export const usePuzzle = () => {
  const [puzzle, setPuzzle] = useState(null);
  const [position, setPosition] = useState(null);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [loading, setLoading] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(0);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  const setupPuzzle = useCallback((index) => {
    setLoading(true);
    setShowSolution(false);
    setSolved(false);

    const puzzleIndex = index % PUZZLES.length;
    const currentPuzzle = PUZZLES[puzzleIndex];
    const game = new Chess(currentPuzzle.fen);

    const legalMoves = game.moves({ verbose: true });

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
      console.error("Invalid move in puzzle data:", error);
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
  }, []);

  useEffect(() => {
    setupPuzzle(currentPuzzleIndex);
  }, [currentPuzzleIndex, setupPuzzle]);

  const handleMove = (move) => {
    if (loading || solved) return false;

    const uci = move.from + move.to;
    const game = new Chess(puzzle.fen);
    const moveObj = puzzle.legalMoves.find((m) => m.from + m.to === uci);

    if (moveObj) {
      game.move(moveObj);
      setPosition(game.fen());

      if (uci === puzzle.worstMove.uci) {
        toast.success("Correct! You found the worst move!");
        setStreak((prev) => prev + 1);
        setSolved(true);
        setShowSolution(true);
      } else {
        setStreak(0);
        toast.error("Not the worst move. Try again!");
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

  return {
    puzzle,
    position,
    boardOrientation,
    loading,
    showSolution,
    solved,
    streak,
    handleMove,
    handleShowSolution,
    handleNextPuzzle,
  };
};
