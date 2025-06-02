const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  readFolder: (path) => ipcRenderer.invoke('fs:readFolder', path),
  getProjectInfo: () => ipcRenderer.invoke('project:getInfo'),
  getProjectHistory: () => ipcRenderer.invoke('project:getHistory'),
  openProjectByPath: (path) => ipcRenderer.invoke('project:openByPath', path)

});
