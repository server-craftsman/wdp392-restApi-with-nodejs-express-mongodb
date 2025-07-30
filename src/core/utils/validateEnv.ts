import { cleanEnv, str } from 'envalid';

// validate environment variables
const validateEnv = () => {
    cleanEnv(process.env, {
        NODE_ENV: str(),
        MONGODB_URI: str(),
        // AWS environment variables are optional
        AWS_REGION: str({ default: '' }),
        AWS_ACCESS_KEY_ID: str({ default: '' }),
        AWS_SECRET_ACCESS_KEY: str({ default: '' }),
        AWS_S3_BUCKET_NAME: str({ default: '' }),
    });
};

export default validateEnv;
