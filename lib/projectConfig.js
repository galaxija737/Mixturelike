const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function getConfigPath(projectPath) {
  return path.join(projectPath, '.mlconfig.json');
}

function configExists(projectPath) {
  return fs.existsSync(getConfigPath(projectPath));
}

function createConfig(projectPath, name, boilerplate = '', description = '', thumbnail = 'thumbnail.png') {
  const config = {
    id: uuidv4(),
    name,
    path: projectPath,
    boilerplate,
    description,
    thumbnail,
    lastOpened: new Date().toISOString()
  };
  fs.writeFileSync(getConfigPath(projectPath), JSON.stringify(config, null, 2));
  return config;
}

function readConfig(projectPath) {
  const filePath = getConfigPath(projectPath);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

module.exports = {
  getConfigPath,
  configExists,
  createConfig,
  readConfig
};
