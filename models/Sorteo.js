const pool = require('../config/db');

const Sorteo = {
    async createSorteo(data) {
        const { masterId, nombre, rango, fecha, hora, loteria, valor, premios, comision } = data;
        const query = `
            INSERT INTO sorteos
            (master_id, nombre_sorteo, rango_numeros, fecha_sorteo, hora_sorteo, loteria, valor_boleto, premios, comision_config)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`;
        const values = [masterId, nombre, rango, fecha, hora, loteria, valor, JSON.stringify(premios), JSON.stringify(comision)];
        
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async setGanador(sorteoId, numeroGanador) {
        const query = `
            UPDATE sorteos 
            SET numero_ganador = $1, estado_sorteo = 'Finalizado' 
            WHERE id = $2 
            RETURNING *`;
        const { rows } = await pool.query(query, [numeroGanador, sorteoId]);
        return rows[0];
    }
};

module.exports = Sorteo;