import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
// Configurar el acceso
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Le decimos DÓNDE y CÓMO guardar las imágenes
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'club_socios', // Se va a crear esta carpeta en tu Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        // Redimensiona y recorta en formato cuadrado al vuelo para que no te suban fotos de 10MB
        transformation: [{ width: 500, height: 500, crop: 'fill' }] 
    } as any
});

// Exportamos el middleware listo para usar en las rutas
export const uploadFoto = multer({ storage });