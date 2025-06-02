const fs = require('fs');
const path = require('path');
const { Liquid } = require('liquidjs');
const matter = require('gray-matter');

async function renderFile(inputPath, outputDir, projectRoot) {
  // Initialize engine with includes and layouts from the selected folder
  const engine = new Liquid({
    root: [
      path.join(projectRoot, '_includes'),
      path.join(projectRoot, '_layouts')
    ],
    extname: '.liquid'
  });

  // Read file and parse front matter
  const rawContent = fs.readFileSync(inputPath, 'utf-8');
  const { content, data } = matter(rawContent); // `data` contains front matter

  let html;

  if (data.layout) {
    // Render page content first
    const pageHTML = await engine.parseAndRender(content, data);

    // Then render layout, passing content into it
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

  // Determine output file path
  const fileName = path.basename(inputPath, '.liquid') + '.html';
  const outputPath = path.join(outputDir, fileName);

  fs.writeFileSync(outputPath, html);
  console.log(`📝 ${inputPath} rendered → ${outputPath}`);
}

module.exports = { renderFile };
