export async function loadProjectHistory(onSelectProject) {
  const recentList = document.getElementById('recent-projects');
  const history = await window.electronAPI.getProjectHistory();

  recentList.innerHTML = '';
  history.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.name} — ${p.path}`;
    li.style.cursor = 'pointer';
    li.onclick = () => onSelectProject(p);
    recentList.appendChild(li);
  });
}
