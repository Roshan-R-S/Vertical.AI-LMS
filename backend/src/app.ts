import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { config } from './config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorMiddleware } from './middleware/error.middleware';
import authRouter from './modules/auth/auth.router';
import leadsRouter from './modules/leads/leads.router';
import usersRouter from './modules/users/users.router';
import analyticsRouter from './modules/analytics/analytics.router';
import tasksRouter from './modules/tasks/tasks.router';
import attachmentsRouter from './modules/attachments/attachments.router';
import auditLogsRouter from './modules/audit-logs/audit-logs.router';
import clientsRouter from './modules/clients/clients.router';
import invoicesRouter from './modules/invoices/invoices.router';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/leads', leadsRouter);
app.use('/api/v1', attachmentsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/audit-logs', auditLogsRouter);
app.use('/api/v1/clients', clientsRouter);
app.use('/api/v1/invoices', invoicesRouter);

app.use(errorMiddleware);

export default app;