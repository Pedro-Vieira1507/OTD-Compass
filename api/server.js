// api/server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Necessário para permitir conexões do seu app client
const db = require('./database/db.service'); 
const licenseRoutes = require('./controllers/license.controller');

const app = express();
const PORT = 3000; // Porta de conexão da API

// Middlewares
app.use(cors({
    origin: ['http://localhost', 'file://'], // Permite requisições do seu app Electron
    methods: ['GET', 'POST']
}));
app.use(bodyParser.json());

// Rotas da API
app.use('/api/license', licenseRoutes); // Rota base: /api/license

// Inicializa o banco de dados (cria a tabela se não existir)
db.initDatabase();

app.listen(PORT, () => {
    console.log(`[API] Servidor de Licenciamento rodando na porta ${PORT}`);
    console.log(`[API] Teste de Rota: http://localhost:${PORT}/api/license/status`);
});