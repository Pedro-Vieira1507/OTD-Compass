// client/main.js

const { app, BrowserWindow, ipcMain } = require('electron'); // Importa ipcMain
const path = require('path');
// CORREÇÃO CRUCIAL: Ajuste do caminho para a nova localização: ./src/OTD_Calculator
const OTD_Calculator = require('./src/OTD_Calculator'); 


let mainWindow;
// Instância da classe para o processamento de OTD
let otdCalculator; 

// Cache para armazenar temporariamente os uploads do Renderer (nota, produto, site)
global.uploadedFilesCache = {};


function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1200, 
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // Mantém a segurança do Context Bridge
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    // Caminho para o Renderer
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'Dashboard.html'));
    // mainWindow.webContents.openDevTools(); 

    // Ação Crucial: Inicializa o novo processador de OTD
    otdCalculator = new OTD_Calculator(mainWindow);
}

// -------------------------------------------------------------
// Handlers para o IPC (Comunicação do Renderer -> Main)
// -------------------------------------------------------------

// Handler 1: Recebe o arquivo Base64 do Renderer e armazena no cache
ipcMain.handle('process-uploaded-file', async (event, fileKey, fileBase64) => {
    global.uploadedFilesCache[fileKey] = fileBase64; 

    console.log(`[Main] Arquivo '${fileKey}' recebido e armazenado no cache.`);
    return { success: true, key: fileKey };
});

// Handler 2: Dispara o processamento final quando os 3 arquivos estão prontos
ipcMain.handle('start-processing', async () => {
    console.log('[Main] Recebida requisição para iniciar o processamento do OTD.');
    
    // Passa o cache completo para a classe
    const result = otdCalculator.processFiles(global.uploadedFilesCache); 
    
    // Limpa o cache após o uso (OPCIONAL: Depende se você quer processar mais de uma vez sem reiniciar)
    // global.uploadedFilesCache = {};
    
    return { success: true, message: 'Processamento disparado. Verifique o log.' };
});

// Handler 3: Carrega os dados persistidos para o Dashboard (se existirem)
ipcMain.handle('load-otd-data', async () => {
    console.log('[Main] Carregando dados persistidos para o Renderer...');
    // Implemente a lógica de persistência aqui
    return { pedidos: [] };
});

// Handler 4: Geração de Modelo
ipcMain.handle('generate-model', async (event, modelType) => {
    console.log(`[Main] Recebida requisição para gerar modelo: ${modelType}`);
    // Futuramente, você colocaria a lógica de geração de arquivo XLSX aqui
    return { success: true, message: `Modelo ${modelType} gerado com sucesso.` };
});


// -------------------------------------------------------------
// EVENTOS PRINCIPAIS DO ELECTRON
// -------------------------------------------------------------

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});