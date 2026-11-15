import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '../common/app-exception';
import { MSG } from '../common/messages';
import { PeopleService, toGiftDto } from '../people/people.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateGiftDto } from './create-gift.dto';

@Injectable()
export class GiftsService {
  constructor(
    private readonly db: SupabaseService,
    private readonly people: PeopleService,
  ) {}

  async create(dto: CreateGiftDto) {
    const person = await this.people.findOrCreate(dto.personName);

    const { data, error } = await this.db.client
      .from('gifts')
      .insert({ person_id: person.id, name: dto.giftName, url: dto.url })
      .select('id, person_id, name, url, created_at')
      .single();
    if (error || !data) this.db.fail('create gift', error);

    return { ...toGiftDto(data), person: { id: person.id, name: person.name } };
  }

  async remove(id: string) {
    const { data, error } = await this.db.client
      .from('gifts')
      .delete()
      .eq('id', id)
      .select('id');
    if (error) this.db.fail('delete gift', error);
    if (!data || data.length === 0) {
      throw new AppException(HttpStatus.NOT_FOUND, MSG.giftNotFound);
    }
    return { id };
  }
}
