const express = require('express');
const healthController = require('../controllers/health');
const gameController = require('../controllers/gameController');

const router = express.Router();

// Health endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

/**
 * Tic Tac Toe API
 * All endpoints below use simple user IDs (strings). If userId is omitted when creating/joining a game,
 * the server generates a UUID automatically. Responses include the full game state.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         board:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: string
 *               nullable: true
 *               enum: [X, O, null]
 *         currentPlayer:
 *           type: string
 *           enum: [X, O]
 *         status:
 *           type: string
 *           enum: [waiting, in_progress, finished]
 *         winner:
 *           type: string
 *           nullable: true
 *           enum: [X, O, draw, null]
 *         players:
 *           type: object
 *           properties:
 *             X: { type: string }
 *             O: { type: string, nullable: true }
 *         allowAI:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Create a new game (creator is X)
 *     tags: [Games]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Optional client-provided user ID; server generates one if missing
 *               allowAI:
 *                 type: boolean
 *                 description: If true, AI joins as O and the game starts immediately
 *     responses:
 *       201:
 *         description: Game created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 */
router.post('/games', (req, res, next) => gameController.create(req, res, next));

/**
 * @swagger
 * /games/{id}/join:
 *   post:
 *     summary: Join a game as player O
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Optional client-provided user ID; server generates one if missing
 *     responses:
 *       200:
 *         description: Joined game
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       400:
 *         description: Cannot join (already has O or finished)
 *       404:
 *         description: Game not found
 */
router.post('/games/:id/join', (req, res, next) => gameController.join(req, res, next));

/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Get game state
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game state fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
 */
router.get('/games/:id', (req, res, next) => gameController.get(req, res, next));

/**
 * @swagger
 * /games/{id}/moves:
 *   post:
 *     summary: Make a move for the current player
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, row, col]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID of the player making the move
 *               row:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 2
 *               col:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 2
 *     responses:
 *       200:
 *         description: Move applied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       400:
 *         description: Invalid move
 *       403:
 *         description: Not your turn
 *       404:
 *         description: Game not found
 */
router.post('/games/:id/moves', (req, res, next) => gameController.move(req, res, next));

/**
 * @swagger
 * /games/{id}/ai-move:
 *   post:
 *     summary: Make an AI move if AI is enabled and it is AI's turn
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: AI move made
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Game'
 *                 - type: object
 *                   properties:
 *                     aiMove:
 *                       type: object
 *                       properties:
 *                         row: { type: integer }
 *                         col: { type: integer }
 *       400:
 *         description: AI not enabled, not AI's turn, or game finished
 *       404:
 *         description: Game not found
 */
router.post('/games/:id/ai-move', (req, res, next) => gameController.aiMove(req, res, next));

module.exports = router;
