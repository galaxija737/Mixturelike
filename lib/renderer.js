const fs = require('fs');
const path = require('path');
const { Liquid } = require('liquidjs');
const matter = require('gray-matter');

async function renderFile(inputPath, outputDir, projectRoot) {
  if (!inputPath || !outputDir || !projectRoot) {
    console.warn('⚠️ renderFile() missing parameters:', {
      inputPath,
      outputDir,
      projectRoot
    });
    return;
  }

  const engine = new Liquid({
    root: [
      path.join(projectRoot, '_includes'),
      path.join(projectRoot, '_layouts')
    ],
    extname: '.liquid'
  });

  const rawContent = fs.readFileSync(inputPath, 'utf-8');
  const { content, data } = matter(rawContent);

  let html;

  try {
    if (data.layout) {
      const pageHTML = await engine.parseAndRender(content, data);
      html = await engine.renderFile(`${data.layout}.liquid`, {
        ...data,
        content: pageHTML
      });
    } else {
      html = await engine.parseAndRender(content, data);
    }

    // Inject livereload script
    const reloadScript = `<script src="http://localhost:35729/livereload.js?snipver=1"></script>`;
    html = html.replace('</body>', `${reloadScript}</body>`);

    const fileName = path.basename(inputPath, '.liquid') + '.html';
    const outputPath = path.join(outputDir, fileName);
    fs.writeFileSync(outputPath, html);

    console.log(`📝 ${inputPath} rendered → ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed to render ${inputPath}:`, err.message);
  }
}

module.exports = { renderFile };
