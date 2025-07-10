const { ipcMain } = require('electron');
const scheduler = require('../scheduler/index.cjs');

ipcMain.handle('task:start', (_, taskName) => {
  scheduler.startTask(taskName);
});

ipcMain.handle('task:stop', (_, taskName) => {
  scheduler.stopTask(taskName);
});

ipcMain.handle('task:status', () => {
  return scheduler.getStatus();
});
