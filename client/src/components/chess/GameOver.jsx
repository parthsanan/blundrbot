import { memo } from 'react';

const GAME_OVER_MESSAGES = {
  checkmate: (isWinner) => isWinner 
    ? 'Congratulations! You won by checkmate! 🎉' 
    : 'Checkmate! How did you even get here? 😭',
  stalemate: 'Stalemate! Neither side could screw up enough to win—what a draw 🤝',
  draw: 'Draw! Both you and the bot were equally terrible—nice work? 🤷',
  game_over: 'Game over'
};

const DEFAULT_MESSAGE = 'Game over';

const getGameOverMessage = (status, isPlayerWinner) => {
  const message = GAME_OVER_MESSAGES[status];
  return typeof message === 'function' 
    ? message(isPlayerWinner) 
    : message || DEFAULT_MESSAGE;
};

const GameOver = ({ status, onNewGame, isPlayerWinner }) => {
  const message = getGameOverMessage(status, isPlayerWinner);
  const title = isPlayerWinner ? '🎉 Victory! 🎉' : 'Game Over';
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-zinc-200 mb-6">{message}</p>
        <button
          onClick={onNewGame}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          aria-label="Play again"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default memo(GameOver, (prevProps, nextProps) => {
  // Only re-render if status or isPlayerWinner changes
  return prevProps.status === nextProps.status && 
         prevProps.isPlayerWinner === nextProps.isPlayerWinner;
});
