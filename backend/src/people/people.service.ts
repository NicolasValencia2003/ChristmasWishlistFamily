import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '../common/app-exception';
import { MSG } from '../common/messages';
import { cleanName, normalizeName } from '../common/normalize-name';
import { SupabaseService } from '../supabase/supabase.service';

export interface PersonRow {
  id: string;
  name: string;
  created_at: string;
}

export interface GiftDto {
  id: string;
  personId: string;
  name: string;
  url: string;
  createdAt: string;
}

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class PeopleService {
  constructor(private readonly db: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.db.client
      .from('people')
      .select('id, name, created_at, gifts(count)')
      .order('name_normalized', { ascending: true });
    if (error) this.db.fail('list people', error);

    return (data ?? []).map((p) => ({
      id: p.id as string,
      name: p.name as string,
      createdAt: p.created_at as string,
      giftCount: (p.gifts as { count: number }[] | null)?.[0]?.count ?? 0,
    }));
  }

  async findOne(id: string) {
    const { data: person, error } = await this.db.client
      .from('people')
      .select('id, name, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) this.db.fail('get person', error);
    if (!person) throw new AppException(HttpStatus.NOT_FOUND, MSG.personNotFound);

    const { data: gifts, error: giftsError } = await this.db.client
      .from('gifts')
      .select('id, person_id, name, url, created_at')
      .eq('person_id', id)
      .order('created_at', { ascending: false });
    if (giftsError) this.db.fail('list gifts', giftsError);

    return {
      id: person.id,
      name: person.name,
      createdAt: person.created_at,
      gifts: (gifts ?? []).map(toGiftDto),
    };
  }

  /**
   * Finds a person by normalized name or creates them. If two requests create the
   * same name at once, the unique index rejects the second insert and we re-read.
   */
  async findOrCreate(rawName: string): Promise<PersonRow> {
    const name = cleanName(rawName);
    const nameNormalized = normalizeName(name);

    const existing = await this.findByNormalized(nameNormalized);
    if (existing) return existing;

    const { data, error } = await this.db.client
      .from('people')
      .insert({ name, name_normalized: nameNormalized })
      .select('id, name, created_at')
      .single();

    if (!error && data) return data as PersonRow;

    if (error?.code === UNIQUE_VIOLATION) {
      const winner = await this.findByNormalized(nameNormalized);
      if (winner) return winner;
    }
    this.db.fail('create person', error);
  }

  private async findByNormalized(nameNormalized: string): Promise<PersonRow | null> {
    const { data, error } = await this.db.client
      .from('people')
      .select('id, name, created_at')
      .eq('name_normalized', nameNormalized)
      .maybeSingle();
    if (error) this.db.fail('find person', error);
    return (data as PersonRow | null) ?? null;
  }
}

export function toGiftDto(g: {
  id: string;
  person_id: string;
  name: string;
  url: string;
  created_at: string;
}): GiftDto {
  return { id: g.id, personId: g.person_id, name: g.name, url: g.url, createdAt: g.created_at };
}
