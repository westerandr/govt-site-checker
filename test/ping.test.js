import { handler } from '../netlify/functions/ping'
import { assert, expect, test, it } from 'vitest';

test('ping function', async () => {
  it('www.google.com should be online', async () => {
    const res = await handler({ queryStringParameters: { url: "www.google.com"} }, null)
    const { statusCode, body } = res
    const json = JSON.parse(body)
    expect(statusCode).toEqual(200)
    assert.isTrue(json.status)
    assert.isBelow(json.latency, 100)
  })
})

