const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('✅ Setting up proxy: /api → http://localhost:8001/api');
  
  // Proxy /api requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      pathRewrite: {
        '^/api': '/api' // Keep /api prefix
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('[PROXY] →', req.method, req.url, '→', 'http://localhost:8001' + req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('[PROXY] ←', proxyRes.statusCode, req.url);
      },
      onError: (err, req, res) => {
        console.error('[PROXY ERROR]:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy error', details: err.message }));
      }
    })
  );
};
