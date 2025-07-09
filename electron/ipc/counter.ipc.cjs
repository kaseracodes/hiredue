const { ipcMain } = require('electron');

const {getCounter, incrementCounter} = require('../services/counter.service.cjs');
const log = require('../utils/logger.cjs');

module.exports = function registerCounterIPC() {
    ipcMain.handle('get-counter', () => {
        return getCounter();
    });

    ipcMain.handle('increment-counter', () => {
        log.debug('Trigger: Increment Counter IPC Layer');
        return incrementCounter();
    });
};
