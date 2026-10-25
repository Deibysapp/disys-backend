const pool = require('../config/db');

const Boleto = {
    async apartarBoleto(data) {
        const { sorteoId, numero, vendedorTipo, vendedorId, clienteNombre, clienteCedula, clienteTelefono, clienteDireccion } = data;
        try {
            const query = `
                INSERT INTO boletos
                (sorteo_id, numero, vendedor_tipo, vendedor_id, cliente_nombre, cliente_cedula, cliente_telefono, cliente_direccion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING *`;
            const values = [sorteoId, numero, vendedorTipo, vendedorId, clienteNombre, clienteCedula, clienteTelefono, clienteDireccion];
            
            const { rows } = await pool.query(query, values);
            return { success: true, data: rows[0] };
            
        } catch (error) {
            // 23505 es el código nativo de PostgreSQL para "violación de restricción UNIQUE"
            if (error.code === '23505') {
                return { success: false, error: 'El número ya fue vendido o apartado en otro dispositivo.' };
            }
            throw error; // Lanza cualquier otro error al controlador
        }
    },

    async registrarPago(boletoId, metodoPago, comprobanteUrl = null) {
        const query = `
            UPDATE boletos 
            SET estado = 'Pagado', metodo_pago = $1, comprobante_url = $2 
            WHERE id = $3 
            RETURNING *`;
        const { rows } = await pool.query(query, [metodoPago, comprobanteUrl, boletoId]);
        return rows[0];
    },

    async liberarBoleto(boletoId) {
        // Borra el registro para que el número vuelva a estar libre en la bolsa
        const query = `DELETE FROM boletos WHERE id = $1 RETURNING numero`;
        const { rows } = await pool.query(query, [boletoId]);
        return rows[0];
    }
};

module.exports = Boleto;