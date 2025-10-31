const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tic Tac Toe API',
      version: '1.0.0',
      description: 'REST API for a Tic Tac Toe game with in-memory storage, turn enforcement, and optional AI.',
    },
    tags: [
      { name: 'Health', description: 'Service health checks' },
      { name: 'Games', description: 'Tic Tac Toe game endpoints' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
