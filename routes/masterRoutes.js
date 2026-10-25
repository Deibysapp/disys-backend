const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Todas las rutas aquí requieren token y ser 'master'
router.use(verificarToken);
router.use(verificarRol(['master']));

// Endpoints
router.post('/crear-vendedor', masterController.crearVendedor);
router.post('/crear-sorteo', masterController.crearSorteo);
router.get('/dashboard/:sorteoId', masterController.obtenerDashboard);

module.exports = router;