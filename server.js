const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicializar la aplicación
const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json()); // Permite recibir datos en formato JSON
app.use('/uploads', express.static('uploads')); // Carpeta pública para ver los captures de Bancolombia

// Aquí importamos las rutas
const authRoutes = require('./routes/authRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const masterRoutes = require('./routes/masterRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const superMasterRoutes = require('./routes/superMasterRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/super-master', superMasterRoutes);

// Ruta de prueba para verificar que el servidor de DiSys está vivo
app.get('/', (req, res) => {
    res.send('API de DiSys Rifas funcionando correctamente.');
});

// Definir el puerto y arrancar
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de DiSys Rifas corriendo en el puerto ${PORT}`);
});