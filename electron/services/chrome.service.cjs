const { spawn } = require('child_process');
const path = require('path');
const { app } = require('electron');

const log = require('../utils/logger.cjs');
const config = require('../config/puppeteer.config.cjs');

function launchChrome({ isGUI = false } = {}) {

    const headlessFlag = isGUI ? '' : '--headless=new';
    const userDataDir= path.join(app.getPath('userData'), 'chrome user data directory');

    const args = [
        `--remote-debugging-port=${config.remoteDebuggingPort}`,
        `--user-data-dir=${userDataDir}`,
        headlessFlag,
        `--user-agent="${config.userAgent}"`
    ].filter(Boolean);

    const chromeProcess = spawn(config.chromePath, args, {
        detached: true,
        stdio: 'ignore'
    });

    chromeProcess.unref();
    log.info(`[ChromeService] Chrome launched on port ${config.remoteDebuggingPort}`);
}

module.exports = {
    launchChrome
};
