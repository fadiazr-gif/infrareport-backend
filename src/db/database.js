const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Definir la ubicación de la base de datos
const dbPath = path.resolve(
    process.env.DB_FILE || './data/app.db'
);

// Crear la carpeta si no existe
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Crear conexión SQLite
const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
        console.error('Error de conexión:', error.message);
    } else {
        console.log('Conexión SQLite establecida');
    }
});

// Crear tabla de activos tecnológicos
function initDb() {
    return new Promise((resolve, reject) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS activos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                empresa TEXT NOT NULL,
                nombre TEXT NOT NULL,
                tipo TEXT NOT NULL,
                marca TEXT,
                modelo TEXT,
                direccion_ip TEXT,
                estado TEXT NOT NULL,
                criticidad TEXT NOT NULL,
                observaciones TEXT,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        db.run(sql, (error) => {
            if (error) {
                reject(error);
            } else {
                console.log('Tabla activos lista');
                resolve();
            }
        });
    });
}

module.exports = { db, initDb };
