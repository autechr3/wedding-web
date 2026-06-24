-- Wedding RSVP schema for Supabase (Postgres).
-- Apply via: Supabase Dashboard SQL editor, or `supabase db push` after `supabase link`,
-- or psql against the project's connection string.

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  party_size int not null default 1,
  locale text not null default 'en',
  dietary text,
  song_request text,
  note text
);

create table if not exists rsvp_guests (
  id uuid primary key default gen_random_uuid(),
  rsvp_id uuid not null references rsvps(id) on delete cascade,
  guest_name text,
  georgia_first text,
  georgia_entree text,
  georgia_dessert text
);

create table if not exists rsvp_events (
  id uuid primary key default gen_random_uuid(),
  rsvp_id uuid not null references rsvps(id) on delete cascade,
  event_key text not null,
  attending boolean not null default false
);

alter table rsvps enable row level security;
alter table rsvp_guests enable row level security;
alter table rsvp_events enable row level security;

-- Public (anon) clients may INSERT only; no SELECT/UPDATE/DELETE is granted,
-- so guests can submit but cannot read others' RSVPs. The couple reads via the
-- Supabase dashboard (service role) or an authenticated admin view later.
create policy "anon insert rsvps" on rsvps for insert to anon with check (true);
create policy "anon insert guests" on rsvp_guests for insert to anon with check (true);
create policy "anon insert events" on rsvp_events for insert to anon with check (true);
