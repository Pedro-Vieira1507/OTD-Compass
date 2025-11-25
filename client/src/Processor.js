// client/src/Processor.js

const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
// Importa o core de cálculo OTD (que está na pasta 'core')
const OTD_Calculator = require('../../core/OTD_Calculator'); 

// Define o caminho para o banco de dados local
// Usamos path.join(process.cwd(), 'otd_data.json') para simplificar o acesso
// durante o desenvolvimento. Para produção, path.join(process.resourcesPath, 'app_data', 'otd_data.json') é melhor.
const LOCAL_DB_PATH = path.join(process.cwd(), 'otd_data.json'); 

/**
 * Função principal que inicia a escuta de novos arquivos.
 */
function initProcessor() {
    // 1. Ouve a mensagem 'new-file-detected' enviada pelo FileWatcher em main.js
    // Esta função será chamada quando um novo arquivo for solto na pasta monitorada.
    ipcMain.on('new-file-detected', (event, filePath) => {
        console.log(`[Processor] Iniciando processamento do arquivo: ${filePath}`);
        
        try {
            const fileContent = fs.readFileSync(filePath);
            
            // 2. CHAMA O CÁLCULO CORE
            // O OTD_Calculator.calculate precisa ser implementado para aceitar o conteúdo e o caminho.
            const otdResult = OTD_Calculator.calculate(fileContent, filePath); 
            
            // 3. SALVA O RESULTADO LOCALMENTE
            saveResultToLocalDB(otdResult);
            
            console.log(`[Processor] Processamento de ${path.basename(filePath)} concluído.`);
            
            // 4. Notifica o Renderer (UI) que o Dashboard deve ser atualizado.
            // event.sender se refere à janela que enviou o IPC (a janela principal)
            if (event.sender.send) {
                 event.sender.send('update-dashboard', otdResult);
            }

        } catch (error) {
            console.error(`[Processor] Falha ao processar ${filePath}:`, error);
            // Notificar o Renderer sobre o erro
            if (event.sender.send) {
                event.sender.send('process-error', `Falha no processamento: ${error.message}`);
            }
        }
    });
}

/**
 * Função auxiliar para salvar os resultados no banco de dados local.
 */
function saveResultToLocalDB(newResult) {
    // Cria a pasta se não existir
    if (!fs.existsSync(path.dirname(LOCAL_DB_PATH))) {
        fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
    }
    
    let currentData = [];
    if (fs.existsSync(LOCAL_DB_PATH)) {
        try {
            // Tenta ler e parsear os dados existentes
            const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
            currentData = JSON.parse(data || '[]');
        } catch (e) {
            console.error("[Processor] Erro ao ler o DB existente, recriando array.", e.message);
            currentData = [];
        }
    }

    // Adiciona o novo resultado (assume que é um objeto JSON válido)
    currentData.push(newResult);
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(currentData, null, 2), 'utf-8');
}


/**
 * Função para carregar todos os dados do arquivo JSON local.
 * Usada pelo main.js quando o Dashboard é inicializado.
 */
function loadData() {
    if (fs.existsSync(LOCAL_DB_PATH)) {
        try {
            const data = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
            // Retorna o array de dados, ou um array vazio se o arquivo existir, mas estiver vazio
            return JSON.parse(data || '[]');
        } catch (e) {
            console.error("[Processor] Erro ao ler ou parsear o DB local:", e.message);
            return [];
        }
    }
    // Se o arquivo não existir, retorna array vazio
    return [];
}


module.exports = { 
    initProcessor, 
    loadData
};