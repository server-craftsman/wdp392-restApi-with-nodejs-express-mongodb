import dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';

dotenv.config();

// AWS S3 configuration
export const s3Config = {
    region: process.env.AWS_REGION || '',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    bucket: process.env.AWS_S3_BUCKET_NAME || '',
};

// Check if AWS credentials are properly configured
const isAwsConfigured = () => {
    return s3Config.region &&
        s3Config.credentials.accessKeyId &&
        s3Config.credentials.secretAccessKey &&
        s3Config.bucket;
};

// Initialize S3 client only if AWS is properly configured
export const getS3Client = (): S3Client | null => {
    if (!isAwsConfigured()) {
        console.warn('AWS S3 not configured - missing required environment variables');
        return null;
    }

    return new S3Client({
        region: s3Config.region,
        credentials: s3Config.credentials,
    });
};

// Lazy initialization of S3 client
let s3ClientInstance: S3Client | null = null;

export const s3Client = (): S3Client | null => {
    if (!s3ClientInstance && isAwsConfigured()) {
        s3ClientInstance = new S3Client({
            region: s3Config.region,
            credentials: s3Config.credentials,
        });
    }
    return s3ClientInstance;
};

// Define folder paths
export const s3Folders = {
    personImages: 'person-sample-images',
    resultReports: 'result-reports',
    blogImages: 'blog-images',
};

// Export bucket name
export const bucketName = s3Config.bucket;
