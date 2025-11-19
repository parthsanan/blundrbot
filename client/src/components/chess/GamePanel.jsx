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
    <div className="w-[200px] p-4">
      <div className="flex flex-col gap-3">
        {/* New Game Button */}
        <button
          onClick={onReset}
          disabled={loading}
          className="w-full px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
        >
          New Game
        </button>

        {/* Export Buttons */}
        <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Export</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={onCopyFEN}
              className="w-full px-3 py-2 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
            >
              Copy FEN
            </button>
            <button
              onClick={copyPGN}
              className="w-full px-3 py-2 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
            >
              Copy PGN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePanel;
