import authMiddleWare from './auth.middleware';
import errorMiddleware from './error.middleware';
import validationMiddleware from './validation.middleware';
import { uploadSingleFile, uploadMultipleFiles } from './upload.middleware';
import multer from 'multer';

// Create multer instance with memory storage for direct use
const storage = multer.memoryStorage();
const uploadMiddleware = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});

export { authMiddleWare, errorMiddleware, validationMiddleware, uploadSingleFile, uploadMultipleFiles, uploadMiddleware };
