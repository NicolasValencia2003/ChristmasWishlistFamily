import 'reflect-metadata';
import type { IncomingMessage, ServerResponse } from 'http';
import express, { Express } from 'express';
import { createApp } from '../src/create-app';

// Cached across invocations while the serverless instance stays warm.
let serverPromise: Promise<Express> | null = null;

async function bootstrap(): Promise<Express> {
  const server = express();
  const app = await createApp(server);
  await app.init();
  return server;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!serverPromise) {
    serverPromise = bootstrap().catch((err) => {
      serverPromise = null; // allow a retry on the next request
      throw err;
    });
  }
  const server = await serverPromise;
  server(req as express.Request, res as express.Response);
}
