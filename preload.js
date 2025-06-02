const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  readFolder: (path) => ipcRenderer.invoke('fs:readFolder', path),
  getProjectInfo: () => ipcRenderer.invoke('project:getInfo')
});
