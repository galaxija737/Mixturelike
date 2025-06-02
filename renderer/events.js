import { openProjectAndRenderUI } from './projectManager.js';
import { renderSidebar } from './sidebar.js';
import { renderProjectDetails } from './detailPane.js';

export function setupEventHandlers() {
  document.getElementById('open-existing-project').addEventListener('click', async () => {
    const folderPath = await window.electronAPI.openFolder();
    if (!folderPath) return;

    await window.electronAPI.openProjectByPath(folderPath);
    const config = await window.electronAPI.getProjectInfo();
    renderProjectDetails(config);
    await renderSidebar(handleRecentProjectClick);
  });

  document.getElementById('create-project-btn').addEventListener('click', async () => {
    const boilerplate = document.getElementById('boilerplate-select').value;
    const folderPath = await window.electronAPI.selectFolder();
    if (!folderPath) return;

    const config = await window.electronAPI.createBoilerplateProject(boilerplate, folderPath);
    if (config) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('boilerplateModal'));
      modal.hide();
      await window.electronAPI.openProjectByPath(folderPath);
      renderProjectDetails(config);
      await renderSidebar(handleRecentProjectClick);
    }
  });

  // START button
  document.addEventListener('click', async (e) => {
    if (e.target.matches('#start-project-btn')) {
      const config = await window.electronAPI.getProjectInfo();
      if (config?.path) {
        await window.electronAPI.openProjectByPath(config.path);
      }
    }
  });

  async function handleRecentProjectClick(project) {
    // DO NOT start preview server — only show details
    renderProjectDetails(project);
  }

  renderSidebar(handleRecentProjectClick);
}
