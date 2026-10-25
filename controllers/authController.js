const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authController = {
    login: async (req, res) => {
        try {
            const { username, pin, rol } = req.body; 
            // rol debe ser: 'super_master', 'master' o 'vendedor'

            const usuario = await Usuario.findByUsername(username, rol);
            if (!usuario) {
                return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }

            // Validar credenciales según el rol
            if (rol === 'super_master') {
                // Aquí iría la comparación con bcrypt para la contraseña del Super Master
                if (usuario.password_hash !== pin) { 
                    return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
                }
            } else {
                // Masters y Vendedores usan PIN de 4 dígitos
                if (usuario.pin_acceso !== pin) {
                    return res.status(401).json({ success: false, error: 'PIN incorrecto' });
                }
                if (rol === 'master' && !usuario.estado) {
                    return res.status(403).json({ success: false, error: 'Cuenta de Master inactiva' });
                }
            }

            // Generar el token de seguridad
            const token = jwt.sign(
                { id: usuario.id, username: usuario.username, rol: rol },
                process.env.JWT_SECRET || 'disys_secreto_super_seguro',
                { expiresIn: '12h' }
            );

            res.status(200).json({
                success: true,
                message: `Bienvenido a DiSys Rifas, ${username}`,
                token,
                usuario: { id: usuario.id, username: usuario.username, rol: rol }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error en el servidor durante el login' });
        }
    }
};

module.exports = authController;