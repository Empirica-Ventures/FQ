const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = process.argv[2] || path.join(__dirname, '..', 'dist');
const port = process.argv[3] || 8843;

const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json',
};

// Vercel (and every other real host) compresses text responses in transit;
// this test server previously sent raw bytes, which made every Lighthouse/
// mobile_audit run against it measure a document transfer ~5-6x larger than
// what production actually ships (dist/index.html: 99KB raw vs ~15KB
// brotli) -- skewing every network-timing-dependent audit pessimistic.
// Only compress text types; images/fonts are already compressed formats
// (webp/woff2) where re-compressing wastes CPU for no size win.
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.svg', '.xml', '.txt', '.json']);

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(root, urlPath);
  if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found: ' + filePath); return; }
    const ext = path.extname(filePath);
    const headers = {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    };
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (COMPRESSIBLE.has(ext) && /\bbr\b/.test(acceptEncoding)) {
      headers['Content-Encoding'] = 'br';
      res.writeHead(200, headers);
      res.end(zlib.brotliCompressSync(data, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }));
    } else if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(acceptEncoding)) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      res.end(zlib.gzipSync(data, { level: 9 }));
    } else {
      res.writeHead(200, headers);
      res.end(data);
    }
  });
}).listen(port, () => console.log('serving', root, 'on', port));
