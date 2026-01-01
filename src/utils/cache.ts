import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const CACHE_DIR = path.join(process.cwd(), '.cache');

// Ensure cache directory exists
export function initCache(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true, mode: 0o777 });
  }
  // Ensure the directory is writable
  try {
    fs.accessSync(CACHE_DIR, fs.constants.W_OK);
  } catch (err) {
    console.warn(`Warning: Cache directory ${CACHE_DIR} is not writable. Cache may not work properly.`);
  }
}

// Generate cache key from URL
export function getCacheKey(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

// Get cache file path
export function getCachePath(cacheKey: string): string {
  return path.join(CACHE_DIR, `${cacheKey}.png`);
}

// Check if cache exists
export function cacheExists(cacheKey: string): boolean {
  return fs.existsSync(getCachePath(cacheKey));
}

// Read from cache
export function readCache(cacheKey: string): Buffer {
  return fs.readFileSync(getCachePath(cacheKey));
}

// Write to cache
export function writeCache(cacheKey: string, data: Buffer): void {
  fs.writeFileSync(getCachePath(cacheKey), data);
}
