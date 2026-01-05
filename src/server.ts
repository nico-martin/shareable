import express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { initCache } from './utils/cache';
import libraryRouter from './routes/library';
import renderRouter from './routes/render';
import healthRouter from './routes/health';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);
const VERSION = packageJson.version;

// Initialize cache directory
initCache();

// Middleware
app.use(express.json());

// Routes
// Root endpoint - returns version
app.get('/', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  res.json({
    name: packageJson.name,
    version: VERSION,
    status: 'ok',
    timestamp: new Date().toISOString(),
    urls: {
      library: `${baseUrl}/library.js`,
      libraryMinified: `${baseUrl}/library.min.js`,
      render: `${baseUrl}/render?url=YOUR_URL`
    }
  });
});

app.use(libraryRouter);
app.use(renderRouter);
app.use(healthRouter);

// Serve static files from root directory (for example.html and other static files)
app.use(express.static(join(__dirname, '..')));

// Start the server
app.listen(PORT, () => {
  console.log(`Shareable running on http://localhost:${PORT}`);
  console.log(`- Library available at: http://localhost:${PORT}/library.js`);
  console.log(`- Library (minified) at: http://localhost:${PORT}/library.min.js`);
  console.log(`- Render endpoint: http://localhost:${PORT}/render?url=YOUR_URL`);
  console.log(`- Example page: http://localhost:${PORT}/example.html`);
});
