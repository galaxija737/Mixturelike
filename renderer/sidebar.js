
import { openProjectAndRenderUI } from './projectManager.js';
import { loadProjectHistory } from './history.js';

export async function renderSidebar(onSelectProject) {
  const sidebar = document.querySelector('#sidebar-nav');
  const history = await window.electronAPI.getProjectHistory();

  // Clear existing
  sidebar.innerHTML = '';

  const grouped = {};
  history.forEach(project => {
    const group = project.boilerplate || 'Other';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(project);
  });

  for (const groupName in grouped) {
    const title = document.createElement('div');
    title.className = 'nav-group-title';
    title.textContent = groupName;
    sidebar.appendChild(title);

    grouped[groupName].forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'nav-link text-start project-item';
      btn.textContent = p.name;
      btn.style.cursor = 'pointer';
      btn.onclick = () => onSelectProject(p);
      sidebar.appendChild(btn);
    });
  }
}
