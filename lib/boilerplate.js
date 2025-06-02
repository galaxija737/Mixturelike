const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createProjectFromBoilerplate(boilerplateName, targetPath) {
  const sourcePath = path.join(__dirname, '../boilerplates', boilerplateName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Boilerplate "${boilerplateName}" does not exist.`);
  }
  copyRecursiveSync(sourcePath, targetPath);
}

module.exports = {
  createProjectFromBoilerplate
};
