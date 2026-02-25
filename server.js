import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 8080;
const distDir = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.webm': 'audio/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (req.method === 'GET' && url.startsWith('/api/health')) {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'anubisai',
      geminiClientSide: true,
      time: new Date().toISOString()
    });
  }

  const cleanPath = url.split('?')[0];
  const relPath = cleanPath === '/' ? '/index.html' : cleanPath;
  const filePath = path.join(distDir, relPath);
  const safePath = path.normalize(filePath);

  if (!safePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(safePath, (error, content) => {
    if (!error) {
      const extname = path.extname(safePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[extname] || 'application/octet-stream' });
      res.end(content);
      return;
    }

    if (error.code !== 'ENOENT') {
      res.writeHead(500);
      res.end('Internal server error');
      return;
    }

    const fallback = path.join(distDir, 'index.html');
    fs.readFile(fallback, (fallbackError, fallbackContent) => {
      if (fallbackError) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fallbackContent);
    });
  });
});

server.listen(port, () => {
  console.log(`Anubis AI server listening on port ${port}`);
});
