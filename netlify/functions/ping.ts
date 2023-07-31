import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { ping, type IPingResult } from "@network-utils/tcp-ping";

const PORT = 80
const TIMEOUT = 10000
const ATTEMPTS = 3

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const url = event.queryStringParameters?.url
  if(!url){
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Provide a url query parameter'})
    }
  }

  const pingResult: IPingResult = await ping({address: url, port: PORT, timeout: TIMEOUT, attempts: ATTEMPTS});
  const data = {
    status: pingResult.errors.length === 0,
    latency: pingResult.averageLatency,
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};

export { handler };
