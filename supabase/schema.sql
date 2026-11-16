-- Christmas wishlist schema. Paste this whole file into the Supabase SQL editor and click Run.
-- Safe to run more than once.

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_normalized text not null,
  created_at timestamptz default now()
);
create unique index if not exists people_name_normalized_unique on people (name_normalized);

create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  name text not null,
  url text,
  store text,
  details text,
  created_at timestamptz default now()
);
create index if not exists gifts_person_id_idx on gifts(person_id);

-- A gift needs a link, a store name, or both (upgrades databases created before `store` existed).
alter table gifts add column if not exists store text;
alter table gifts add column if not exists details text;
alter table gifts alter column url drop not null;
alter table gifts drop constraint if exists gifts_url_or_store;
alter table gifts add constraint gifts_url_or_store check (url is not null or store is not null);

alter table people enable row level security;
alter table gifts enable row level security;

-- Anyone with the anon key can READ (needed for realtime). Nobody can write except the backend (service role).
drop policy if exists "public read people" on people;
drop policy if exists "public read gifts" on gifts;
create policy "public read people" on people for select using (true);
create policy "public read gifts" on gifts for select using (true);

-- Explicit table privileges (newer Supabase projects don't always grant these automatically).
-- anon/authenticated: read only. service_role (the backend): read + write.
revoke all on people, gifts from anon, authenticated;
grant select on people, gifts to anon, authenticated;
grant select, insert, update, delete on people, gifts to service_role;

-- Enable realtime on both tables
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'people') then
    alter publication supabase_realtime add table people;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'gifts') then
    alter publication supabase_realtime add table gifts;
  end if;
end $$;
alter table gifts replica identity full;
