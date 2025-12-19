import { describe, it, expect } from 'vitest';

describe('API Endpoints', () => {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';

  it('www.google.com should be online', async () => {
    const res = await fetch(`${baseUrl}/api?url=www.google.com`);
    const json = await res.json();
    expect(res.status).toEqual(200);
    expect(json.status).toBe(true);
    expect(json.latency).toBeLessThan(1000);
  });
});

