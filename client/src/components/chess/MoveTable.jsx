/**
 * Props:
 * - moveHistory: Array of move objects from the game
 */
const MoveTable = ({ moveHistory = [] }) => {
  // Group moves into pairs: white's move, then black's move
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moveHistory[i]?.san || "...",
      black: moveHistory[i + 1]?.san || "...",
    });
  }

  return (
    <div className="h-full overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-zinc-800">
          <tr>
            <th className="px-3 py-2 text-xs text-zinc-300 text-left">#</th>
            <th className="px-2 py-2 text-xs text-zinc-300">White</th>
            <th className="px-2 py-2 text-xs text-zinc-300">Black</th>
          </tr>
        </thead>
        <tbody>
          {movePairs.map((move) => (
            <tr key={move.number} className="hover:bg-zinc-700/20">
              <td className="px-3 py-2 text-xs text-zinc-400">
                {move.number}.
              </td>
              <td className="px-2 py-2 text-sm text-white text-center">
                {move.white}
              </td>
              <td className="px-2 py-2 text-sm text-white text-center">
                {move.black}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MoveTable;
