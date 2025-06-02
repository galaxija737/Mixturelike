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
const {
  loadProjects,
  addOrUpdateProject,
  updateProjectPath
} = require('./lib/projectStore');

let mainWindow;
let currentProjectConfig = null;

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

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

async function openProject(folderPath) {
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

  watchFolder(folderPath, outputDir, folderPath);
  startPreview(outputDir);

  return config;
}

// Select project folder manually
ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled || result.filePaths.length === 0) return null;

  const folderPath = result.filePaths[0];
  await openProject(folderPath);
  return folderPath;
});

// Open project from saved path
ipcMain.handle('project:openByPath', async (event, folderPath) => {
  return await openProject(folderPath);
});

// Update project path if moved
ipcMain.handle('project:updatePath', async (event, projectId) => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled || result.filePaths.length === 0) return null;

  const newPath = result.filePaths[0];
  updateProjectPath(projectId, newPath);
  return newPath;
});

// Get active project config
ipcMain.handle('project:getInfo', () => {
  return currentProjectConfig;
});

// Read folder contents
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

// Load saved projects.json
ipcMain.handle('project:getHistory', () => {
  return loadProjects();
});

const { createProjectFromBoilerplate } = require('./lib/boilerplate');

ipcMain.handle('project:createFromBoilerplate', async (event, boilerplateName, targetPath) => {
  try {
    createProjectFromBoilerplate(boilerplateName, targetPath);

    // Create config right after
    const config = createConfig(targetPath, path.basename(targetPath));
    addOrUpdateProject(config);

    return config;
  } catch (err) {
    console.error('Boilerplate creation failed:', err.message);
    return null;
  }
});

