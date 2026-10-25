const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Barrera de seguridad: Solo usuarios con token válido y rol de 'master'
router.use(verificarToken);
router.use(verificarRol(['master']));

// Endpoint para generar y descargar el archivo Excel
router.get('/descargar-excel/:sorteoId', reportesController.descargarRespaldo);

module.exports = router;