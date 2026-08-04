const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const serverUrl = process.env.SWAGGER_SERVER_URL || 'http://localhost:5000';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'OMS Backend API',
    version: '1.0.0',
    description: 'API documentation for the Order Management System',
  },
  servers: [
    {
      url: serverUrl,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
