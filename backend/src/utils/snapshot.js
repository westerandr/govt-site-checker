import puppeteer from 'puppeteer';

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const TIMEOUT = 10000;

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to capture website snapshot
export async function captureSnapshot(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--ignore-ssl-errors'
      ],
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    
    // Ignore SSL certificate errors on the page level
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });
    
    // Set viewport size for consistent snapshots
    await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
    
    // Navigate to the website with increased timeout and more lenient wait strategy
    try {
      await page.goto(`https://${url}`, { 
        waitUntil: 'networkidle2',
        timeout: TIMEOUT
      });
    } catch (error) {
        await page.goto(`https://${url}`, {
          waitUntil: 'load',
          timeout: TIMEOUT
        });
    }
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      fullPage: false,
      clip: { x: 0, y: 0, width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }
    });
    
    return `data:image/png;base64,${screenshot}`;
  } catch (error) {
    console.error(`Error capturing snapshot for ${url}:`, error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
