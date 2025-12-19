const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy /api requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('[PROXY] Proxying:', req.method, req.url, '→', 'http://localhost:8001' + req.url);
      },
      onError: (err, req, res) => {
        console.error('[PROXY ERROR]:', err.message);
        res.status(500).json({ error: 'Proxy error', details: err.message });
      }
    })
  );
};
