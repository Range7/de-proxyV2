const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: '*'
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'DE Proxy is running', 
    service: 'defe-proxy-railway',
    endpoint: '/'
  });
});

app.post('/', async (req, res) => {
  const targetUrl = 'https://slave.downloadeverythingfromeverywhere.com/';

  try {
    console.log('[PROXY] Received body:', JSON.stringify(req.body));

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://downloadeverythingfromeverywhere.com',
        'Referer': 'https://downloadeverythingfromeverywhere.com/',
        'DNT': '1',
      },
      body: JSON.stringify(req.body),
      timeout: 20000
    });

    const body = await response.text();
    console.log('[PROXY] Slave status:', response.status, 'len:', body.length);

    res.status(response.status);
    res.set('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(body);

  } catch (error) {
    console.error('[PROXY] Error:', error.message);
    res.status(500).json({ error: 'Proxy failed', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`DE Proxy running on port ${PORT}`);
});
