import { HttpException, HttpStatus } from '@nestjs/common';

/** An HTTP error whose message is already user-facing Spanish text. */
export class AppException extends HttpException {
  constructor(status: HttpStatus, message: string, details?: string[]) {
    super({ statusCode: status, message, ...(details ? { details } : {}) }, status);
  }
}
