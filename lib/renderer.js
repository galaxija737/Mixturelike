const fs = require('fs');
const path = require('path');
const { Liquid } = require('liquidjs');

const engine = new Liquid({
  root: path.resolve(__dirname, '../renderer'),
  extname: '.liquid'
});

async function renderFile(inputPath, outputDir) {
  const fileContent = fs.readFileSync(inputPath, 'utf-8');
  let html = await engine.parseAndRender(fileContent, {
    title: 'Mixturelike Preview'
  });

  // Inject livereload script at the end of <body>
  const reloadScript = `<script src="http://localhost:35729/livereload.js?snipver=1"></script>`;
  html = html.replace('</body>', `${reloadScript}</body>`); // safest spot

  const fileName = path.basename(inputPath, '.liquid') + '.html';
  const outputPath = path.join(outputDir, fileName);

  fs.writeFileSync(outputPath, html);
  console.log(`Rendered: ${inputPath} → ${outputPath}`);
}

module.exports = { renderFile };
