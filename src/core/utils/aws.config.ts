import dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';

dotenv.config();

// AWS S3 configuration
export const s3Config = {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    bucket: process.env.AWS_S3_BUCKET_NAME || 'wdp392-generate-pdf',
};

// Initialize S3 client
export const s3Client = new S3Client({
    region: s3Config.region,
    credentials: s3Config.credentials,
});

// Define folder paths
export const s3Folders = {
    personImages: 'person-sample-images',
    resultReports: 'result-reports',
};

// Export bucket name
export const bucketName = s3Config.bucket; 