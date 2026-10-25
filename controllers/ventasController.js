const Boleto = require('../models/Boleto');

const ventasController = {
    // 1. Apartar un número de la bolsa general
    apartarNumero: async (req, res) => {
        try {
            const { sorteoId, numero, clienteNombre, clienteCedula, clienteTelefono, clienteDireccion } = req.body;
            
            // Identificamos quién está haciendo la venta (Master directo o Vendedor)
            const vendedorTipo = req.usuario.rol === 'master' ? 'Master' : 'Vendedor';
            const vendedorId = req.usuario.id;

            const resultado = await Boleto.apartarBoleto({
                sorteoId, numero, vendedorTipo, vendedorId, 
                clienteNombre, clienteCedula, clienteTelefono, clienteDireccion
            });

            // Si success es false, significa que chocó con el candado anticolisión de la BD
            if (!resultado.success) {
                return res.status(409).json({ 
                    success: false, 
                    error: resultado.error // "El número ya fue vendido o apartado en otro dispositivo."
                });
            }

            res.status(201).json({ 
                success: true, 
                message: 'Número apartado exitosamente (Pendiente por pagar)', 
                data: resultado.data 
            });

        } catch (error) {
            res.status(500).json({ success: false, error: 'Error crítico al procesar la venta' });
        }
    },

    // 2. Registrar el pago (y guardar el capture de Bancolombia si aplica)
    pagarBoleto: async (req, res) => {
        try {
            const { boletoId } = req.params;
            const { metodoPago } = req.body;
            
            // Si multer (middleware que haremos luego) subió un archivo, guardamos la ruta
            const comprobanteUrl = req.file ? `/uploads/${req.file.filename}` : null;

            if (metodoPago === 'Bancolombia' && !comprobanteUrl) {
                return res.status(400).json({ success: false, error: 'El comprobante de Bancolombia es obligatorio.' });
            }

            const boletoActualizado = await Boleto.registrarPago(boletoId, metodoPago, comprobanteUrl);
            
            res.status(200).json({ 
                success: true, 
                message: 'Pago validado. Boleto listo para enviar color verde por WhatsApp.', 
                data: boletoActualizado 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al registrar el pago' });
        }
    },

    // 3. Liberar número (Anular boleto pendiente)
    liberarNumero: async (req, res) => {
        try {
            const { boletoId } = req.params;
            
            const numeroLiberado = await Boleto.liberarBoleto(boletoId);
            
            if (!numeroLiberado) {
                return res.status(404).json({ success: false, error: 'Boleto no encontrado' });
            }

            res.status(200).json({ 
                success: true, 
                message: `El número ${numeroLiberado.numero} ha regresado a la bolsa general.` 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al liberar el número' });
        }
    },
    // Añadir esta nueva propiedad dentro del objeto ventasController:
obtenerBoletosSorteo: async (req, res) => {
    try {
        const { sorteoId } = req.params;
        // Requerimos exportar el pool o importarlo arriba: const pool = require('../config/db');
        const query = 'SELECT numero, estado FROM boletos WHERE sorteo_id = $1';
        const pool = require('../config/db'); 
        const { rows } = await pool.query(query, [sorteoId]);
        
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al cargar grilla' });
    }
}
};

module.exports = ventasController;

