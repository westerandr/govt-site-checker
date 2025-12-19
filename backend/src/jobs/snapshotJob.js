import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { captureSnapshot } from '../utils/snapshot.js';
import snapshotCache, { recordFailure, clearFailure } from '../cache/snapshotCache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load sites data
const sitesData = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'frontend', 'src', 'assets', 'sites.json'), 'utf-8')
);

// Async task to capture snapshots for all sites
export async function captureAllSnapshots() {
  console.log('Starting snapshot capture for all sites...');
  const sites = sitesData.sites || [];
  
  // Always refresh all snapshots (not just missing ones) for daily updates
  for (const site of sites) {
    const url = site.site;
    console.log(`Capturing snapshot for ${url}...`);
    try {
      const snapshot = await captureSnapshot(url);
      if (snapshot) {
        snapshotCache.set(url, snapshot);
        clearFailure(url); // Clear any previous failure record
        console.log(`Snapshot cached for ${url}`);
      } else {
        recordFailure(url);
        console.log(`Snapshot capture failed for ${url}`);
      }
    } catch (error) {
      recordFailure(url);
      console.error(`Error capturing snapshot for ${url}:`, error.message);
    }
  }
  
  console.log(`Snapshot capture completed. Cache size: ${snapshotCache.size}`);
}

// Capture snapshot for a single URL (on-demand)
export async function captureSnapshotForUrl(url) {
  console.log(`Capturing on-demand snapshot for ${url}...`);
  try {
    const snapshot = await captureSnapshot(url);
    if (snapshot) {
      snapshotCache.set(url, snapshot);
      clearFailure(url); // Clear any previous failure record
      console.log(`Snapshot cached for ${url}`);
      return snapshot;
    } else {
      // Capture returned null (failed)
      recordFailure(url);
      console.log(`Snapshot capture failed for ${url}`);
      return null;
    }
  } catch (error) {
    // Exception during capture
    recordFailure(url);
    console.error(`Error capturing snapshot for ${url}:`, error.message);
    return null;
  }
}
