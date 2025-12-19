import { describe, it, expect, beforeAll } from 'vitest';

const baseUrl = process.env.API_URL || 'http://localhost:3000';

// Helper to wait for server to be ready
async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${baseUrl}/api?url=www.google.com`);
      if (res.ok) return true;
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

describe('API Endpoints', () => {
  beforeAll(async () => {
    const serverReady = await waitForServer();
    if (!serverReady) {
      throw new Error('Backend server is not available. Make sure to start it with: cd backend && npm start');
    }
  });

  it('www.google.com should be online', async () => {
    const res = await fetch(`${baseUrl}/api?url=www.google.com`);
    const json = await res.json();
    expect(res.status).toEqual(200);
    expect(json.status).toBe(true);
    expect(json.latency).toBeLessThan(1000);
  });
});

