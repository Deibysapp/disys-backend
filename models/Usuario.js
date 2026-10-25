const pool = require('../config/db');

const Usuario = {
    // ---- MASTERS ----
    async createMaster(superMasterId, username, pin) {
        const query = `
            INSERT INTO masters (super_master_id, username, pin_acceso)
            VALUES ($1, $2, $3) 
            RETURNING id, username, estado, fecha_creacion`;
        const { rows } = await pool.query(query, [superMasterId, username, pin]);
        return rows[0];
    },

    async cambiarEstadoMaster(masterId, nuevoEstado) {
        const query = `UPDATE masters SET estado = $1 WHERE id = $2 RETURNING *`;
        const { rows } = await pool.query(query, [nuevoEstado, masterId]);
        return rows[0];
    },

    // ---- VENDEDORES ----
    async createVendedor(masterId, nombre, apellido, username, pin) {
        const query = `
            INSERT INTO vendedores (master_id, nombre, apellido, username, pin_acceso)
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, nombre, apellido, username`;
        const { rows } = await pool.query(query, [masterId, nombre, apellido, username, pin]);
        return rows[0];
    },

    // ---- AUTENTICACIÓN ----
    async findByUsername(username, rol) {
        // rol puede ser 'super_master', 'master' o 'vendedor'
        const tabla = rol === 'vendedor' ? 'vendedores' : (rol === 'master' ? 'masters' : 'super_masters');
        const query = `SELECT * FROM ${tabla} WHERE username = $1`;
        const { rows } = await pool.query(query, [username]);
        return rows[0];
    }
};

module.exports = Usuario;