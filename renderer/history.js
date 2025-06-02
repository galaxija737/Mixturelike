export async function loadProjectHistory(onSelectProject) {
  const recentList = document.getElementById('recent-projects');
  const history = await window.electronAPI.getProjectHistory();

  recentList.innerHTML = '';
  history.forEach(p => {
    const li = document.createElement('li');

    li.innerHTML = `
      <div>
        <strong>${p.name}</strong><br>
        ${p.description || ''}<br>
        ${p.thumbnail ? `<img src="${p.path}/${p.thumbnail}" width="100">` : ''}
      </div>
    `;

    li.style.cursor = 'pointer';
    li.onclick = () => onSelectProject(p);

    const forgetBtn = document.createElement('button');
    forgetBtn.textContent = 'Forget';
    forgetBtn.onclick = async (e) => {
      e.stopPropagation();
      const confirmForget = confirm("By choosing 'Forget', you are not deleting the folder — only removing it from the list.\n\nDo you wish to proceed?");
      if (confirmForget) {
        await window.electronAPI.removeProjectById(p.id);
        await loadProjectHistory(onSelectProject);
      }
    };

    li.appendChild(forgetBtn);
    recentList.appendChild(li);
  });
}
