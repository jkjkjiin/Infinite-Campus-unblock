const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 8080;
const PROXY_TARGET = process.env.PROXY_TARGET || 'http://localhost:3000';
const PROXY_PATH = process.env.PROXY_PATH || '/api';

const app = express();

app.use(cors());

// Serve static files from repo root
app.use(express.static(path.join(__dirname), { index: false }));

// Serve index.html for / and /index.html
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback: serve index.html for all other GET requests that accept HTML
app.use((req, res, next) => {
  if (req.method === 'GET' && (req.headers.accept || '').includes('text/html')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  next();
});

// Proxy API requests
app.use(PROXY_PATH, createProxyMiddleware({
  target: PROXY_TARGET,
  changeOrigin: true,
  logLevel: 'warn',
}));

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://0.0.0.0:${PORT}`);
  console.log(`Proxying ${PROXY_PATH} -> ${PROXY_TARGET}`);
});
