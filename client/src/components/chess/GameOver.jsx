const GAME_OVER_MESSAGES = {
  checkmate: (isWinner) =>
    isWinner
      ? "Congratulations! You won by checkmate! 🎉"
      : "Checkmate! How did you even get here? 😭",
  stalemate:
    "Stalemate! Neither side could screw up enough to win - what a draw 🤝",
  draw: "Draw! Both you and the bot were equally terrible - nice work? 🤷",
  game_over: "Game over",
};

const MESSAGE_GAME_OVER = "Game over";

const getGameOverMessage = (status, isPlayerWinner) => {
  const message = GAME_OVER_MESSAGES[status];
  return typeof message === "function"
    ? message(isPlayerWinner)
    : message || MESSAGE_GAME_OVER;
};

const GameOver = ({ status, onNewGame, isPlayerWinner }) => {
  const message = getGameOverMessage(status, isPlayerWinner);
  const title = isPlayerWinner ? "🎉 Victory! 🎉" : "Game Over";

  return (
    <div className="modal-overlay">
      <div className="modal-content text-center">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <p className="text-zinc-200 mb-6">{message}</p>
        <button
          onClick={onNewGame}
          className="btn-primary"
          aria-label="Play again"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOver;
