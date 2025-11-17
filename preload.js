const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveData: async (obj) => await ipcRenderer.invoke('save-data', obj),
  loadData: async () => await ipcRenderer.invoke('load-data')
});
