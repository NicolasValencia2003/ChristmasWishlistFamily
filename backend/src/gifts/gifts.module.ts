import { Module } from '@nestjs/common';
import { PeopleModule } from '../people/people.module';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './gifts.service';

@Module({ imports: [PeopleModule], controllers: [GiftsController], providers: [GiftsService] })
export class GiftsModule {}
