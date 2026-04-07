import app from './app';
import { initCronJobs } from './cron/meetings.cron';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('DEBUG: Server restarted at', new Date().toISOString());
  
  // Start the background workers
  initCronJobs();
});
// Triggering a reload for diagnostic logging...
