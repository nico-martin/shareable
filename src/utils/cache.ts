import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const CACHE_DIR = path.join(process.cwd(), 'cache');

// Ensure cache directory exists
export function initCache(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// Generate cache key from URL and format
export function getCacheKey(url: string, format: string = 'og'): string {
  const cacheString = `${url}_${format}`;
  return crypto.createHash('md5').update(cacheString).digest('hex');
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
