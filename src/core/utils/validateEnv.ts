import { cleanEnv, str } from 'envalid';

// validate environment variables
const validateEnv = () => {
    cleanEnv(process.env, {
        NODE_ENV: str(),
        MONGODB_URI: str(),
    });
};

export default validateEnv;
