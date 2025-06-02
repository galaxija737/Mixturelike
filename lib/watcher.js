const path = require('path');
const chokidar = require('chokidar');
const { renderFile } = require('./renderer');
const sass = require('sass');
const fs = require('fs');

function compileSCSS(filePath, outputDir) {
  const result = sass.compile(filePath);
  const fileName = path.basename(filePath, '.scss') + '.css';
  const outputPath = path.join(outputDir, fileName);
  fs.writeFileSync(outputPath, result.css);
  console.log(`Compiled: ${filePath} → ${outputPath}`);
}

function watchFolder(folderPath, outputDir) {
  console.log(`👀 Watching folder: ${folderPath}`);

  chokidar.watch(folderPath, {
    ignored: /(^|[/\\])\../,
    persistent: true,
    ignoreInitial: true
  }).on('change', async (filePath) => {
    const ext = path.extname(filePath);
    console.log(`🔄 File changed: ${filePath}`);

    if (ext === '.liquid') {
      await renderFile(filePath, outputDir);
    } else if (ext === '.scss') {
      compileSCSS(filePath, outputDir);
    }
  });
}

module.exports = { watchFolder, compileSCSS };
