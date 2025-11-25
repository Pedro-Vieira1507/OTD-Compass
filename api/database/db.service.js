// api/database/db.service.js

const Database = require('better-sqlite3');
const path = require('path');

// O DB será salvo no disco em um arquivo simples
const DB_PATH = path.join(__dirname, 'license.db');
const db = new Database(DB_PATH, { verbose: console.log });

/**
 * Cria a tabela 'licenses' se ela ainda não existir.
 * Colunas: key (chave), valid_until (validade), features (recursos), is_active.
 */
function initDatabase() {
    const createTable = `
    CREATE TABLE IF NOT EXISTS licenses (
        key TEXT PRIMARY KEY,
        valid_until TEXT,
        features TEXT,
        is_active INTEGER
    );
    `;
    db.exec(createTable);
    console.log('[DB] Tabela de licenças verificada/criada.');
    
    // Adiciona uma chave de teste (opcional)
    const testKey = 'TESTE-OTDCOMPASS-FREE';
    const existingKey = db.prepare('SELECT key FROM licenses WHERE key = ?').get(testKey);

    if (!existingKey) {
        db.prepare(`
            INSERT INTO licenses (key, valid_until, features, is_active) 
            VALUES (?, ?, ?, ?)
        `).run(testKey, '2030-12-31', '["basic"]', 1);
        console.log(`[DB] Chave de teste '${testKey}' inserida.`);
    }
}

/**
 * Busca uma licença pela chave.
 */
function getLicenseByKey(key) {
    return db.prepare('SELECT * FROM licenses WHERE key = ?').get(key);
}

module.exports = { initDatabase, getLicenseByKey };