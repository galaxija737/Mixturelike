const path = require('path');
const livereload = require('livereload');
const connect = require('connect');
const serveStatic = require('serve-static');
const http = require('http');

let liveServer, staticServer;

async function startPreview(outputDir) {
  // 1. Start livereload watcher
  if (!liveServer) {
    liveServer = livereload.createServer({ exts: ['html', 'css'], delay: 100 });
    liveServer.watch(outputDir);
  }

  // 2. Serve output folder over HTTP
  if (!staticServer) {
    const app = connect().use(serveStatic(outputDir));
    staticServer = http.createServer(app);
    staticServer.listen(3000, () => {
      console.log('📡 Preview server running at http://localhost:3000');
    });
  }

  // 3. Open default browser to served HTML
  const { default: open } = await import('open');
  open('http://localhost:3000/index.html');
}

module.exports = { startPreview };
