import type { APIRoute } from 'astro';
import { probe } from '@network-utils/tcp-ping'

const HTTP_PORT = 80

export const get: APIRoute = async function get ({params, request}) {

  if(!request.url.includes("?")) return new Response(null, { status: 400})

  const queryString = request.url.split("?")[1]
  const [query, url] = queryString.split('=')
  if(query !== 'url') return new Response(null, { status: 400 })

  const online = await probe(HTTP_PORT, url)

  return new Response(JSON.stringify({ status: online}), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}