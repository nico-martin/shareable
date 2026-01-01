import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { minify } from 'terser';

const router = Router();

// Cache for library content
let libraryCache: string | null = null;
let libraryMinCache: string | null = null;

// Get library file path
function getLibraryPath(): string {
  return path.join(__dirname, '../public/library.js');
}

// Read and cache library content
async function getLibraryContent(): Promise<string> {
  if (libraryCache) {
    return libraryCache;
  }

  const content = fs.readFileSync(getLibraryPath(), 'utf-8');
  libraryCache = content;
  return content;
}

// Read and cache minified library content
async function getLibraryMinContent(): Promise<string> {
  if (libraryMinCache) {
    return libraryMinCache;
  }

  const content = await getLibraryContent();
  const minified = await minify(content, {
    compress: true,
    mangle: true
  });

  libraryMinCache = minified.code || content;
  return libraryMinCache;
}

// Serve library.js
router.get('/library.js', async (req: Request, res: Response) => {
  try {
    const content = await getLibraryContent();
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(content);
  } catch (error) {
    console.error('Error serving library.js:', error);
    res.status(500).send('// Error loading library');
  }
});

// Serve library.min.js
router.get('/library.min.js', async (req: Request, res: Response) => {
  try {
    const content = await getLibraryMinContent();
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(content);
  } catch (error) {
    console.error('Error serving library.min.js:', error);
    res.status(500).send('// Error loading library');
  }
});

export default router;
