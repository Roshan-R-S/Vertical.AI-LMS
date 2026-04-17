import app from './app';
import { initCronJobs } from './cron/meetings.cron';
import { prisma } from './prisma';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('DEBUG: Server restarted at', new Date().toISOString());
  
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
