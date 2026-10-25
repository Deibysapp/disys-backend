const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint para iniciar sesión (Super Master, Master o Vendedor)
router.post('/login', authController.login);

module.exports = router;