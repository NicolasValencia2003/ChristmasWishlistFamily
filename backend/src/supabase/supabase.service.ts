import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppException } from '../common/app-exception';
import { MSG } from '../common/messages';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  readonly client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    }
    this.client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  /** Logs a database error and converts it into a Spanish user-facing error. */
  fail(context: string, error: unknown): never {
    this.logger.error(`${context}: ${JSON.stringify(error)}`);
    throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, MSG.database);
  }
}
