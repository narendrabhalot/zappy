import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as Sentry from '@sentry/node';
import logger from './common/utils/logger';
import { validateEnvVariables } from './config/env.validator';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

async function bootstrap() {
    validateEnvVariables();

    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Enable CORS
    app.enableCors();

    // Configure body parsing middleware with proper limits
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // strips properties that do not have decorators
            forbidNonWhitelisted: true, // throws an error if extra properties are sent
            transform: true, // automatically transform payloads to DTO classes
            transformOptions: {
                enableImplicitConversion: true, // disable implicit type conversion
            },
            enableDebugMessages: true, // add more detailed error messages
            stopAtFirstError: true, // stop at first error
            validationError: {
                target: false,
                value: true,
            },
        }),
    );

    // Global filters
    app.useGlobalFilters(new HttpExceptionFilter());

    // Sentry configuration
    if (process.env.SENTRY_DSN) {
        logger.info('Configuring Sentry...');
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: 1.0,
        });
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.info(`✨ Application is running on: http://localhost:${port}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
}

bootstrap();