import { useState, useEffect, useCallback } from 'react';
import Header from '../components/layout/Header';
import Chessboard from '../components/chess/Chessboard';
import { Chess } from 'chess.js';
import { toast } from 'react-hot-toast';

// Predefined puzzles with their solutions
const PUZZLES = [
  {
    fen: '3qkb2/pppn1pp1/3pp1n1/PP3r1r/N1P2P2/8/3PP1PP/RNBQKB1R w KQ - 0 1',
    explanation: 'g4 allows Qh4#',
    worstMove: {
      from: 'g2',
      to: 'g4',
      explanation: 'Qh4#'
    }
  },
  {
    fen: '8/5p1k/2p3p1/3p1PQp/3P3P/4PPK1/8/1q6 w - - 0 1',
    explanation: 'Kf4 allows Qb8#',
    worstMove: {
      from: 'g3',
      to: 'f4',
      explanation: 'Qb8#'
    }
  },
  {
    fen: '5k1K/RR1RRPR1/4rP2/5P1R/8/8/2q2P2/8 w - - 0 1',
    explanation: 'fxe6 allows Qh7+, then either Rxh7 or Kh7 leads to stalemate',
    worstMove: {
      // In this position, the correct capture is actually f6xe6
      from: 'f5',
      to: 'e6',
      explanation: 'Leads to stalemate after Qh7+'
    }
  },
  {
    fen: 'rnbqkbnr/pppp1ppp/8/4P3/6n1/5P2/P1PNPPPP/R1BQKBNR w KQkq - 0 1',
    explanation: 'h3 allows Ne3, fxe3, Qh4#',
    worstMove: {
      from: 'h2',
      to: 'h3',
      explanation: 'Ne3, fxe3, Qh4#'
    }
  },
  {
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
    explanation: 'Ba6 allows bxa6, losing the bishop',
    worstMove: {
      from: 'f1',
      to: 'a6',
      explanation: 'bxa6 loses the bishop'
    }
  },
  {
    fen: '7k/8/8/1K6/8/8/8/5Q2 w - - 0 1',
    explanation: 'Qf7 leads to Stalemate',
    worstMove: {
      from: 'f1',
      to: 'f7',
      explanation: 'Leads to stalemate'
    }
  },
  {
    fen: '3r1k2/1p3p1p/1b6/2nR1N2/pN5P/P4P2/1P6/5K2 b - - 0 1',  // Changed 'w' to 'b' for Black to move
    explanation: 'Ba7 allows Red8# on the next move',
    worstMove: {
      from: 'b6',
      to: 'a7',
      explanation: 'Red8# (White can now play Rd8#)'
    }
  },
  {
    fen: 'r5k1/3b4/8/3p4/8/5B1P/3R2PP/6K1 w - - 0 1',
    explanation: '1...Ra1+ 2.Rf1 Rxf1 3.Kxf1 Bxh3 4.gxh3 leads to a draw because of the bishop and wrong color rook pawn vs king endgame',
    worstMove: {
      from: 'd2',
      to: 'f2',
      explanation: 'Leads to draw'
    }
  }
];

