import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_ACCESS_SECRET || (() => { 
      throw new Error('CRITICAL: JWT_ACCESS_SECRET is not defined in .env! This is required for security.'); 
    })(),
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '24h',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  app: {
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:5000',
    systemAdminEmail: process.env.SYSTEM_ADMIN_EMAIL || 'admin@vertical.ai',
  },
};
