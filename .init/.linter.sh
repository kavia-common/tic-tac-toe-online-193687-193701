#!/bin/bash
cd /tmp/kavia/workspace/code-generation/tic-tac-toe-online-193687-193701/tic_tac_toe_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

