// middlewares/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear la carpeta documents si no existe
const documentsDir = path.join(__dirname, '../documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Configuración del almacenamiento de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir); // Carpeta de destino para los documentos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renombrar el archivo para evitar colisiones
  }
});

const upload = multer({ storage });

// Exportar el middleware de multer
module.exports = upload;
