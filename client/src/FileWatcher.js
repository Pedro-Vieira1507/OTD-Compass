// client/src/FileWatcher.js

const chokidar = require('chokidar');
const path = require('path');
const { ipcMain } = require('electron');

// Caminho de exemplo (você pode carregar isso de um arquivo de configuração do usuário)
const USER_WATCH_PATH = path.join('C:', 'Users', 'SeuUsuario', 'Downloads', 'XML_Pedidos'); 

/**
 * Inicia o monitoramento da pasta do cliente.
 * Usa chokidar, que é mais confiável que o fs.watch em multi-plataforma.
 * @param {object} mainWindow A janela principal do Electron para enviar notificações (IPC).
 */
function startWatcher(mainWindow) {
    console.log(`[OTD Compass] Iniciando monitoramento da pasta: ${USER_WATCH_PATH}`);
    
    // Configuração do Chokidar:
    const watcher = chokidar.watch(USER_WATCH_PATH, {
        ignored: /[\/\\]\./,       // Ignora arquivos e pastas de sistema (ex: .DS_Store)
        persistent: true,          // Permite que o processo do Electron continue rodando
        ignoreInitial: true        // Não processa arquivos que já estão na pasta ao iniciar
    });

    watcher
        .on('add', (filePath) => {
            console.log(`[FileWatcher] Novo arquivo detectado para processamento: ${filePath}`);
            
            // Notifica a lógica de processamento (Processor.js) através do main.js
            mainWindow.webContents.send('new-file-detected', filePath);
            
        })
        .on('error', (error) => {
            console.error(`[FileWatcher] Erro no monitoramento: ${error}`);
            // TODO: Enviar o erro para a UI do usuário
        });
        
    // Permite que o renderer (UI) solicite que o watcher inicie
    ipcMain.handle('start-file-watcher', (event, path) => {
        // Lógica para permitir que o usuário configure a pasta via UI (futuro)
        // Por enquanto, apenas inicia
        return `Monitoramento iniciado em: ${USER_WATCH_PATH}`;
    });
}

module.exports = { startWatcher };