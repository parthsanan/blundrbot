import { toast } from "react-hot-toast";

/**
 * Props:
 * - loading: Whether bot is thinking
 * - onReset: Function to start a new game
 * - onCopyFEN: Function to copy current position
 */
const GamePanel = ({ loading, onReset, onCopyFEN }) => {
  const copyPGN = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const pgn = `[Event "BlundrBot Game"]\n[Site "BlundrBot"]\n[Date "${today}"]\n[Result "*"]\n\n*`;
      await navigator.clipboard.writeText(pgn);
      toast.success("PGN copied!");
    } catch (err) {
      toast.error("Failed to copy PGN");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <button
          onClick={onReset}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          New Game
        </button>

        <div className="panel">
          <div className="flex flex-col gap-2">
            <button
              onClick={onCopyFEN}
              className="btn-secondary w-full text-sm"
            >
              Copy FEN
            </button>
            <button onClick={copyPGN} className="btn-secondary w-full text-sm">
              Copy PGN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePanel;
