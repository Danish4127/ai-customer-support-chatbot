import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Response } from 'express';

/**
 * Catches EVERY exception thrown anywhere in the app.
 * 1. Reports it to Sentry (unless it's a normal 4xx client error).
 * 2. Returns a clean, consistent JSON error response to the client.
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? exception.getResponse()
      : (exception as Error)?.message || 'Internal server error';

    // Only send real (5xx) server errors to Sentry — no need to spam it
    // with normal validation errors (400) or not-found (404) responses.
    if (!isHttpException || status >= 500) {
      Sentry.captureException(exception);
    }

    this.logger.error(
      `[${status}] ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
