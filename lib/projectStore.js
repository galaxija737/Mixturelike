const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../data');
const projectsFile = path.join(storePath, 'projects.json');

function ensureStoreFile() {
  if (!fs.existsSync(storePath)) fs.mkdirSync(storePath);
  if (!fs.existsSync(projectsFile)) fs.writeFileSync(projectsFile, '[]');
}

function loadProjects() {
  ensureStoreFile();
  const raw = fs.readFileSync(projectsFile, 'utf-8');
  return JSON.parse(raw);
}

function saveProjects(projects) {
  ensureStoreFile();
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
}

function addOrUpdateProject(project) {
  const projects = loadProjects();
  const existingIndex = projects.findIndex(p => p.path === project.path);

  const record = {
    name: project.name,
    path: project.path,
    lastOpened: new Date().toISOString()
  };

  if (existingIndex !== -1) {
    projects[existingIndex] = record;
  } else {
    projects.unshift(record); // newest on top
  }

  saveProjects(projects);
}

module.exports = {
  loadProjects,
  addOrUpdateProject
};
