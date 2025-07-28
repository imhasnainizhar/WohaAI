const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = 3000;

app.use('/', createProxyMiddleware({
    target: 'http://rendering_service:4000',
    changeOrigin: true,
    logLevel: 'debug',
  }));
  
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`API Gateway running at http://localhost:${PORT}`);
});
