const Usuario = require('../models/Usuario');
const Sorteo = require('../models/Sorteo');
const pool = require('../config/db'); // Para la consulta compleja del dashboard

const masterController = {
    // 1. Crear un nuevo vendedor
    crearVendedor: async (req, res) => {
        try {
            // El ID del master viene del token de seguridad (middleware)
            const masterId = req.usuario.id; 
            const { nombre, apellido, username, pin } = req.body;

            const nuevoVendedor = await Usuario.createVendedor(masterId, nombre, apellido, username, pin);
            res.status(201).json({ success: true, message: 'Vendedor creado exitosamente', data: nuevoVendedor });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({ success: false, error: 'El nombre de usuario (username) ya existe.' });
            }
            res.status(500).json({ success: false, error: 'Error al crear vendedor' });
        }
    },

    // 2. Configurar un nuevo sorteo (Actualizado con nuevos campos)
    crearSorteo: async (req, res) => {
        try {
            const masterId = req.usuario.id;
            const { nombre_sorteo, cantidad_numeros, precio_boleto, fecha_sorteo, hora_sorteo, loteria, premios, modalidad_ganadora } = req.body;

            const query = `
                INSERT INTO sorteos (master_id, nombre_sorteo, cantidad_numeros, precio_boleto, fecha_sorteo, hora_sorteo, loteria, premios, modalidad_ganadora)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
            `;
            const values = [masterId, nombre_sorteo, cantidad_numeros, precio_boleto, fecha_sorteo, hora_sorteo, loteria, premios, modalidad_ganadora];

            const { rows } = await pool.query(query, values);
            res.status(201).json({ success: true, message: 'Rifa configurada exitosamente', data: rows[0] });
        } catch (error) {
            console.error('Error en BD:', error);
            res.status(500).json({ success: false, error: 'Error al crear el sorteo' });
        }
    },

    // 3. Eliminar un sorteo manualmente
    eliminarSorteo: async (req, res) => {
        try {
            const masterId = req.usuario.id;
            const sorteoId = req.params.id;

            // Se exige master_id por seguridad para que un master no borre sorteos de otro
            const query = 'DELETE FROM sorteos WHERE id = $1 AND master_id = $2 RETURNING *';
            const { rowCount } = await pool.query(query, [sorteoId, masterId]);

            if (rowCount === 0) {
                return res.status(404).json({ success: false, error: 'Sorteo no encontrado o sin permisos' });
            }

            res.status(200).json({ success: true, message: 'Sorteo eliminado permanentemente' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al eliminar el sorteo' });
        }
    },

    // 4. Obtener el Dashboard de Rendimiento de los vendedores
    obtenerDashboard: async (req, res) => {
        try {
            const sorteoId = req.params.sorteoId;
            
            // Consulta SQL que agrupa las ventas por vendedor y cuenta los estados
            const query = `
                SELECT 
                    v.nombre || ' ' || v.apellido AS nombre_vendedor,
                    COUNT(b.id) AS total_vendidos,
                    SUM(CASE WHEN b.estado = 'Pagado' THEN 1 ELSE 0 END) AS total_pagados,
                    SUM(CASE WHEN b.estado = 'Pendiente' THEN 1 ELSE 0 END) AS total_pendientes
                FROM vendedores v
                LEFT JOIN boletos b ON v.id = b.vendedor_id AND b.vendedor_tipo = 'Vendedor' AND b.sorteo_id = $1
                WHERE v.master_id = $2
                GROUP BY v.id
                ORDER BY total_vendidos DESC
            `;
            const { rows } = await pool.query(query, [sorteoId, req.usuario.id]);
            
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al cargar el dashboard' });
        }
    }
};

module.exports = masterController;