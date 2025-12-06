import express from 'express';
import { ping } from '@network-utils/tcp-ping'
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const SERVER_PORT = 3000
const PORT = 80
const TIMEOUT = 2000
const ATTEMPTS = 1

// In-memory cache for website snapshots
const snapshotCache = new Map();

// Load sites data
const sitesData = JSON.parse(
  readFileSync(join(__dirname, 'src', 'assets', 'sites.json'), 'utf-8')
);

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to capture website snapshot
async function captureSnapshot(url) {
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
        waitUntil: 'domcontentloaded', // More lenient than 'networkidle0'
        timeout: 30000 // Increased from 10s to 30s
      });
    } catch (error) {
      // If domcontentloaded fails, try with load event
      try {
        await page.goto(`https://${url}`, {
          waitUntil: 'load',
          timeout: 30000
        });
      } catch (retryError) {
        // If both fail, try with networkidle2 (most lenient valid option)
        await page.goto(`https://${url}`, {
          waitUntil: 'networkidle2', // Wait until no more than 2 network connections
          timeout: 30000
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

// Async task to capture snapshots for all sites
async function captureAllSnapshots() {
  console.log('Starting snapshot capture for all sites...');
  const sites = sitesData.sites || [];
  
  for (const site of sites) {
    const url = site.site;
    if (!snapshotCache.has(url)) {
      console.log(`Capturing snapshot for ${url}...`);
      const snapshot = await captureSnapshot(url);
      if (snapshot) {
        snapshotCache.set(url, snapshot);
        console.log(`Snapshot cached for ${url}`);
      }
    }
  }
  
  console.log(`Snapshot capture completed. Cache size: ${snapshotCache.size}`);
}

// Capture snapshots on server start (non-blocking) and then periodically (every 30 minutes)
captureAllSnapshots().catch(err => {
  console.error('Error during initial snapshot capture:', err);
});
setInterval(() => {
  captureAllSnapshots().catch(err => {
    console.error('Error during periodic snapshot capture:', err);
  });
}, 30 * 60 * 1000); // 30 minutes

app.get('/api', async (req, res) => {
  try {
    const url = req.query?.url;
    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    const pingResult = await ping({ address: url, port: PORT, timeout: TIMEOUT, attempts: ATTEMPTS })
    const data = {
      status: pingResult.errors.length === 0,
      latency: pingResult.averageLatency,
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).send({ error: "Something went wrong" });
 }
});

// API endpoint to serve cached snapshots
app.get('/api/snapshot', async (req, res) => {
  try {
    const url = req.query?.url;
    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    // Check cache first
    if (snapshotCache.has(url)) {
      return res.status(200).json({ snapshot: snapshotCache.get(url) });
    }

    // If not in cache, try to capture it (this might take a while)
    const snapshot = await captureSnapshot(url);
    if (snapshot) {
      snapshotCache.set(url, snapshot);
      return res.status(200).json({ snapshot });
    }

    return res.status(404).json({ error: 'Snapshot not available' });
  } catch (error) {
    console.error('Error serving snapshot:', error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`Local API Server listening on port ${SERVER_PORT}`);
})