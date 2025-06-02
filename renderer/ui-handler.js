import { openProjectAndRenderUI } from './projectManager.js';
import { loadProjectHistory } from './history.js';
import { createBoilerplateProject } from './boilerplate.js';

const addExistingBtn = document.getElementById('add-existing');
const createBoilerplateBtn = document.getElementById('create-from-boilerplate');
const modal = new bootstrap.Modal(document.getElementById('boilerplateModal'));
const createBtn = document.getElementById('create-project-btn');

addExistingBtn.addEventListener('click', async () => {
  const folderPath = await window.electronAPI.openFolder();
  if (!folderPath) return;

  await window.electronAPI.openProjectByPath(folderPath);
  await openProjectAndRenderUI(folderPath);
  await loadProjectHistory(handleRecentProjectClick);
});

createBoilerplateBtn.addEventListener('click', () => {
  modal.show();
});

createBtn.addEventListener('click', async () => {
  const boilerplate = document.getElementById('boilerplate-select').value;
  const description = document.getElementById('project-description').value || '';
  const thumbnail = document.getElementById('project-thumbnail').value || 'thumbnail.png';

  const folderPath = await window.electronAPI.selectFolder();
  if (!folderPath) return;

  const config = await createBoilerplateProject(boilerplate, folderPath, name, description, thumbnail);
  if (config) {
    await window.electronAPI.openProjectByPath(folderPath);
    await openProjectAndRenderUI(folderPath);
    await loadProjectHistory(handleRecentProjectClick);
    modal.hide();
  }
});

async function handleRecentProjectClick(project) {
  try {
    await window.electronAPI.openProjectByPath(project.path);
    await openProjectAndRenderUI(project.path);
  } catch (e) {
    const retry = confirm(`Project folder not found at:
${project.path}

Would you like to locate it?`);
    if (retry) {
      const newPath = await window.electronAPI.updateProjectPath(project.id);
      if (newPath) {
        alert('Path updated.');
        await window.electronAPI.openProjectByPath(newPath);
        await openProjectAndRenderUI(newPath);
        await loadProjectHistory(handleRecentProjectClick);
      }
    }
  }
}

loadProjectHistory(handleRecentProjectClick);
