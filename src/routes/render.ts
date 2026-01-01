import { Router, Request, Response } from 'express';
import puppeteer, { Browser } from 'puppeteer';
import {
  getCacheKey,
  getCachePath,
  cacheExists,
  readCache,
  writeCache
} from '../utils/cache';

const router = Router();

// Render endpoint - takes a URL, adds #og, renders in OG size, and returns screenshot
router.get('/render', async (req: Request, res: Response) => {
  const { url, rebuild } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  const shouldRebuild = rebuild === 'true' || rebuild === '1';
  const cacheKey = getCacheKey(url);
  const cachePath = getCachePath(cacheKey);

  // Check if we have a cached version and don't need to rebuild
  if (!shouldRebuild && cacheExists(cacheKey)) {
    console.log(`[Cache] Serving cached version for: ${url}`);
    const cachedImage = readCache(cacheKey);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('X-Cache', 'HIT');
    return res.send(cachedImage);
  }

  console.log(`[Cache] Generating new screenshot for: ${url}`);
  let browser: Browser | undefined;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to OG image size (1200x630 is the standard)
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 1
    });

    // Add #render-shareable hash to the URL
    const targetUrl = url.includes('#') ? url.replace(/#.*$/, '#render-shareable') : url + '#render-shareable';

    // Navigate to the URL
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait a bit for any animations or dynamic content
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if template[data-shareable] exists on the page
    const hasTemplate = await page.evaluate(() => {
      // @ts-ignore - document is available in browser context
      return document.querySelector('template[data-shareable]') !== null;
    });

    if (!hasTemplate) {
      console.log(`[Render] No template[data-shareable] found on page: ${url}`);
      await browser.close();
      return res.status(404).json({
        error: 'Template not found',
        message: 'No <template data-shareable> element found on the page'
      });
    }

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });

    // Convert to Buffer and save to cache
    const screenshotBuffer = Buffer.from(screenshot);
    writeCache(cacheKey, screenshotBuffer);
    console.log(`[Cache] Saved to cache: ${cachePath}`);

    // Set proper headers and send the image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('X-Cache', 'MISS');
    res.send(screenshotBuffer);

  } catch (error) {
    console.error('Error rendering page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to render page',
      message: errorMessage
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

export default router;
