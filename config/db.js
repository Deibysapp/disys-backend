const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones a la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Conexión a la base de datos de DiSys establecida correctamente.');
});

pool.on('error', (err) => {
    console.error('Error inesperado en la base de datos', err);
    process.exit(-1);
});

module.exports = pool;