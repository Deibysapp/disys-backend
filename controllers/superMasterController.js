const Usuario = require('../models/Usuario');

const superMasterController = {
    crearMaster: async (req, res) => {
        try {
            // req.usuario.id viene del token del Super Master autenticado
            const superMasterId = req.usuario.id;
            const { username, pin } = req.body;

            if (!username || !pin) {
                return res.status(400).json({ success: false, error: 'Faltan datos obligatorios' });
            }

            const nuevoMaster = await Usuario.createMaster(superMasterId, username, pin);
            res.status(201).json({ success: true, message: 'Master creado exitosamente', data: nuevoMaster });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({ success: false, error: 'El nombre de usuario ya existe' });
            }
            res.status(500).json({ success: false, error: 'Error al registrar al master' });
        }
    }
};

module.exports = superMasterController;