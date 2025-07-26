import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName, s3Folders } from './aws.config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { HttpException } from '../exceptions';
import { HttpStatus } from '../enums';

/**
 * Upload a file to AWS S3
 * @param file The file to upload (from multer)
 * @param sampleId The sample ID to use in the folder path
 * @param folder The base folder to upload to (from s3Folders)
 * @returns The URL of the uploaded file
 */
export const uploadFileToS3 = async (file: Express.Multer.File, sampleId?: string, folder: string = s3Folders.personImages): Promise<string> => {
    try {
        // If the file already has a location (uploaded directly to S3), return it
        if ((file as any).location) {
            return (file as any).location;
        }

        // Generate a unique file name
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;

        // Create the folder path - if sampleId is provided, include it in the path
        const folderPath = sampleId ? `${folder}/${sampleId}` : folder;
        const key = `${folderPath}/${fileName}`;

        // Check if AWS credentials are configured
        if (!s3Client.config.credentials) {
            console.error('AWS credentials not properly configured');
            throw new HttpException(HttpStatus.InternalServerError, 'AWS credentials not properly configured');
        }

        // Check if bucket name is configured
        if (!bucketName) {
            console.error('AWS S3 bucket name not configured');
            throw new HttpException(HttpStatus.InternalServerError, 'AWS S3 bucket name not configured');
        }

        // Determine if we're using buffer or file path
        let body;
        if (file.buffer) {
            // Using multer memory storage (buffer)
            body = file.buffer;
            console.log('Uploading file from buffer:', file.originalname);
        } else if (file.path) {
            // Using multer disk storage (file path)
            // Check if file exists on disk
            if (!fs.existsSync(file.path)) {
                throw new HttpException(HttpStatus.BadRequest, `File not found on disk: ${file.path}`);
            }
            body = fs.createReadStream(file.path);
            console.log('Uploading file from path:', file.path);
        } else {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid file: neither buffer nor path is available');
        }

        // Upload the file to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: key,
            Body: body,
            ContentType: file.mimetype,
        };

        try {
            await s3Client.send(new PutObjectCommand(uploadParams));
        } catch (awsError) {
            console.error('AWS S3 upload error:', awsError);
            throw new HttpException(HttpStatus.InternalServerError, `AWS S3 upload error: ${(awsError as Error).message || 'Unknown error'}`);
        }

        // Generate the URL for the uploaded file
        const region = typeof s3Client.config.region === 'string' ? s3Client.config.region : 'ap-southeast-2'; // Default region based on error message

        // Use the correct S3 URL format with dashed region
        const fileUrl = `https://${bucketName}.s3-${region}.amazonaws.com/${key}`;

        // Delete the temporary file if it exists on disk
        if (file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            } catch (unlinkError) {
                console.warn(`Could not delete temporary file ${file.path}:`, unlinkError);
                // Continue execution even if temp file deletion fails
            }
        }

        return fileUrl;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        if (error instanceof HttpException) {
            throw error;
        }
        throw new HttpException(HttpStatus.InternalServerError, 'Failed to upload file to S3');
    }
};

/**
 * Upload multiple files to AWS S3
 * @param files Array of files to upload (from multer)
 * @param sampleId The sample ID to use in the folder path
 * @param folder The base folder to upload to (from s3Folders)
 * @returns Array of URLs of the uploaded files
 */
export const uploadMultipleFilesToS3 = async (files: Express.Multer.File[], sampleId?: string, folder: string = s3Folders.personImages): Promise<string[]> => {
    try {
        // Validate files array
        if (!files || !Array.isArray(files) || files.length === 0) {
            throw new HttpException(HttpStatus.BadRequest, 'No files provided for upload');
        }

        // Check if each file has the necessary properties
        files.forEach((file, index) => {
            if (!file || (!file.buffer && !file.path)) {
                throw new HttpException(HttpStatus.BadRequest, `Invalid file at index ${index}: missing buffer or path`);
            }
        });

        const uploadPromises = files.map((file) => uploadFileToS3(file, sampleId, folder));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading multiple files to S3:', error);
        if (error instanceof HttpException) {
            throw error;
        }
        throw new HttpException(HttpStatus.InternalServerError, 'Failed to upload files to S3');
    }
};

// // Re-export s3Folders from aws.config.ts
export { s3Folders };

// // Define additional folders
// export const s3Folders = {
//     ...s3Folders,
//     blogImages: 'blog-images'
// };
