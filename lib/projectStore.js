const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

  let updated = false;
  const newProjects = projects.map(p => {
    if (p.id === project.id) {
      updated = true;
      return {
        ...project,
        lastOpened: new Date().toISOString()
      };
    }
    return p;
  });

  if (!updated) {
    newProjects.unshift({
      ...project,
      lastOpened: new Date().toISOString()
    });
  }

  saveProjects(newProjects);
}

function updateProjectPath(projectId, newPath) {
  const projects = loadProjects();

  // Remove any project that already uses the new path
  const filtered = projects.filter(p => p.path !== newPath);

  const old = projects.find(p => p.id === projectId);
  if (!old) return;

  const updated = {
    ...old,
    path: newPath,
    lastOpened: new Date().toISOString()
  };

  // Replace project by ID
  const cleaned = filtered.filter(p => p.id !== projectId);
  cleaned.unshift(updated);

  saveProjects(cleaned);
}

module.exports = {
  loadProjects,
  addOrUpdateProject,
  updateProjectPath
};
