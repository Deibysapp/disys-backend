const pool = require('../config/db');
const { generarExcelRespaldo } = require('../utils/excelHelper');

const reportesController = {
    descargarRespaldo: async (req, res) => {
        try {
            const { sorteoId } = req.params;

            // 1. Extraer detalle de ventas (Hoja 1)
            const queryVentas = `
                SELECT 
                    b.numero, b.cliente_nombre AS cliente, b.cliente_cedula AS cedula, 
                    b.cliente_telefono AS telefono, b.cliente_direccion AS direccion, 
                    TO_CHAR(b.fecha_compra, 'YYYY-MM-DD HH24:MI') AS fecha, 
                    b.estado AS ticket, s.valor_boleto AS valor, 
                    COALESCE(v.nombre || ' ' || v.apellido, 'Vendedor Master') AS vendedor
                FROM boletos b
                JOIN sorteos s ON b.sorteo_id = s.id
                LEFT JOIN vendedores v ON b.vendedor_id = v.id AND b.vendedor_tipo = 'Vendedor'
                WHERE b.sorteo_id = $1
                ORDER BY b.numero ASC;
            `;
            const ventas = await pool.query(queryVentas, [sorteoId]);

            // 2. Extraer resumen estadístico (Hoja 2)
            const queryResumen = `
                SELECT 
                    COUNT(id) AS total_vendidos,
                    SUM(CASE WHEN estado = 'Pagado' THEN 1 ELSE 0 END) AS total_pagados,
                    SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) AS total_pendientes
                FROM boletos 
                WHERE sorteo_id = $1;
            `;
            const resumen = await pool.query(queryResumen, [sorteoId]);

            // 3. Generar el Excel
            const workbook = await generarExcelRespaldo(ventas.rows, resumen.rows[0]);

            // 4. Configurar las cabeceras para forzar la descarga en el navegador
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Respaldo_Sorteo_${sorteoId}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
            
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al generar el respaldo de Excel' });
        }
    }
};

module.exports = reportesController;