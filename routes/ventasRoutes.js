const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);
router.use(verificarRol(['master', 'vendedor']));

// Endpoints alineados con el nuevo controlador
router.get('/sorteo-activo/:sorteoId', ventasController.obtenerSorteoActivo);
router.get('/boletos-estado/:sorteoId', ventasController.obtenerBoletosSorteo);
router.post('/apartar', ventasController.apartarNumero);

// Nota: Las rutas de pagar y liberar las agregaremos cuando hagamos el módulo de cobranza
module.exports = router;