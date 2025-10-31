const { randomUUID } = require('crypto');

/**
 * In-memory storage of games
 * Game shape:
 * {
 *   id: string,
 *   board: string[3][3], // 'X' | 'O' | null
 *   playerX: string, // userId
 *   playerO: string | null, // userId when someone joins
 *   currentPlayer: 'X' | 'O',
 *   status: 'waiting' | 'in_progress' | 'finished',
 *   winner: 'X' | 'O' | 'draw' | null,
 *   allowAI: boolean,
 *   createdAt: string,
 *   updatedAt: string
 * }
 */

const games = new Map();

/**
 * Helper to initialize empty 3x3 board
 */
function createEmptyBoard() {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

/**
 * Check if a given board has a winner or is draw.
 * Returns: { finished: boolean, winner: 'X'|'O'|'draw'|null }
 */
function evaluateBoard(board) {
  const lines = [
    // rows
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    // cols
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    // diags
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]],
  ];
  for (const line of lines) {
    if (line[0] && line[0] === line[1] && line[1] === line[2]) {
      return { finished: true, winner: line[0] };
    }
  }
  // Check draw
  const hasEmpty = board.some(row => row.some(cell => cell === null));
  if (!hasEmpty) {
    return { finished: true, winner: 'draw' };
  }
  return { finished: false, winner: null };
}

/**
 * Simple AI: pick first available empty cell.
 * Returns { row, col } or null if none.
 */
function pickAiMove(board) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

/**
 * Serialize game to a safe public response shape.
 */
function toResponse(game) {
  return {
    id: game.id,
    board: game.board,
    currentPlayer: game.currentPlayer,
    status: game.status,
    winner: game.winner,
    players: {
      X: game.playerX,
      O: game.playerO,
    },
    allowAI: game.allowAI,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
}

// PUBLIC_INTERFACE
function createGame({ userId, allowAI = false }) {
  /** Create a new game; creator is player X. */
  const id = randomUUID();
  const now = new Date().toISOString();
  const game = {
    id,
    board: createEmptyBoard(),
    playerX: userId || randomUUID(),
    playerO: allowAI ? 'AI' : null,
    currentPlayer: 'X',
    status: allowAI ? 'in_progress' : 'waiting',
    winner: null,
    allowAI: !!allowAI,
    createdAt: now,
    updatedAt: now,
  };
  games.set(id, game);
  return toResponse(game);
}

// PUBLIC_INTERFACE
function joinGame({ gameId, userId }) {
  /** Join an existing game as player O. */
  const game = games.get(gameId);
  if (!game) {
    const err = new Error('Game not found');
    err.status = 404;
    throw err;
  }
  if (game.status === 'finished') {
    const err = new Error('Game already finished');
    err.status = 400;
    throw err;
  }
  if (game.playerO) {
    const err = new Error('Game already has player O');
    err.status = 400;
    throw err;
  }
  game.playerO = userId || randomUUID();
  game.status = 'in_progress';
  game.updatedAt = new Date().toISOString();
  return toResponse(game);
}

// PUBLIC_INTERFACE
function getGame(gameId) {
  /** Fetch game state by id. */
  const game = games.get(gameId);
  if (!game) {
    const err = new Error('Game not found');
    err.status = 404;
    throw err;
  }
  return toResponse(game);
}

// PUBLIC_INTERFACE
function makeMove({ gameId, userId, row, col }) {
  /**
   * Make a move for the current player at {row, col}.
   * Validates turn, bounds, and empty cell; updates status.
   */
  const game = games.get(gameId);
  if (!game) {
    const err = new Error('Game not found');
    err.status = 404;
    throw err;
  }
  if (game.status === 'finished') {
    const err = new Error('Game already finished');
    err.status = 400;
    throw err;
  }
  // Validate player identity
  const currentSymbol = game.currentPlayer;
  const expectedUserId = currentSymbol === 'X' ? game.playerX : game.playerO;
  if (game.allowAI && expectedUserId === 'AI') {
    const err = new Error('It is AI turn, use /ai-move endpoint');
    err.status = 400;
    throw err;
  }
  if (!userId || userId !== expectedUserId) {
    const err = new Error('Not your turn');
    err.status = 403;
    throw err;
  }
  // Validate bounds
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || row > 2 || col < 0 || col > 2) {
    const err = new Error('Move out of bounds');
    err.status = 400;
    throw err;
  }
  // Validate empty
  if (game.board[row][col] !== null) {
    const err = new Error('Cell already occupied');
    err.status = 400;
    throw err;
  }
  // Apply move
  game.board[row][col] = currentSymbol;

  // Evaluate result
  const evaluation = evaluateBoard(game.board);
  if (evaluation.finished) {
    game.status = 'finished';
    game.winner = evaluation.winner;
  } else {
    game.currentPlayer = currentSymbol === 'X' ? 'O' : 'X';
  }
  game.updatedAt = new Date().toISOString();
  return toResponse(game);
}

// PUBLIC_INTERFACE
function aiMove({ gameId }) {
  /**
   * Make an AI move if the game allows AI and it is AI's turn.
   */
  const game = games.get(gameId);
  if (!game) {
    const err = new Error('Game not found');
    err.status = 404;
    throw err;
  }
  if (!game.allowAI) {
    const err = new Error('AI is not enabled for this game');
    err.status = 400;
    throw err;
  }
  if (game.status === 'finished') {
    const err = new Error('Game already finished');
    err.status = 400;
    throw err;
  }
  const currentSymbol = game.currentPlayer;
  const expectedUserId = currentSymbol === 'X' ? game.playerX : game.playerO;
  if (expectedUserId !== 'AI') {
    const err = new Error('It is not AI turn');
    err.status = 400;
    throw err;
  }

  const move = pickAiMove(game.board);
  if (!move) {
    // no moves, should be draw; re-evaluate
    const evaluation = evaluateBoard(game.board);
    game.status = evaluation.finished ? 'finished' : game.status;
    game.winner = evaluation.winner;
    game.updatedAt = new Date().toISOString();
    return toResponse(game);
  }

  game.board[move.row][move.col] = currentSymbol;

  const evaluation = evaluateBoard(game.board);
  if (evaluation.finished) {
    game.status = 'finished';
    game.winner = evaluation.winner;
  } else {
    game.currentPlayer = currentSymbol === 'X' ? 'O' : 'X';
  }
  game.updatedAt = new Date().toISOString();
  return { ...toResponse(game), aiMove: move };
}

module.exports = {
  createGame,
  joinGame,
  getGame,
  makeMove,
  aiMove,
};
