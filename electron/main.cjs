const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

const log = require('./utils/logger.cjs');

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
    width: 500,
    height: 500,
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
    log.debug('Trying to load:', indexPath);
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

  log.info('Electron app booting...');

  setInterval(() => {
    const current = db.prepare('SELECT value FROM counters WHERE id = 1').get()?.value || 0;
    const newValue = current + 1;
    db.prepare('INSERT OR REPLACE INTO counters (id, value) VALUES (1, ?)').run(newValue);
    log.info('Counter:', newValue);
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
  log.debug('Increament query executed successfully');
  const current = db.prepare('SELECT value FROM counters WHERE id = 1').get()?.value || 0;
  const newValue = current + 1;
  db.prepare('INSERT OR REPLACE INTO counters (id, value) VALUES (1, ?)').run(newValue);
  return newValue;
});

ipcMain.on('log', (event, level, message) => {
  switch (level) {
    case 'info':
      log.raw.info(message);
      break;
    case 'warn':
      log.raw.warn(message);
      break;
    case 'error':
      log.raw.error(message);
      break;
    case 'debug':
      log.raw.debug(message);
      break;
    default:
      log.raw.info(message);
  }
});
