const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { renderFile } = require('./lib/renderer');
const { compileSCSS, watchFolder } = require('./lib/watcher');
const { startPreview } = require('./lib/preview');
const {
  configExists,
  createConfig,
  readConfig
} = require('./lib/projectConfig');
const { loadProjects, addOrUpdateProject } = require('./lib/projectStore');


let mainWindow;
let currentProjectConfig = null; // holds last loaded project config

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  mainWindow.loadFile('renderer/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const folderPath = result.filePaths[0];
  const outputDir = path.join(__dirname, 'renderer/output');
  fs.mkdirSync(outputDir, { recursive: true });

  // Load or create .mlconfig.json
  let config;
  if (configExists(folderPath)) {
    config = readConfig(folderPath);
    console.log(`📂 Loaded project config: ${config.name}`);
  } else {
    const projectName = path.basename(folderPath);
    config = createConfig(folderPath, projectName);
    console.log(`🆕 Created config for: ${projectName}`);
  }

  currentProjectConfig = config;
  addOrUpdateProject(config);

  // Render all .liquid and compile .scss
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const ext = path.extname(file);

    if (ext === '.liquid') {
      await renderFile(fullPath, outputDir, folderPath);
    } else if (ext === '.scss') {
      compileSCSS(fullPath, outputDir);
    }
  }

  watchFolder(folderPath, outputDir);
  startPreview(outputDir);

  return folderPath;
});

ipcMain.handle('fs:readFolder', async (event, folderPath) => {
  try {
    const files = fs.readdirSync(folderPath);
    return files.filter(file =>
      ['.html', '.liquid', '.scss', '.js'].includes(path.extname(file))
    );
  } catch (err) {
    return [];
  }
});

ipcMain.handle('project:getInfo', () => {
  return currentProjectConfig;
});

ipcMain.handle('project:getHistory', () => {
  return loadProjects();
});

ipcMain.handle('project:openByPath', async (event, folderPath) => {
  const outputDir = path.join(__dirname, 'renderer/output');
  fs.mkdirSync(outputDir, { recursive: true });

  // Load or create config
  let config;
  if (configExists(folderPath)) {
    config = readConfig(folderPath);
    console.log(`📂 Loaded project config: ${config.name}`);
  } else {
    const projectName = path.basename(folderPath);
    config = createConfig(folderPath, projectName);
    console.log(`🆕 Created config for: ${projectName}`);
  }

  currentProjectConfig = config;
  addOrUpdateProject(config);

  // Process files
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const ext = path.extname(file);

    if (ext === '.liquid') {
      await renderFile(fullPath, outputDir, folderPath);
    } else if (ext === '.scss') {
      compileSCSS(fullPath, outputDir);
    }
  }

  watchFolder(folderPath, outputDir);
  startPreview(outputDir);

  return config;
});
