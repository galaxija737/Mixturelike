const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  readFolder: (path) => ipcRenderer.invoke('fs:readFolder', path),
  getProjectInfo: () => ipcRenderer.invoke('project:getInfo'),
  getProjectHistory: () => ipcRenderer.invoke('project:getHistory'),
  openProjectByPath: (path) => ipcRenderer.invoke('project:openByPath', path),
  updateProjectPath: (oldPath) => ipcRenderer.invoke('project:updatePath', oldPath),
  createBoilerplateProject: (boilerplateName, targetPath) => ipcRenderer.invoke('project:createFromBoilerplate', boilerplateName, targetPath),
  openInFileExplorer: (path) => shell.openPath(path),
  removeProjectById: (id) => ipcRenderer.invoke('project:removeById', id)
  
});
