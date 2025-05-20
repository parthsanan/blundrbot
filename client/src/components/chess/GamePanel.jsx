import { useCallback } from 'react';
import { STATUS_MESSAGES } from '../../lib/constants';
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

const GamePanel = ({ 
  status, 
  loading, 
  onReset, 
  onCopyFEN, 
  lastMoveError = 0,
  isPlayerTurn
}) => {
  const handleCopyFEN = useCallback(() => {
    onCopyFEN();
  }, [onCopyFEN]);

  const handleCopyPGN = useCallback(async () => {
    try {
      const pgn = `[Event "BlundrBot Game"]\n[Site "BlundrBot"]\n[Date "${new Date().toISOString().split('T')[0]}"]\n[Result "*"]\n\n*`;
      await navigator.clipboard.writeText(pgn);
      toast.success('PGN copied!', toastStyle);
    } catch (err) {
      console.error('Error copying PGN:', { error: err.message });
      toast.error('Failed to copy PGN', toastStyle);
    }
  }, []);

  return (
    <div className="w-[200px] p-4 mt-0">
      <div className="flex flex-col gap-3">
        <button
          onClick={onReset}
          disabled={loading}
          className="w-full px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
          aria-label="Start new game"
        >
          New Game
        </button>
        <div className="p-4 rounded-lg bg-zinc-800/80 border border-zinc-700 shadow-lg">
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                loading ? 'bg-amber-400 animate-pulse' : 
                isPlayerTurn ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-indigo-300 font-medium">
              {isPlayerTurn ? 'Your turn' : 'Bot thinking...'}
            </span>
          </div>
          <span className="block mt-2 text-white font-medium">
            {loading ? 'Thinking...' : STATUS_MESSAGES[status] || status}
          </span>
          {lastMoveError > 0 && (
            <div className="mt-2 text-sm text-zinc-400">
              Last blunder: <span className={`font-medium ${lastMoveError >= 300 ? 'text-red-400' : 'text-yellow-400'}`}>
                -{lastMoveError} cp
              </span>
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-zinc-800/80 border border-zinc-700 shadow-lg">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Share & Export</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCopyFEN}
              className="w-full px-3 py-2 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition"
              title="Copy FEN to clipboard"
            >
              Copy FEN
            </button>
            <button
              onClick={handleCopyPGN}
              className="w-full px-3 py-2 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition"
              title="Copy PGN to clipboard"
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