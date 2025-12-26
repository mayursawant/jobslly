const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    const proxy = createProxyMiddleware({
        target: 'http://localhost:8000',
        changeOrigin: true,
        logLevel: 'debug'
    });

    app.use((req, res, next) => {
        if (req.url.startsWith('/api') || req.url.startsWith('/sitemap.xml')) {
            return proxy(req, res, next);
        }
        next();
    });
};
