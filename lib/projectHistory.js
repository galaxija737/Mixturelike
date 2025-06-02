const path = require('path');
const fs = require('fs');

const historyPath = path.join(__dirname, '../data/projects.json');

function readHistory() {
  if (!fs.existsSync(historyPath)) return [];
  return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
}

function saveHistory(history) {
  console.log('Saving updated history to:', historyPath);
  console.log('Final data:', JSON.stringify(history, null, 2)); // debug

  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), { flag: 'w' });
  } catch (e) {
    console.error('❌ Failed to write projects.json:', e);
  }
}

function addOrUpdateProject(config) {
  const history = readHistory();
  const index = history.findIndex(p => p.id === config.id);
  if (index !== -1) {
    history[index] = config;
  } else {
    history.push(config);
  }
  saveHistory(history);
}

function removeProject(projectId) {
  console.log('Removing project with ID:', projectId); // ✅ debug
  const history = readHistory();
  const updated = history.filter(p => p.id !== projectId);
  saveHistory(updated);
}

function updateProjectPath(projectId, newPath) {
  const history = readHistory();
  const project = history.find(p => p.id === projectId);
  if (project) {
    project.path = newPath;
    saveHistory(history);
  }
}

module.exports = {
  readHistory,
  addOrUpdateProject,
  removeProject,
  updateProjectPath
};
