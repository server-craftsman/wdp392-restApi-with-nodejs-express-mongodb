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
export const uploadFileToS3 = async (
    file: Express.Multer.File,
    sampleId?: string,
    folder: string = s3Folders.personImages
): Promise<string> => {
    try {
        // If the file already has a location (uploaded directly to S3), return it
        if ((file as any).location) {
            return (file as any).location;
        }

        // Check if file exists and is accessible
        if (!file || !file.path) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `File not found: ${file?.path || 'No file path provided'}`
            );
        }

        // If the file path is already a URL (uploaded directly to S3), return it
        if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
            return file.path;
        }

        // For files saved on disk, upload them to S3
        if (!fs.existsSync(file.path)) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `File not found: ${file.path}`
            );
        }

        // Generate a unique file name
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;

        // Create the folder path - if sampleId is provided, include it in the path
        const folderPath = sampleId ? `${folder}/${sampleId}` : folder;
        const key = `${folderPath}/${fileName}`;

        // Upload the file to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: key,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Generate the URL for the uploaded file
        const region = typeof s3Client.config.region === 'string'
            ? s3Client.config.region
            : 'ap-southeast-2'; // Default region based on error message

        // Use the correct S3 URL format with dashed region
        const fileUrl = `https://${bucketName}.s3-${region}.amazonaws.com/${key}`;

        // Delete the temporary file
        try {
            fs.unlinkSync(file.path);
        } catch (unlinkError) {
            console.warn(`Could not delete temporary file ${file.path}:`, unlinkError);
            // Continue execution even if temp file deletion fails
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
export const uploadMultipleFilesToS3 = async (
    files: Express.Multer.File[],
    sampleId?: string,
    folder: string = s3Folders.personImages
): Promise<string[]> => {
    try {
        const uploadPromises = files.map(file => uploadFileToS3(file, sampleId, folder));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading multiple files to S3:', error);
        throw new HttpException(HttpStatus.InternalServerError, 'Failed to upload files to S3');
    }
};

// Re-export s3Folders from aws.config.ts
export { s3Folders }; 