const pool = require('../config/db');

const ventasController = {
    // 1. Obtener los datos reales de la rifa (Precio, Premios, Lotería)
    obtenerSorteoActivo: async (req, res) => {
        try {
            const { sorteoId } = req.params;
            const query = 'SELECT * FROM sorteos WHERE id = $1';
            const { rows } = await pool.query(query, [sorteoId]);
            
            if (rows.length === 0) return res.status(404).json({ success: false, error: 'Sorteo no encontrado' });
            res.status(200).json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al cargar el sorteo' });
        }
    },

    // 2. Cargar los números que ya fueron vendidos/apartados
    obtenerBoletosSorteo: async (req, res) => {
        try {
            const { sorteoId } = req.params;
            const query = 'SELECT numero, estado FROM boletos WHERE sorteo_id = $1';
            const { rows } = await pool.query(query, [sorteoId]);
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al cargar la grilla de números' });
        }
    },

    // 3. Apartar un número (Con bloqueo nativo anticolisión)
    apartarNumero: async (req, res) => {
        try {
            const { sorteoId, numero, clienteNombre, clienteCedula, clienteTelefono, clienteDireccion } = req.body;
            const vendedorId = req.usuario.id;

            const query = `
                INSERT INTO boletos (sorteo_id, vendedor_id, numero, cliente_nombre, cliente_cedula, cliente_telefono, cliente_direccion, estado)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pendiente') RETURNING *;
            `;
            const values = [sorteoId, vendedorId, numero, clienteNombre, clienteCedula, clienteTelefono, clienteDireccion];
            
            const { rows } = await pool.query(query, values);
            res.status(201).json({ success: true, message: 'Número apartado exitosamente', data: rows[0] });

        } catch (error) {
            // El código 23505 es la alerta nativa de PostgreSQL cuando alguien intenta duplicar un registro UNIQUE
            if (error.code === '23505') {
                return res.status(409).json({ success: false, error: 'El número ya fue vendido o apartado por otra persona.' });
            }
            console.error(error);
            res.status(500).json({ success: false, error: 'Error crítico al procesar la venta' });
        }
    }
};

module.exports = ventasController;