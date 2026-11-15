import 'reflect-metadata';
import { HttpStatus, INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { AppException } from './common/app-exception';
import { SpanishExceptionFilter } from './common/http-exception.filter';

function allowedOrigins(): string[] | boolean {
  const raw = process.env.FRONTEND_ORIGIN?.trim();
  if (!raw) return ['http://localhost:5173'];
  if (raw === '*') return true;
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function firstMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((e) => {
    const c = e.constraints ?? {};
    // One message per field; "required" wins over "must be text" / "valid URL".
    const message = c.isNotEmpty ?? Object.values(c)[0];
    return message ? [message] : firstMessages(e.children ?? []);
  });
}

/** Builds and configures the Nest application (shared by local dev and Vercel). */
export async function createApp(expressApp?: Express): Promise<INestApplication> {
  const app = expressApp
    ? await NestFactory.create(AppModule, new ExpressAdapter(expressApp), { logger: ['error', 'warn'] })
    : await NestFactory.create(AppModule);

  app.enableCors({
    origin: allowedOrigins(),
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  });

  app.useGlobalFilters(new SpanishExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const details = firstMessages(errors);
        return new AppException(HttpStatus.BAD_REQUEST, details[0] ?? 'La solicitud no es válida', details);
      },
    }),
  );

  return app;
}
