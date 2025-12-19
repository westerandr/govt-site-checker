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

describe('API Server Endpoints', () => {
  beforeAll(async () => {
    const serverReady = await waitForServer();
    if (!serverReady) {
      throw new Error('Backend server is not available. Make sure to start it with: cd backend && npm start');
    }
  });

  describe('GET /api', () => {
    it('should return 400 if url parameter is missing', async () => {
      const res = await fetch(`${baseUrl}/api`);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('url is required');
    });

    it('should return ping status and latency for valid URL', async () => {
      const res = await fetch(`${baseUrl}/api?url=www.google.com`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveProperty('status');
      expect(json).toHaveProperty('latency');
      expect(typeof json.status).toBe('boolean');
    });

    it('should include CORS headers in response', async () => {
      const res = await fetch(`${baseUrl}/api?url=www.google.com`);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('GET /api/snapshot', () => {
    it('should return 400 if url parameter is missing', async () => {
      const res = await fetch(`${baseUrl}/api/snapshot`);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('url is required');
    });

    it('should return snapshot data structure when url is provided', async () => {
      const res = await fetch(`${baseUrl}/api/snapshot?url=www.google.com`);
      // May return 200 (cached), 503 (cooldown), or 503 (failed)
      // Just check it returns a valid response structure
      expect([200, 503]).toContain(res.status);
      if (res.status === 200) {
        const json = await res.json();
        expect(json).toHaveProperty('snapshot');
      }
    });
  });
});
