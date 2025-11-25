// client/preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Expõe a API 'otdAPI' para o Renderer (index.html)
contextBridge.exposeInMainWorld('otdAPI', {
    // Envia um arquivo Base64 para ser armazenado no cache do Main
    processFile: (fileKey, fileBase64) => ipcRenderer.invoke('process-uploaded-file', fileKey, fileBase64),

    // Dispara o processamento final usando os arquivos no cache
    startProcessing: () => ipcRenderer.invoke('start-processing'),

    // Função para o Renderer ouvir atualizações do Main/Core
    onUpdateDashboard: (callback) => ipcRenderer.on('update-dashboard', callback),
    
    // Suporte para o download de modelos
    generateModel: (modelType) => ipcRenderer.invoke('generate-model', modelType),
    
    // Suporte para o Histórico de Importações (loadData)
    loadOtdData: () => ipcRenderer.invoke('load-otd-data'),
});