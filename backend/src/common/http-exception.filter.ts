import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppException } from './app-exception';
import { MSG } from './messages';

const DEFAULT_MESSAGES: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: MSG.badRequest,
  [HttpStatus.NOT_FOUND]: MSG.notFound,
  [HttpStatus.PAYLOAD_TOO_LARGE]: MSG.tooLarge,
};

/**
 * Guarantees every error response is `{ statusCode, message }` with a Spanish message.
 * Framework errors (e.g. "Cannot GET /foo", JSON parse errors) are mapped to Spanish defaults.
 */
@Catch()
export class SpanishExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errors');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof AppException) {
      res.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      typeof (exception as { status?: unknown }).status === 'number'
    ) {
      // body-parser errors (invalid JSON, payload too large) carry a `status`.
      status = (exception as { status: number }).status;
    }

    if (status >= 500) this.logger.error(exception);

    const message =
      DEFAULT_MESSAGES[status] ?? (status >= 500 ? MSG.server : MSG.badRequest);
    res.status(status).json({ statusCode: status, message });
  }
}
