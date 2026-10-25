require('dotenv').config();
const pool = require('./config/db');

async function configurarSuperMaster() {
    // Reemplaza estos valores por tu usuario y clave definitivos
    const nuevoUsuario = 'deibys.';
    const nuevaClave = '1937'; 

    try {
        await pool.query('DELETE FROM super_masters');
        
        const query = `
            INSERT INTO super_masters (username, password_hash)
            VALUES ($1, $2)
            RETURNING username, password_hash;
        `;
        const { rows } = await pool.query(query, [nuevoUsuario, nuevaClave]);
        
        console.log('✅ Super Master configurado con éxito:');
        console.log('Usuario:', rows[0].username);
        console.log('Clave:', rows[0].password_hash);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la base de datos:', error.message);
        process.exit(1);
    }
}

configurarSuperMaster();