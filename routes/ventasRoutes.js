const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);
router.use(verificarRol(['master', 'vendedor']));

router.get('/sorteo-activo/:sorteoId', ventasController.obtenerSorteoActivo);
router.get('/boletos-estado/:sorteoId', ventasController.obtenerBoletosSorteo);
router.post('/apartar', ventasController.apartarNumero);
router.put('/pagar/:boletoId', ventasController.pagarBoleto);
router.delete('/liberar/:boletoId', ventasController.liberarNumero);

module.exports = router;