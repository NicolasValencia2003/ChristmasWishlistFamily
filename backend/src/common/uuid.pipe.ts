import { HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { AppException } from './app-exception';
import { MSG } from './messages';

export const uuidPipe = new ParseUUIDPipe({
  exceptionFactory: () => new AppException(HttpStatus.BAD_REQUEST, MSG.invalidId),
});
