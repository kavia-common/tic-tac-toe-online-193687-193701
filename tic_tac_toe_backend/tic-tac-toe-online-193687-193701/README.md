# tic-tac-toe-online-193687-193701

## Backend (Express) - Tic Tac Toe
- Service runs on port 3001 by default.
- Swagger docs available at /docs (the host/port in the UI is set dynamically).

### Endpoints
- POST /games
  - body: { userId?: string, allowAI?: boolean }
  - creates a game; creator is X; if allowAI=true, O is AI and game starts.
- POST /games/:id/join
  - body: { userId?: string }
  - join as player O (if available).
- GET /games/:id
  - returns current game state.
- POST /games/:id/moves
  - body: { userId: string, row: 0-2, col: 0-2 }
  - applies a move for the current player.
- POST /games/:id/ai-move
  - triggers AI to play if enabled and it is AI’s turn.

Validation and rules:
- Enforces turn order and player identity.
- Validates bounds and empty cells.
- Detects win/draw and prevents moves after finish.

### Run locally
From tic_tac_toe_backend:
- npm install
- npm run dev (for development with nodemon) or npm run start
- Visit http://localhost:3001/docs for Swagger UI
