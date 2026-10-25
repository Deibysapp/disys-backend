const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { verificarToken, verificarRol } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Todas las rutas requieren token y pueden ser usadas por master o vendedor
router.use(verificarToken);
router.use(verificarRol(['master', 'vendedor']));

// Endpoints
router.post('/apartar', ventasController.apartarNumero);

// Para registrar el pago, usamos el middleware "upload" buscando un archivo llamado "comprobante"
router.put('/pagar/:boletoId', upload.single('comprobante'), ventasController.pagarBoleto);

router.delete('/liberar/:boletoId', ventasController.liberarNumero);
router.get('/sorteo/:sorteoId', ventasController.obtenerBoletosSorteo);

module.exports = router;