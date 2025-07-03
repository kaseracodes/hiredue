const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  return;
}

const db = require('./db.cjs');

let tray = null;
let mainWindow = null;
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    console.log('Trying to load:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  // mainWindow.loadURL('http://localhost:5173');

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.hide();
  });
}

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, 'icon.png')); // Replace with a real icon
  tray.setToolTip('HireDue');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show GUI', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]));

  setInterval(() => {
    const current = db.prepare('SELECT value FROM counters WHERE id = 1').get()?.value || 0;
    const newValue = current + 1;
    db.prepare('INSERT OR REPLACE INTO counters (id, value) VALUES (1, ?)').run(newValue);
    console.log('Counter electron/main.cjs:', newValue);
  }, 4000);
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  } else {
    createWindow(); // recreate window if it was destroyed
  }
});


ipcMain.handle('get-counter', async () => {
  const row = db.prepare('SELECT value FROM counters WHERE id = 1').get();
  return row?.value;
});

ipcMain.handle('increment-counter', () => {
  const current = db.prepare('SELECT value FROM counters WHERE id = 1').get()?.value || 0;
  const newValue = current + 1;
  db.prepare('INSERT OR REPLACE INTO counters (id, value) VALUES (1, ?)').run(newValue);
  return newValue;
});
