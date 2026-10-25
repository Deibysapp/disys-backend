const jwt = require('jsonwebtoken');

const auth = {
    // Verificar si el usuario tiene un token válido
    verificarToken: (req, res, next) => {
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(403).json({ success: false, error: 'Se requiere un token de autenticación.' });
        }

        try {
            // El token suele venir como "Bearer <token>"
            const tokenLimpio = token.split(' ')[1]; 
            const decoded = jwt.verify(tokenLimpio, process.env.JWT_SECRET || 'disys_secreto_super_seguro');
            
            // Guardamos los datos del usuario (id, rol, username) en la request
            req.usuario = decoded; 
            next();
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Token inválido o expirado.' });
        }
    },

    // Verificar si el usuario tiene permiso para esa acción
    verificarRol: (rolesPermitidos) => {
        return (req, res, next) => {
            if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'No tienes los permisos necesarios para realizar esta acción.' 
                });
            }
            next();
        };
    }
};

module.exports = auth;