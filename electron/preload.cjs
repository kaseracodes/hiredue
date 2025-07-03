const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getCounter: () => ipcRenderer.invoke('get-counter'),
  incrementCounter: () => ipcRenderer.invoke('increment-counter')
});
