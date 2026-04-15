const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 4173;
const ROOT = path.join(__dirname, '..', 'www');
const DEFAULT_FILE = 'download.html';

function getLocalAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name]) {
      if (info.family === 'IPv4' && !info.internal) {
        addresses.push(info.address);
      }
    }
  }
  return addresses;
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.apk': 'application/vnd.android.package-archive',
      '.exe': 'application/vnd.microsoft.portable-executable',
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let requestPath = req.url.split('?')[0];
  if (requestPath === '/' || requestPath === '') {
    requestPath = '/' + DEFAULT_FILE;
  }

  const safePath = path.normalize(requestPath).replace(/^\.+/, '');
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Bad Request');
  }
  sendFile(filePath, res);
});

server.listen(PORT, '0.0.0.0', () => {
  const addresses = getLocalAddresses();
  console.log('Static server started.');
  console.log(`Serving: ${ROOT}`);
  console.log(`Default page: http://localhost:${PORT}/${DEFAULT_FILE}`);
  if (addresses.length) {
    addresses.forEach((address) => {
      console.log(`Share URL: http://${address}:${PORT}/${DEFAULT_FILE}`);
    });
  } else {
    console.log('No local network address found. Use localhost or configure your network.');
  }
  console.log('\nPress Ctrl+C to stop.');
});
