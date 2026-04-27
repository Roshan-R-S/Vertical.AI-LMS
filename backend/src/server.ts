import app from './app';
import { initCronJobs } from './cron/meetings.cron';
import { prisma } from './prisma';
// reload 4

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('DEBUG: Server restarted at', new Date().toISOString());
  console.log('DEBUG: FRONTEND_URL =', process.env.FRONTEND_URL);
  
  // Start the background workers
  initCronJobs();
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n[${signal}] signal received: Closing CRM server...`);
  server.close(async () => {
    console.log('CRM HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
