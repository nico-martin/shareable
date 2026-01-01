import { Router, Request, Response } from 'express';
import puppeteer, { Browser } from 'puppeteer';
import {
  getCacheKey,
  getCachePath,
  cacheExists,
  readCache,
  writeCache
} from '../utils/cache';
import { isUrlAllowed, getAllowedHosts } from '../utils/hosts';

const router = Router();

// Render endpoint - takes a URL, adds #og, renders in OG size, and returns screenshot
router.get('/render', async (req: Request, res: Response) => {
  const { url, rebuild, skipTemplateCheck, format } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  const shouldSkipTemplateCheck = skipTemplateCheck === 'true' || skipTemplateCheck === '1';

  // Determine format (og or twitter)
  const imageFormat = (format === 'twitter' || format === 'og') ? format : 'og';

  // Set dimensions based on format
  // OG: 1200x630 (standard Open Graph)
  // Twitter: 1200x628 (summary_large_image)
  const dimensions = imageFormat === 'twitter'
    ? { width: 1200, height: 628 }
    : { width: 1200, height: 630 };

  // Validate URL is from an allowed host
  if (!isUrlAllowed(url)) {
    const allowedHosts = getAllowedHosts();
    console.log(`[Render] Blocked unauthorized host: ${url}`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This URL is not allowed to be rendered',
      allowedHosts: allowedHosts.length > 0 ? allowedHosts : ['All hosts allowed']
    });
  }

  const shouldRebuild = rebuild === 'true' || rebuild === '1';
  const cacheKey = getCacheKey(url, imageFormat);
  const cachePath = getCachePath(cacheKey);

  // Check if we have a cached version and don't need to rebuild
  if (!shouldRebuild && cacheExists(cacheKey)) {
    console.log(`[Cache] Serving cached version for: ${url} (${imageFormat})`);
    const cachedImage = readCache(cacheKey);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('X-Cache', 'HIT');
    return res.send(cachedImage);
  }

  console.log(`[Cache] Generating new screenshot for: ${url} (${imageFormat} ${dimensions.width}x${dimensions.height})`);
  let browser: Browser | undefined;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport based on format
    await page.setViewport({
      width: dimensions.width,
      height: dimensions.height,
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

    // Check if template content was rendered (unless skipped)
    // Note: library.js removes the template and replaces body content, so we check if body has content
    if (!shouldSkipTemplateCheck) {
      const hasContent = await page.evaluate(() => {
        // @ts-ignore - document is available in browser context
        const bodyText = (document as any).body.innerText.trim();
        // @ts-ignore
        const hasElements = (document as any).body.children.length > 0;
        return bodyText.length > 0 || hasElements;
      });

      if (!hasContent) {
        console.log(`[Render] No rendered content found on page: ${url}`);
        await browser.close();
        return res.status(404).json({
          error: 'Template not found',
          message: 'No content was rendered. Make sure the page has a <template data-shareable> element and library.js is loaded.'
        });
      }
    } else {
      console.log(`[Render] Skipping template check for: ${url}`);
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
