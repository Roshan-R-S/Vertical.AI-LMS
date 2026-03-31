import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('DEBUG: Server restarted at', new Date().toISOString());
});
// Triggering a reload for diagnostic logging...
