// Singleton cache instance for website snapshots
const snapshotCache = new Map();

// Failure cache: tracks failed snapshot attempts with timestamps
// Format: Map<url, { timestamp: number, attempts: number }>
const failureCache = new Map();

// Cooldown period in milliseconds (default: 10 minutes)
export const FAILURE_COOLDOWN_MS = parseInt(process.env.SNAPSHOT_FAILURE_COOLDOWN_MS || '600000', 10);

/**
 * Check if a URL has failed recently and is still in cooldown
 * @param {string} url - The URL to check
 * @returns {boolean} - True if URL failed recently and is in cooldown
 */
export function isInFailureCooldown(url) {
  const failure = failureCache.get(url);
  if (!failure) return false;
  
  const timeSinceFailure = Date.now() - failure.timestamp;
  return timeSinceFailure < FAILURE_COOLDOWN_MS;
}

/**
 * Record a failed snapshot attempt
 * @param {string} url - The URL that failed
 */
export function recordFailure(url) {
  const existing = failureCache.get(url);
  failureCache.set(url, {
    timestamp: Date.now(),
    attempts: existing ? existing.attempts + 1 : 1
  });
}

/**
 * Clear failure record for a URL (when snapshot succeeds)
 * @param {string} url - The URL that succeeded
 */
export function clearFailure(url) {
  failureCache.delete(url);
}

/**
 * Get failure info for a URL
 * @param {string} url - The URL to check
 * @returns {Object|null} - Failure info or null if no failure recorded
 */
export function getFailureInfo(url) {
  return failureCache.get(url) || null;
}

export default snapshotCache;
