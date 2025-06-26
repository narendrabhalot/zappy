import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import logger from '../utils/logger';
import { MongoServerError } from 'mongodb';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    // 🌟 Handle known error types
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (
      (exception as MongoServerError)?.code === 11000 // 🔥 Duplicate key error
    ) {
      status = HttpStatus.CONFLICT; // 409 Conflict;
      const duplicatedField = Object.keys((exception as MongoServerError).keyValue || {}).join(', ');
      message = `${duplicatedField} is already exists.`;
    } else if ((exception as any)?.message) {
      message = (exception as any).message;
    }

    // If message is an object, try to extract
    if (typeof message === 'object' && message !== null) {
      if (message.message) {
        message = message.message;
      }
    }

    const stack = exception instanceof Error ? exception.stack : '';

    const logMessage = this.isProduction
      ? `Error:
        Method: ${request.method}
        Path: ${request.url}
        Status: ${status}
        Message: ${JSON.stringify(message)}`
      : `Error:
        Method: ${request.method}
        Path: ${request.url}
        Status: ${status}
        Message: ${JSON.stringify(message)}
        Stack: ${stack}`;

    logger.error(logMessage);

    Sentry.withScope((scope) => {
      scope.setExtra('request_url', request.url);
      scope.setExtra('request_method', request.method);
      scope.setExtra('error_details', message);
      Sentry.captureException(exception);
    });

    const errorResponse: any = {
      statusCode: status,
      error: status === 400 ? 'Bad Request' : 'Internal Server Error',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (!this.isProduction && stack) {
      errorResponse.stack = stack;
    }

    response.status(status).json(errorResponse);
  }
}
