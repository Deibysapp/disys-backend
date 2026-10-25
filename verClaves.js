require('dotenv').config();
const pool = require('./config/db');

async function buscarCredenciales() {
    try {
        const { rows } = await pool.query('SELECT * FROM super_masters');
        console.log('--- CREDENCIALES ENCONTRADAS ---');
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error('Error al consultar:', error.message);
        process.exit(1);
    }
}

buscarCredenciales();