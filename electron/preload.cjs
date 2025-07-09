const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getCounter: () => ipcRenderer.invoke('get-counter'),
  incrementCounter: () => ipcRenderer.invoke('increment-counter')
});

contextBridge.exposeInMainWorld('logger', {
  info: (msg) => ipcRenderer.send('log', 'info', msg),
  warn: (msg) => ipcRenderer.send('log', 'warn', msg),
  error: (msg) => ipcRenderer.send('log', 'error', msg),
  debug: (msg) => ipcRenderer.send('log', 'debug', msg)
});
