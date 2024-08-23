import express from 'express';
import { ping } from '@network-utils/tcp-ping'
const app = express();

const SERVER_PORT = 3000
const PORT = 80
const TIMEOUT = 10000
const ATTEMPTS = 3

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

app.listen(SERVER_PORT, () => {
  console.log(`Local API Server listening on port ${SERVER_PORT}`);
})