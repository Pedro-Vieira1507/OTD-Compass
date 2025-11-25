// client/src/LicensingService.js

const axios = require('axios');
const API_URL = 'http://localhost:3000/api/license'; // Mudar para o domínio real na produção

/**
 * Valida a chave de licença do cliente no servidor centralizado.
 * @param {string} licenseKey A chave inserida pelo usuário.
 * @returns {object} { isValid: boolean, features: Array<string> }
 */
async function validateLicense(licenseKey) {
    try {
        const response = await axios.post(`${API_URL}/validate`, {
            key: licenseKey,
            client_version: require('../package.json').version
        });

        // O servidor responde com o status da licença
        return {
            isValid: response.data.valid,
            features: response.data.features || [], // Ex: ['ExportarPDF', 'RelatorioAvançado']
            message: response.data.message
        };

    } catch (error) {
        // Se a API estiver offline ou a chave for inválida (400/401)
        console.error("Erro na validação da licença:", error.message);
        return {
            isValid: false,
            features: [],
            message: "Falha na comunicação com o servidor de licenças. Tente novamente mais tarde."
        };
    }
}

/**
 * Salva a chave validada localmente (idealmente criptografada).
 */
function saveLicenseLocally(key) {
    // TODO: Implementar salvamento local seguro (ex: no localStorage do renderer ou arquivo de config criptografado)
    console.log("Licença salva localmente (Placeholder):", key);
}

module.exports = { validateLicense, saveLicenseLocally };