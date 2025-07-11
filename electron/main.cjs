const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

const log = require('./utils/logger.cjs');
const { initScheduler } = require('./scheduler/index.cjs');
require('./ipc/index.cjs'); 
const { launchChrome } = require('./services/chrome.service.cjs');
const { connectAndLogTabs } = require('./services/puppeteer.service.cjs');

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

    launchChrome({ isGUI: true });

    // Give Chrome some time to start
    setTimeout(async () => {
        try {
            const browser =await connectAndLogTabs({ isGUI: true });
            // const pages = await browser.pages();
            // const page = pages.length > 0 ? pages[0] : await browser.newPage();

            // Navigate to LinkedIn
            // await page.goto('https://www.linkedin.com/uas/login?session_redirect=/sales&fromSignIn=true&trk=navigator');
            // await page.goto('https://linkedin.com');
            // log.info('[Puppeteer] Navigated to LinkedIn.');

        } catch (err) {
            log.error('[Main] Error connecting Puppeteer:', err);
        }
    }, 5000);
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
