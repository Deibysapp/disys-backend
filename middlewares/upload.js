const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // La carpeta debe existir en la raíz del proyecto
    },
    filename: (req, file, cb) => {
        // Renombramos el archivo: capture-16982348.jpg para evitar duplicados
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de seguridad: Solo aceptar imágenes
const fileFilter = (req, file, cb) => {
    const permitidos = /jpeg|jpg|png/;
    const extname = permitidos.test(path.extname(file.originalname).toLowerCase());
    const mimetype = permitidos.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG)'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por imagen
    fileFilter: fileFilter
});

module.exports = upload;