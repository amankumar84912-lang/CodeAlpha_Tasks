import { cleanEnv, str, port } from 'envalid';

/**
 * Validates all required environment variables at startup.
 * Server will crash immediately with a clear message if any are missing or invalid.
 * Call this function AFTER dotenv.config() has populated process.env.
 */
export const validateEnv = () =>
  cleanEnv(process.env, {
    PORT: port({ default: 5000 }),
    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
    MONGO_URI: str({ docs: 'MongoDB Atlas connection string' }),
    JWT_SECRET: str({ docs: 'JWT signing secret (64-char hex recommended)' }),
    CLIENT_URL: str({ default: 'http://localhost:5173' }),
    CLOUDINARY_CLOUD_NAME: str({ docs: 'Cloudinary cloud name' }),
    CLOUDINARY_API_KEY: str({ docs: 'Cloudinary API key' }),
    CLOUDINARY_API_SECRET: str({ docs: 'Cloudinary API secret' }),
  });
