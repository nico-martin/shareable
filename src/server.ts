import express from 'express';
import { initCache } from './utils/cache';
import libraryRouter from './routes/library';
import renderRouter from './routes/render';
import healthRouter from './routes/health';

const app = express();
const PORT = parseInt(process.env.PORT || '7777', 10);

// Initialize cache directory
initCache();

// Middleware
app.use(express.json());

// Routes
app.use(libraryRouter);
app.use(renderRouter);
app.use(healthRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Shareable running on http://localhost:${PORT}`);
  console.log(`- Library available at: http://localhost:${PORT}/library.js`);
  console.log(`- Library (minified) at: http://localhost:${PORT}/library.min.js`);
  console.log(`- Render endpoint: http://localhost:${PORT}/render?url=YOUR_URL`);
});
