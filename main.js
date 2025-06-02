const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { renderFile } = require('./lib/renderer');
const { watchFolder } = require('./lib/watcher');
const { startPreview } = require('./lib/preview');

let mainWindow;

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
  const files = fs.readdirSync(folderPath);
  const outputDir = path.join(__dirname, 'renderer/output');
  fs.mkdirSync(outputDir, { recursive: true });

  for (const file of files) {
    if (path.extname(file) === '.liquid') {
      await renderFile(path.join(folderPath, file), outputDir);
    }
    if (path.extname(file) === '.scss') {
      const { compileSCSS } = require('./lib/watcher');
      compileSCSS(path.join(folderPath, file), outputDir);
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
