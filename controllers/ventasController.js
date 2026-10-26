const pool = require('../config/db');

const ventasController = {
    obtenerSorteoActivo: async (req, res) => {
        try {
            const { sorteoId } = req.params;
            const { rows } = await pool.query('SELECT * FROM sorteos WHERE id = $1', [sorteoId]);
            if (rows.length === 0) return res.status(404).json({ success: false, error: 'Sorteo no encontrado' });
            res.status(200).json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al cargar el sorteo' });
        }
    },

    obtenerBoletosSorteo: async (req, res) => {
        try {
            const { sorteoId } = req.params;
            // Traemos el ID y los datos del cliente para usar WhatsApp y pagos
            const { rows } = await pool.query('SELECT id, numero, estado, cliente_nombre, cliente_telefono FROM boletos WHERE sorteo_id = $1', [sorteoId]);
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al cargar grilla' });
        }
    },

    apartarNumero: async (req, res) => {
        try {
            const { sorteoId, numero, clienteNombre, clienteCedula, clienteTelefono, clienteDireccion } = req.body;
            const vendedorId = req.usuario.id;
            const query = `
                INSERT INTO boletos (sorteo_id, vendedor_id, numero, cliente_nombre, cliente_cedula, cliente_telefono, cliente_direccion, estado)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pendiente') RETURNING *;
            `;
            const { rows } = await pool.query(query, [sorteoId, vendedorId, numero, clienteNombre, clienteCedula, clienteTelefono, clienteDireccion]);
            res.status(201).json({ success: true, message: 'Número apartado', data: rows[0] });
        } catch (error) {
            if (error.code === '23505') return res.status(409).json({ success: false, error: 'Número ya vendido.' });
            res.status(500).json({ success: false, error: 'Error al apartar' });
        }
    },

    pagarBoleto: async (req, res) => {
        try {
            const { boletoId } = req.params;
            const { rows } = await pool.query("UPDATE boletos SET estado = 'Pagado' WHERE id = $1 RETURNING *", [boletoId]);
            res.status(200).json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al pagar' });
        }
    },

    liberarNumero: async (req, res) => {
        try {
            const { boletoId } = req.params;
            await pool.query("DELETE FROM boletos WHERE id = $1", [boletoId]);
            res.status(200).json({ success: true, message: 'Número liberado' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al liberar' });
        }
    }
};

module.exports = ventasController;