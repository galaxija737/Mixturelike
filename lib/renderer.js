const fs = require('fs');
const path = require('path');
const { Liquid } = require('liquidjs');

const engine = new Liquid({
  root: path.resolve(__dirname, '../renderer'), // base path for includes
  extname: '.liquid'
});

async function renderFile(inputPath, outputDir) {
  const fileContent = fs.readFileSync(inputPath, 'utf-8');
  const html = await engine.parseAndRender(fileContent, {
    // you can pass variables here
    title: 'Mixturelike Preview'
  });

  const fileName = path.basename(inputPath, '.liquid') + '.html';
  const outputPath = path.join(outputDir, fileName);

  fs.writeFileSync(outputPath, html);
  console.log(`Rendered: ${inputPath} → ${outputPath}`);
}

module.exports = { renderFile };
