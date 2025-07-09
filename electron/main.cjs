const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

const log = require('./utils/logger.cjs');
const { createIncreamentCounterJob } = require('./services/counter.service.cjs');
const registerCounterIPC = require('./ipc/counter.ipc.cjs');
const registerLoggerIPC = require('./ipc/logger.ipc.cjs');

let tray = null;
let mainWindow = null;
const isDev = !app.isPackaged;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
    return;
}

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
        log.info('Loading production file:', indexPath);
        mainWindow.loadFile(indexPath);
    }

    mainWindow.on('close', (e) => {
        e.preventDefault();
        mainWindow.hide();
    });
}

app.whenReady().then(() => {
    createWindow();

    tray = new Tray(path.join(__dirname, 'icon.png'));
    tray.setToolTip('HireDue');
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Show GUI', click: () => mainWindow.show() },
        { label: 'Quit', click: () => app.quit() }
    ]));

    log.info('Electron app booting...');

    registerCounterIPC();
    registerLoggerIPC();

    createIncreamentCounterJob(); // Background counter update
});

app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    } else {
        createWindow();
    }
});
