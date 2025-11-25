// api/controllers/license.controller.js

const express = require('express');
const router = express.Router();
const db = require('../database/db.service');

// ROTA: POST /api/license/validate
// Esta é a rota que seu app client vai chamar
router.post('/validate', (req, res) => {
    const { key, client_version } = req.body;

    if (!key) {
        return res.status(400).json({ valid: false, message: 'Chave de licença não fornecida.' });
    }

    const license = db.getLicenseByKey(key);
    
    if (!license || license.is_active === 0) {
        return res.status(401).json({ valid: false, message: 'Chave inválida ou inativa.' });
    }

    const today = new Date();
    const expirationDate = new Date(license.valid_until);

    if (today > expirationDate) {
        // Opção: Desativar a chave no DB aqui
        return res.status(401).json({ valid: false, message: 'Licença expirada.' });
    }

    // Licença válida
    return res.json({
        valid: true,
        message: 'Licença Pro ativada com sucesso.',
        features: JSON.parse(license.features), // Retorna a lista de recursos
        validUntil: license.valid_until
    });
});

// ROTA: GET /api/license/status (Apenas para teste)
router.get('/status', (req, res) => {
    res.json({ status: 'Licensing API is running', message: 'Ready to receive validation requests.' });
});

module.exports = router;