import logger from '../common/utils/logger';

const requiredEnvVars = [
  {
    key: 'NODE_ENV',
    defaultValue: 'development',
    description: 'Application environment (development/production)'
  },
  {
    key: 'PORT',
    defaultValue: '3000',
    description: 'Port number for the server'
  },
  {
    key: 'JWT_SECRET',
    description: 'Secret key for JWT token generation',
    required: true
  },
  {
    key: 'JWT_EXPIRES_IN',
    defaultValue: '1d',
    description: 'JWT token expiration time'
  },
  {
    key: 'CORS_ORIGIN',
    defaultValue: 'http://localhost:3000',
    description: 'Allowed CORS origins'
  },
  {
    key: 'LOG_LEVEL',
    defaultValue: 'info',
    description: 'Logging level (debug/info/warn/error)'
  },
  {
    key: 'RATE_LIMIT_WINDOW',
    defaultValue: '15',
    description: 'Rate limiting window in minutes'
  },
  {
    key: 'RATE_LIMIT_MAX_REQUESTS',
    defaultValue: '100',
    description: 'Maximum requests per window'
  }
];

export function validateEnvVariables(): void {
  logger.info('Validating environment variables...');

  const missingVars: string[] = [];
  const usingDefaults: string[] = [];

  requiredEnvVars.forEach(({ key, defaultValue, description, required }) => {
    if (!process.env[key]) {
      if (required) {
        missingVars.push(`${key} (${description})`);
      } else if (defaultValue) {
        process.env[key] = defaultValue;
        usingDefaults.push(`${key}=${defaultValue} (${description})`);
      }
    }
  });

  if (missingVars.length > 0) {
    logger.error('❌ Missing required environment variables:');
    missingVars.forEach(variable => {
      logger.error(`   - ${variable}`);
    });
    logger.error('\nPlease add these variables to your .env file');
    throw new Error('Missing required environment variables');
  }

  if (usingDefaults.length > 0) {
    logger.warn('⚠️ Using default values for:');
    usingDefaults.forEach(variable => {
      logger.warn(`   - ${variable}`);
    });
  }

  logger.info('✅ Environment variables validated successfully');
  logger.debug('Current environment configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    LOG_LEVEL: process.env.LOG_LEVEL,
    // Don't log sensitive values like JWT_SECRET
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS
  });
}