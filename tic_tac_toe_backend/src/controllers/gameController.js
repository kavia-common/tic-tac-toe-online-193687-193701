const gameService = require('../services/gameService');

class GameController {
  /**
   * Create a new game
   * Body:
   * - userId?: string (optional; if omitted we generate a UUID)
   * - allowAI?: boolean (default false)
   * Response: Game state
   */
  // PUBLIC_INTERFACE
  create(req, res, next) {
    try {
      const { userId, allowAI = false } = req.body || {};
      const game = gameService.createGame({ userId, allowAI });
      res.status(201).json(game);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Join existing game as player O
   * Params: id
   * Body: { userId?: string }
   * Response: Game state
   */
  // PUBLIC_INTERFACE
  join(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.body || {};
      const game = gameService.joinGame({ gameId: id, userId });
      res.status(200).json(game);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get game state
   * Params: id
   * Response: Game state
   */
  // PUBLIC_INTERFACE
  get(req, res, next) {
    try {
      const { id } = req.params;
      const game = gameService.getGame(id);
      res.status(200).json(game);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Make a move
   * Params: id
   * Body: { userId: string, row: number, col: number }
   * Response: Game state
   */
  // PUBLIC_INTERFACE
  move(req, res, next) {
    try {
      const { id } = req.params;
      const { userId, row, col } = req.body || {};
      const game = gameService.makeMove({ gameId: id, userId, row, col });
      res.status(200).json(game);
    } catch (err) {
      next(err);
    }
  }

  /**
   * AI makes a move for the current player (if enabled and AI's turn)
   * Params: id
   * Response: Game state + aiMove {row, col}
   */
  // PUBLIC_INTERFACE
  aiMove(req, res, next) {
    try {
      const { id } = req.params;
      const game = gameService.aiMove({ gameId: id });
      res.status(200).json(game);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GameController();
