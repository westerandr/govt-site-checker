import puppeteer from 'puppeteer';

const WAIT_UNTIL = 'networkidle2';
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
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to the website with increased timeout and more lenient wait strategy
    try {
      await page.goto(`https://${url}`, { 
        waitUntil: WAIT_UNTIL,
        timeout: TIMEOUT
      });
    } catch (error) {
      // If domcontentloaded fails, try with load event
      try {
        await page.goto(`https://${url}`, {
          waitUntil: 'load',
          timeout: TIMEOUT
        });
      } catch (retryError) {
        // If both fail, try with networkidle2 (most lenient valid option)
        await page.goto(`https://${url}`, {
          waitUntil: 'networkidle2', // Wait until no more than 2 network connections
          timeout: TIMEOUT
        });
      }
    }
    
    // Wait a bit for any dynamic content to load
    await delay(2000);
    
    // Capture screenshot as base64 compressed PNG
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      fullPage: false, // Only capture viewport
      clip: { x: 0, y: 0, width: 1280, height: 720 }
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
