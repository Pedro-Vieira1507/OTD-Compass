// core/OTD_Calculator.js

const XLSX = require('xlsx');

class OTD_Calculator {
    constructor(mainWindow) {
        // A referência à janela principal é crucial para enviar dados de volta ao Renderer.
        this.mainWindow = mainWindow;
        this.planilhas = {}; // Objeto para armazenar os dados processados das planilhas.
    }

    /**
     * Converte o valor numérico de data do Excel para um objeto Date.
     * @param {number} excelDate - Número de série da data do Excel.
     * @returns {Date} Objeto Date correspondente.
     */
    parseExcelDate(excelDate) {
        if (typeof excelDate !== 'number' || isNaN(excelDate)) {
            return null;
        }

        // A data base do Excel é 1 de janeiro de 1900.
        // O valor 1 é 1900-01-01. Subtraímos 1 para considerar a diferença de 1 dia.
        const date = new Date(Date.UTC(1899, 11, 30));
        date.setDate(date.getDate() + excelDate);

        return date;
    }

    /**
     * Processa os dados Base64 do arquivo enviado pelo Renderer.
     * @param {string} base64Data - String Base64 do arquivo Excel.
     */
    processFile(base64Data) {
        try {
            // 1. Decodificar Base64 para Buffer
            const buffer = Buffer.from(base64Data, 'base64');

            // 2. Ler o arquivo Excel usando XLSX
            const workbook = XLSX.read(buffer, { type: 'buffer' });

            // 3. Processar a aba 'Pedidos'
            const pedidosSheet = workbook.Sheets['Pedidos'];
            if (pedidosSheet) {
                // Converte a aba 'Pedidos' para um array de objetos JSON (sem cabeçalho na primeira linha)
                let rows = XLSX.utils.sheet_to_json(pedidosSheet, { header: 1 });
                
                // Pega o cabeçalho (primeira linha)
                const header = rows[0];
                // Pega os dados (a partir da segunda linha)
                rows = rows.slice(1);

                // Normaliza e armazena os dados
                this.planilhas['Pedidos'] = this.normalizeRows(rows, header);
                console.log(`Planilha 'Pedidos' processada com ${this.planilhas['Pedidos'].length} linhas.`);

            } else {
                throw new Error("Planilha 'Pedidos' não encontrada.");
            }

            // 4. Processar a aba 'Produtos' (assumindo a mesma estrutura)
            const produtosSheet = workbook.Sheets['Produtos'];
            if (produtosSheet) {
                let rows = XLSX.utils.sheet_to_json(produtosSheet, { header: 1 });
                const header = rows[0];
                rows = rows.slice(1);

                this.planilhas['Produtos'] = this.normalizeRows(rows, header);
                console.log(`Planilha 'Produtos' processada com ${this.planilhas['Produtos'].length} linhas.`);

            } else {
                // NOTA: Se 'Produtos' for opcional, você pode apenas logar ou ignorar.
                // Por enquanto, apenas logamos que não foi encontrada.
                console.log("Planilha 'Produtos' não encontrada ou é opcional.");
            }

            // 5. Iniciar os cálculos e enviar os resultados para o Renderer
            this.iniciarCalculos();

        } catch (error) {
            console.error("Erro ao processar arquivo:", error.message);
            // Enviar uma mensagem de erro de volta para o Renderer (opcional, mas boa prática)
            this.mainWindow.webContents.send('update-dashboard', { error: error.message });
        }
    }

    /**
     * Converte um array de dados e um array de cabeçalhos em um array de objetos.
     * @param {Array<Array<any>>} rows - Array de arrays contendo os dados.
     * @param {Array<string>} header - Array de strings contendo os nomes das colunas.
     * @returns {Array<Object>} Array de objetos com chaves baseadas no cabeçalho.
     */
    normalizeRows(rows, header) {
        const normalized = [];
        const cleanHeader = header.map(h => h ? String(h).trim() : null); // Garante que o cabeçalho está limpo

        for (const row of rows) {
            const rowObject = {};
            for (let i = 0; i < cleanHeader.length; i++) {
                const key = cleanHeader[i];
                const value = row[i];
                if (key) {
                    // Trata datas para colunas específicas, se necessário (exemplo simplificado)
                    if (key.includes('Data')) {
                        rowObject[key] = this.parseExcelDate(value);
                    } else {
                        rowObject[key] = value;
                    }
                }
            }
            normalized.push(rowObject);
        }
        return normalized;
    }

    /**
     * Executa a lógica de cálculo OTD principal (placeholder).
     */
    iniciarCalculos() {
        // ATENÇÃO: A lógica de cálculo OTD detalhada será implementada aqui.
        // Por enquanto, apenas enviamos um sinal de sucesso para o Renderer.

        // Simula o processamento e envia os dados brutos para verificação
        const dashboardData = {
            success: true,
            message: 'Arquivo processado com sucesso no Core!',
            // Pode enviar uma amostra dos dados para depuração inicial
            pedidosCount: this.planilhas['Pedidos'] ? this.planilhas['Pedidos'].length : 0,
            produtosCount: this.planilhas['Produtos'] ? this.planilhas['Produtos'].length : 0,
            // AQUI virá o OTD final (KPIs, tabelas, etc.)
        };

        // Envia os dados para a função de callback no Renderer
        this.mainWindow.webContents.send('update-dashboard', dashboardData);
    }
}

module.exports = OTD_Calculator;