const PuzzlesPage = () => {
  const [position, setPosition] = useState(null);
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMove, setSelectedMove] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(0);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  // Function to set up a puzzle
  const setupPuzzle = useCallback((index) => {
    setLoading(true);
    setShowSolution(false);
    setSolved(false);
    setSelectedMove(null);

    try {
      // Get the puzzle at the current index or wrap around to the beginning
      const puzzleIndex = index % PUZZLES.length;
      const currentPuzzle = PUZZLES[puzzleIndex];
      const game = new Chess(currentPuzzle.fen);
      
      // Get all legal moves for this position
      const legalMoves = game.moves({ verbose: true });
      
      // Validate that the worst move is actually valid for this position
      let sanMove = null;
      try {
        // Try to make the move to get the SAN notation
        const moveResult = game.move({
          from: currentPuzzle.worstMove.from, 
          to: currentPuzzle.worstMove.to
        });
        
        if (moveResult) {
          sanMove = moveResult.san;
          // Reset the game after getting the SAN notation
          game.undo();
        } else {
          console.error(`Invalid move for puzzle ${puzzleIndex}: ${currentPuzzle.worstMove.from} to ${currentPuzzle.worstMove.to}`);
        }
      } catch (moveError) {
        console.error(`Error making move for puzzle ${puzzleIndex}:`, moveError);
        // Continue with the puzzle, but with a generic SAN notation
      }
      
      // Create the puzzle object
      const puzzleObj = {
        fen: currentPuzzle.fen,
        legalMoves: legalMoves,
        worstMove: {
          uci: currentPuzzle.worstMove.from + currentPuzzle.worstMove.to,
          explanation: currentPuzzle.explanation,
          move: {
            from: currentPuzzle.worstMove.from,
            to: currentPuzzle.worstMove.to,
            san: sanMove || '(see explanation)'
          }
        }
      };
      
      setPuzzle(puzzleObj);
      setPosition(currentPuzzle.fen);
      setBoardOrientation(game.turn() === 'w' ? 'white' : 'black');
      setCurrentPuzzleIndex(puzzleIndex);
      setLoading(false);
    } catch (error) {
      console.error('Error setting up puzzle:', error);
      toast.error('Failed to set up puzzle. Please try again.');
      
      // Move to the next puzzle if there's an error with the current one
      setTimeout(() => {
        setCurrentPuzzleIndex((prevIndex) => (prevIndex + 1) % PUZZLES.length);
      }, 1000);
      
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setupPuzzle(currentPuzzleIndex);
  }, [setupPuzzle, currentPuzzleIndex]);

  const handleMove = useCallback((move) => {
    if (loading || solved) return false;
    
    const uci = move.from + move.to;
    setSelectedMove(uci);

    const game = new Chess(puzzle.fen);
    const moveObj = puzzle.legalMoves.find(m => m.from + m.to === uci);
    
    if (moveObj) {
      game.move(moveObj);
      setPosition(game.fen());
      
      // Check if this was the worst move
      if (uci === puzzle.worstMove.uci) {
        toast.success('Correct! You found the worst move!');
        setStreak(currentStreak => currentStreak + 1);
        setSolved(true);
        setShowSolution(true);
      } else {
        setStreak(0);
        toast.error('Not the worst move. Try again!');
        
        // Reset the position after a delay
        setTimeout(() => {
          setPosition(puzzle.fen);
          setSelectedMove(null);
        }, 1500);
      }
    }
    
    return true;
  }, [puzzle, loading, solved]);

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  const handleNextPuzzle = () => {
    setupPuzzle(currentPuzzleIndex + 1);
  };

  const boardSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.7, 600);

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <Header activePage="puzzles" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-white mb-6">Find the Worst Move</h1>
          
          <div className="bg-zinc-800/90 p-6 rounded-xl shadow-lg mb-6 w-full max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 order-2 md:order-1">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">Instructions</h2>
                  <p className="text-zinc-300">
                    In each puzzle, your goal is to find the <span className="text-red-400 font-semibold">worst possible move</span> in the position.
                    This is the opposite of traditional puzzles where you look for the best move!
                  </p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">Current Streak: {streak}</h2>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleShowSolution}
                    disabled={loading || solved || showSolution}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-md transition"
                  >
                    Show Solution
                  </button>
                  
                  <button
                    onClick={handleNextPuzzle}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
                  >
                    Next Puzzle
                  </button>
                </div>
                
                {showSolution && puzzle && (
                  <div className="mt-6 p-4 bg-zinc-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">Solution</h3>
                    <p className="text-zinc-300">
                      The worst move is: <span className="text-red-400 font-bold">{puzzle.worstMove.move.san}</span>
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
                        isPlayerTurn: !loading && !solved
                      }}
                    />
                    <div className="mt-3 text-center text-zinc-300 font-medium py-2 bg-zinc-800 rounded">
                      {boardOrientation === 'white' ? 'White' : 'Black'} to move
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
