import { assert, expect, test, it } from 'vitest';

test('ping API endpoint', async () => {
  it('www.google.com should be online', async () => {
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api?url=www.google.com`);
    const json = await res.json();
    expect(res.status).toEqual(200);
    assert.isTrue(json.status);
    assert.isBelow(json.latency, 100);
  });
});

