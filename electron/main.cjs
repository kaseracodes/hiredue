const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

const log = require('./utils/logger.cjs');
const { initScheduler } = require('./scheduler/index.cjs');
require('./ipc/index.cjs'); 

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

    global.mainWindow = mainWindow;

    if (isDev) {
        global.mainWindow.loadURL('http://localhost:5173');
    } else {
        const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
        log.info('Loading production file:', indexPath);
        global.mainWindow.loadFile(indexPath);
    }

    global.mainWindow.on('close', (e) => {
        e.preventDefault();
        global.mainWindow.hide();
    });
}

app.whenReady().then(() => {
    initScheduler();
    createWindow();

    tray = new Tray(path.join(__dirname, 'icon.png'));
    tray.setToolTip('HireDue');
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Show GUI', click: () => global.mainWindow.show() },
        { label: 'Quit', click: () => app.quit() }
    ]));

    log.info('Electron app booting...');
});

app.on('second-instance', () => {
    if (global.mainWindow) {
        if (global.mainWindow.isMinimized()) global.mainWindow.restore();
        global.mainWindow.show();
        global.mainWindow.focus();
    } else {
        createWindow();
    }
});
