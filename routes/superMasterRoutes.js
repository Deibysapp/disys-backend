const express = require('express');
const router = express.Router();
const superMasterController = require('../controllers/superMasterController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Proteger ruta: solo accesible para el rol super_master
router.use(verificarToken);
router.use(verificarRol(['super_master']));

// Coincide exactamente con la URL que envía tu frontend (/api/super-master/crear)
router.post('/crear', superMasterController.crearMaster);

module.exports = router;