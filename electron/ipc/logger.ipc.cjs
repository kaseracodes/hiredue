const { ipcMain } = require('electron');
const log = require('../utils/logger.cjs');

ipcMain.on('log', (event, level, message) => {
    if (typeof log.raw[level] === 'function') {
        log.raw[level](message);
    } else {
        log.raw.info(message);
    }
});
