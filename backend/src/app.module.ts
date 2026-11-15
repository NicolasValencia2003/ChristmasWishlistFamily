import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GiftsModule } from './gifts/gifts.module';
import { PeopleModule } from './people/people.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [SupabaseModule, PeopleModule, GiftsModule],
  controllers: [AppController],
})
export class AppModule {}
