import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file (you can specify the path if needed)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
    mongodbUrl: string;
    port: number;
    nodeEnv: string;
}

const config: Config = {
    mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/zappy',
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development'
};

export default config;
