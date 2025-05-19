export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const GAME_STATUS = {
  ONGOING: 'ongoing',
  CHECKMATE: 'checkmate',
  STALEMATE: 'stalemate',
  DRAW_INSUFFICIENT: 'draw_insufficient_material',
  DRAW_FIFTY: 'draw_fifty_moves',
  DRAW_REPETITION: 'draw_repetition',
  CHECK: 'check'
};

export const STATUS_MESSAGES = {
  [GAME_STATUS.ONGOING]: 'Your turn',
  [GAME_STATUS.CHECKMATE]: 'Checkmate! Game over.',
  [GAME_STATUS.STALEMATE]: 'Stalemate! Game drawn.',
  [GAME_STATUS.DRAW_INSUFFICIENT]: 'Draw by insufficient material.',
  [GAME_STATUS.DRAW_FIFTY]: 'Draw by fifty-move rule.',
  [GAME_STATUS.DRAW_REPETITION]: 'Draw by threefold repetition.',
  [GAME_STATUS.CHECK]: 'Check!'
};
