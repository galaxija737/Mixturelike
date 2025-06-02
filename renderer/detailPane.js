
export function renderProjectDetails(config) {
  const detailPane = document.getElementById('project-details');
  if (!config) {
    detailPane.innerHTML = '<p>No project selected.</p>';
    return;
  }

  detailPane.innerHTML = `
  <div class="project-header d-flex align-items-start">
    <img src="${config.path}/${config.thumbnail || 'thumbnail.png'}" width="100" height="100" class="me-3" />
    <div class="flex-grow-1">
      <div class="d-flex justify-content-between align-items-start">
        <h1 class="mb-1">${config.name} <span class="badge text-bg-secondary fs-6"> ${config.boilerplate || ''}</span></h1>
        <div class="btn-group">
            <button id="start-project-btn" class="btn btn-outline-secondary btn-sm" title="Start Project">
              <i class="bi bi-play-fill"></i>
            </button>
            <button id="open-folder-btn" class="btn btn-outline-secondary btn-sm" title="Open Folder">
              <i class="bi bi-folder2-open"></i>
            </button>
            <button id="forget-project-btn" class="btn btn-outline-secondary btn-sm" title="Forget Project">
              <i class="bi bi-trash"></i>
            </button>
          </div>
      </div>
      <p class="text-muted">${config.description || ''}</p>
      <p><strong>Last Opened:</strong> ${new Date(config.lastOpened || '').toLocaleString()} <strong>Find it in:</strong> ${config.path}</p>
      <p></p>
    </div>
  </div>
  <hr>
  <ul class="nav nav-tabs mt-4" id="project-tab-nav" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="logs-tab" data-bs-toggle="tab" data-bs-target="#logs-tab-pane" type="button" role="tab">Logs</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="files-tab" data-bs-toggle="tab" data-bs-target="#files-tab-pane" type="button" role="tab">Files</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="packages-tab" data-bs-toggle="tab" data-bs-target="#packages-tab-pane" type="button" role="tab">Packages</button>
    </li>
  </ul>
  <div class="tab-content p-3 border border-top-0" id="project-tab-content">
    <div class="tab-pane fade show active" id="logs-tab-pane" role="tabpanel">No logs yet.</div>
    <div class="tab-pane fade" id="files-tab-pane" role="tabpanel">File list coming soon.</div>
    <div class="tab-pane fade" id="packages-tab-pane" role="tabpanel">Package info coming soon.</div>
  </div>
`;

  // Start project
   document.getElementById('start-project-btn')?.addEventListener('click', async () => {
    await window.electronAPI.openProjectByPath(config.path);
  });

  // Open folder
  document.getElementById('open-folder-btn')?.addEventListener('click', async () => {
    await window.electronAPI.openInFileExplorer(config.path);
  });

  // Forget project
  document.getElementById('forget-project-btn')?.addEventListener('click', async () => {
    const confirmForget = confirm(
      'By choosing "Forget" you are not deleting the folder, only removing it from the list. Proceed?'
    );
    if (confirmForget) {
      await window.electronAPI.removeProjectById(config.id);
      location.reload();
    }
  });
}
