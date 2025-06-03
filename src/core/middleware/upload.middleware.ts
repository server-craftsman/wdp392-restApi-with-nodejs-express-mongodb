import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions';
import { HttpStatus } from '../enums';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName, s3Folders } from '../utils/aws.config';
import { Readable } from 'stream';

// Memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new HttpException(HttpStatus.BadRequest, 'Only image files are allowed!'));
    }
    cb(null, true);
};

// Create upload instance with memory storage
const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
});

// Helper function to upload buffer directly to S3
const uploadBufferToS3 = async (
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    sampleId?: string,
    folder: string = s3Folders.personImages
): Promise<string> => {
    try {
        // Generate a unique file name
        const fileExtension = path.extname(originalname);
        const fileName = `${uuidv4()}${fileExtension}`;

        // Create the folder path - if sampleId is provided, include it in the path
        const folderPath = sampleId ? `${folder}/${sampleId}` : folder;
        const key = `${folderPath}/${fileName}`;

        // Upload the buffer directly to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Generate the URL for the uploaded file
        const region = typeof s3Client.config.region === 'string'
            ? s3Client.config.region
            : 'ap-southeast-2'; // Default region based on error message

        // Use the correct S3 URL format with dashed region
        const fileUrl = `https://${bucketName}.s3-${region}.amazonaws.com/${key}`;
        return fileUrl;
    } catch (error) {
        console.error('Error uploading buffer to S3:', error);
        throw new HttpException(HttpStatus.InternalServerError, 'Failed to upload file to S3');
    }
};

// Middleware for single file upload directly to S3
export const uploadSingleFile = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const uploadMiddleware = upload.single(fieldName);

        uploadMiddleware(req, res, async (err: any) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new HttpException(HttpStatus.BadRequest, 'File too large. Maximum size is 5MB.'));
                }
                return next(new HttpException(HttpStatus.BadRequest, err.message));
            } else if (err) {
                return next(err);
            }

            // Check if file exists
            if (!req.file) {
                return next(new HttpException(HttpStatus.BadRequest, 'Please upload a file'));
            }

            try {
                // Get sample_id from request body if available
                const sampleId = req.body?.sample_id;

                // Upload buffer directly to S3
                const fileUrl = await uploadBufferToS3(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype,
                    sampleId
                );

                // Add the S3 URL to the request for later use
                req.file.path = fileUrl;
                (req.file as any).location = fileUrl; // AWS S3 compatible field

                next();
            } catch (error) {
                next(error);
            }
        });
    };
};

// Middleware for multiple file upload directly to S3
export const uploadMultipleFiles = (fieldName: string, maxCount: number = 5) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const uploadMiddleware = upload.array(fieldName, maxCount);

        uploadMiddleware(req, res, async (err: any) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new HttpException(HttpStatus.BadRequest, 'File too large. Maximum size is 5MB.'));
                } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return next(new HttpException(HttpStatus.BadRequest, `Too many files. Maximum is ${maxCount}.`));
                }
                return next(new HttpException(HttpStatus.BadRequest, err.message));
            } else if (err) {
                return next(err);
            }

            // Check if files exist
            if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
                return next(new HttpException(HttpStatus.BadRequest, 'Please upload at least one file'));
            }

            try {
                // Get sample_id from request body if available
                const sampleId = req.body?.sample_id;

                // Upload all files directly to S3
                const fileUrls = await Promise.all(
                    (req.files as Express.Multer.File[]).map(async (file) => {
                        const fileUrl = await uploadBufferToS3(
                            file.buffer,
                            file.originalname,
                            file.mimetype,
                            sampleId
                        );

                        // Add the S3 URL to each file
                        file.path = fileUrl;
                        (file as any).location = fileUrl; // AWS S3 compatible field

                        return fileUrl;
                    })
                );

                // Add the S3 URLs to the request for later use
                (req as any).fileUrls = fileUrls;

                next();
            } catch (error) {
                next(error);
            }
        });
    };
}; 