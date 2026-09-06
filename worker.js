// Cloudflare Worker Proxy for DownloadEverything
// Deploy at: https://workers.cloudflare.com

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Health check
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'DE Proxy is running',
        service: 'defe-proxy',
        endpoint: '/'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Proxy POST to slave API
    const targetUrl = 'https://slave.downloadeverythingfromeverywhere.com/';

    try {
      const body = await request.text();

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://downloadeverythingfromeverywhere.com',
          'Referer': 'https://downloadeverythingfromeverywhere.com/',
          'DNT': '1',
        },
        body: body,
      });

      const respBody = await response.text();

      return new Response(respBody, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
