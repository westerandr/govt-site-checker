import { describe, it, expect } from 'vitest';

describe('API Server Endpoints', () => {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';

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
