const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy ALL routes to backend for SSR
  // This ensures the React dev server (port 3000) serves SSR content from backend (port 8001)
  
  // For job category pages and job detail pages, proxy to backend
  app.use(
    '/jobs',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
      ws: true,
      // Don't proxy if it's a hot-reload websocket connection
      bypass: function(req, res) {
        if (req.headers.upgrade === 'websocket') {
          return false;
        }
      }
    })
  );

  // Proxy API routes
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
      ws: true,
    })
  );

  // Proxy sitemap
  app.use(
    '/sitemap.xml',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
    })
  );

  // Proxy robots.txt
  app.use(
    '/robots.txt',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
    })
  );
};
