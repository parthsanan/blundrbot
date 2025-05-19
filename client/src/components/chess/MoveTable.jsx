import { useMemo } from 'react';

const MoveTable = ({ moveHistory = [] }) => {
  // Group moves into pairs (white and black)
  const moves = useMemo(() => {
    const result = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      result.push({
        turn: Math.floor(i / 2) + 1,
        white: moveHistory[i]?.san,
        black: moveHistory[i + 1]?.san
      });
    }
    return result;
  }, [moveHistory]);

  return (
    <div className="h-full overflow-y-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-zinc-800/90 backdrop-blur-sm z-10">
          <tr>
            <th className="px-3 py-2 text-xs font-medium text-zinc-300 text-left w-10">#</th>
            <th className="px-1 py-2 text-xs font-medium text-zinc-300 text-center">White</th>
            <th className="px-1 py-2 text-xs font-medium text-zinc-300 text-center">Black</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-700/50">
          {moves.map(({ turn, white, black }) => (
            <tr key={turn} className="hover:bg-zinc-700/20 transition-colors">
              <td className="px-3 py-1.5 text-xs text-zinc-400 font-mono">{turn}.</td>
              <td className="px-1 py-1.5">
                <button 
                  className={`w-full px-2 py-1 rounded transition-colors ${white ? 'hover:bg-indigo-600/50 cursor-pointer' : 'text-zinc-500'}`}
                  aria-label={white ? `White move: ${white}` : 'No move yet'}
                >
                  {white || '...'}
                </button>
              </td>
              <td className="px-1 py-1.5">
                <button 
                  className={`w-full px-2 py-1 rounded transition-colors ${black ? 'hover:bg-indigo-600/50 cursor-pointer' : 'text-zinc-500'}`}
                  aria-label={black ? `Black move: ${black}` : 'No move yet'}
                >
                  {black || '...'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MoveTable;