import 'dotenv/config';
import express from 'express';
import { ping } from '@network-utils/tcp-ping';
import snapshotCache, { isInFailureCooldown, getFailureInfo, FAILURE_COOLDOWN_MS } from './cache/snapshotCache.js';
import { captureSnapshotForUrl, captureAllSnapshots } from './jobs/snapshotJob.js';

const app = express();

const SERVER_PORT = process.env.BACKEND_PORT || 3000;
const PORT = 80;
const TIMEOUT = 2000;
const ATTEMPTS = 1;

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api', async (req, res) => {
  try {
    const url = req.query?.url;
    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    const pingResult = await ping({ address: url, port: PORT, timeout: TIMEOUT, attempts: ATTEMPTS });
    const data = {
      status: pingResult.errors.length === 0,
      latency: pingResult.averageLatency,
    };

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

    // Check if URL is in failure cooldown (recently failed)
    if (isInFailureCooldown(url)) {
      const failureInfo = getFailureInfo(url);
      const minutesAgo = Math.floor((Date.now() - failureInfo.timestamp) / 60000);
      return res.status(503).json({ 
        error: 'Snapshot capture failed recently',
        message: `Snapshot capture failed ${minutesAgo} minute(s) ago. Please try again later.`,
        retryAfter: failureInfo.timestamp + FAILURE_COOLDOWN_MS - Date.now() // milliseconds until cooldown expires
      });
    }

    // If not in cache and not in cooldown, capture it on-demand
    console.log(`Cache miss for ${url}, capturing snapshot...`);
    const snapshot = await captureSnapshotForUrl(url);
    if (snapshot) {
      return res.status(200).json({ snapshot });
    }

    // Capture failed - failure is already recorded by captureSnapshotForUrl
    return res.status(503).json({ 
      error: 'Snapshot capture failed',
      message: 'Unable to capture snapshot. Please try again later.'
    });
  } catch (error) {
    console.error('Error serving snapshot:', error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Initialize snapshot capture on startup (non-blocking)
async function initializeSnapshots() {
  console.log('Starting initial snapshot capture for all sites...');
  try {
    // Run in background, don't wait for completion
    captureAllSnapshots().catch(err => {
      console.error('Error during initial snapshot capture:', err);
    });
  } catch (err) {
    console.error('Error starting initial snapshot capture:', err);
  }
}

// Start the server
async function startServer() {
  // Initialize snapshots on startup (runs in background)
  initializeSnapshots();
  
  // Start the web server
  app.listen(SERVER_PORT, () => {
    console.log(`API Server listening on port ${SERVER_PORT}`);
    console.log('Snapshot capture initialized on startup');
  });
}

startServer();
