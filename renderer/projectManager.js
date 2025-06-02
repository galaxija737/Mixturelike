import { renderProjectDetails } from './detailPane.js';
export async function openProjectAndRenderUI(folderPath) {
  const config = await window.electronAPI.getProjectInfo();
  renderProjectDetails(config);
  const files = await window.electronAPI.readFolder(folderPath);

  document.getElementById('project-info').innerHTML = `
    <strong>Project Name:</strong> ${config.name}<br>
    <strong>Path:</strong> ${config.path}
  `;

  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';
  files.forEach(file => {
    const li = document.createElement('li');
    li.textContent = file;
    fileList.appendChild(li);
  });
}
