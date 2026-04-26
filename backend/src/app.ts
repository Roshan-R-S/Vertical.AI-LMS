import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';

import authRouter       from './modules/auth/auth.router';
import usersRouter      from './modules/users/users.router';
import leadsRouter      from './modules/leads/leads.router';
import tasksRouter      from './modules/tasks/tasks.router';
import clientsRouter    from './modules/clients/clients.router';
import invoicesRouter   from './modules/invoices/invoices.router';
import analyticsRouter  from './modules/analytics/analytics.router';
import milestonesRouter from './modules/milestones/milestones.router';
import dispositionsRouter from './modules/dispositions/dispositions.router';
import attachmentsRouter from './modules/attachments/attachments.router';
import auditLogsRouter  from './modules/audit-logs/audit-logs.router';
import notificationsRouter from './modules/notifications/notifications.router';
import settingsRouter from './modules/settings/settings.router';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'cross-origin'),
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/v1/auth',          authRouter);

// Protect all following routes
app.use(authMiddleware);

app.use('/api/v1/users',         usersRouter);
app.use('/api/v1/leads',         leadsRouter);
app.use('/api/v1/tasks',         tasksRouter);
app.use('/api/v1/clients',       clientsRouter);
app.use('/api/v1/invoices',      invoicesRouter);
app.use('/api/v1/analytics',     analyticsRouter);
app.use('/api/v1/milestones',    milestonesRouter);
app.use('/api/v1/dispositions',  dispositionsRouter);
app.use('/api/v1',               attachmentsRouter);
app.use('/api/v1/audit-logs',    auditLogsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/settings',      settingsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `No route matched: ${req.method} ${req.originalUrl}` });
});

app.use(errorMiddleware);

export default app;
