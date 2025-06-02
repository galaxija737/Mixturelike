const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
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
const { removeProject } = require('./lib/projectHistory');
const { createProjectFromBoilerplate } = require('./lib/boilerplate');

let mainWindow;
let currentProjectConfig = null;

const boilerplateDefaults = {
  'liquid-bootstrap': {
    description: 'Sleek, intuitive, and powerful front-end framework for faster and easier web development.',
    thumbnail: 'thumbnail.png'
  },
  'clean-slate': {
    description: 'A blank canvas with minimal setup, ideal for custom work from scratch.',
    thumbnail: 'thumbnail.png'
  }
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 1024,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  // Load UI
  mainWindow.loadFile('index.html');

  // ❌ Remove default menu bar
  Menu.setApplicationMenu(null);
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

// Select project folder manually (for boilerplate creation)
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
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

// Remove project from the list
ipcMain.handle('project:removeById', async (event, projectId) => {
  removeProject(projectId);
});

// Open folder
ipcMain.handle('openInFileExplorer', async (event, path) => {
  await shell.openPath(path);
});

// Create project from boilerplate
ipcMain.handle('project:createFromBoilerplate', async (event, boilerplateName, targetPath) => {
  createProjectFromBoilerplate(boilerplateName, targetPath);

  const defaults = boilerplateDefaults[boilerplateName] || {};
  const name = path.basename(targetPath);
  
  // Create config right after
  const config = createConfig(
    targetPath,
    name,
    boilerplateName,
    defaults.description || '',
    defaults.thumbnail || 'thumbnail.png'
  );

  addOrUpdateProject(config);
  return config;
});