import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lendkraft LMS API',
      version: '1.0.0',
      description: 'API documentation for the Lendkraft Learning Management System',
      contact: {
        name: 'API Support',
        email: config.app.systemAdminEmail,
      },
    },
    servers: [
      {
        url: config.app.baseUrl,
        description: 'Development server',
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
  },
  apis: ['./src/app.ts', './src/modules/**/*.router.ts', './src/modules/**/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
