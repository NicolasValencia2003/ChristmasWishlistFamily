import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Controller()
export class AppController {
  constructor(private readonly db: SupabaseService) {}

  @Get()
  health() {
    return { ok: true, message: 'API de la lista de regalos funcionando 🎄' };
  }

  /**
   * Touches the database. Called once a day by the Vercel cron in vercel.json so the
   * free Supabase project never counts as inactive (inactive free projects get paused).
   */
  @Get('health/db')
  async healthDb() {
    const { count, error } = await this.db.client
      .from('people')
      .select('id', { count: 'exact', head: true });
    if (error) this.db.fail('health check', error);
    return { ok: true, people: count ?? 0 };
  }
}
