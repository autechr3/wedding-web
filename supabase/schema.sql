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
  song_request text,
  note text
);

create table if not exists rsvp_events (
  id uuid primary key default gen_random_uuid(),
  rsvp_id uuid not null references rsvps(id) on delete cascade,
  event_key text not null,
  attending boolean not null default false
);

alter table rsvps enable row level security;
alter table rsvp_events enable row level security;

-- Public (anon) clients may INSERT only; no SELECT/UPDATE/DELETE is granted,
-- so guests can submit but cannot read others' RSVPs. The couple reads via the
-- Supabase dashboard (service role) or an authenticated admin view later.
create policy "anon insert rsvps" on rsvps for insert to anon with check (true);
create policy "anon insert events" on rsvp_events for insert to anon with check (true);

-- Instant per-RSVP notification (in addition to the daily digest cron).
-- Requires pg_net: create extension if not exists pg_net;
--
-- The client submits in two writes (rsvps, then the rsvp_events array). We fire
-- on rsvp_events, statement-level, so the trigger runs once per RSVP *after* both
-- rows are committed and the edge function can read a complete record. pg_net
-- sends its HTTP request only after this transaction commits. SECURITY DEFINER so
-- the anon role need not hold pg_net rights; the net call is wrapped so a notify
-- failure can never block the INSERT.
create or replace function public.notify_new_rsvp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rid uuid;
begin
  for rid in select distinct rsvp_id from new_events loop
    begin
      perform net.http_post(
        url := 'https://<project-ref>.supabase.co/functions/v1/rsvp-notify',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer <anon-jwt>'
        ),
        body := jsonb_build_object('id', rid)
      );
    exception when others then
      raise warning 'notify_new_rsvp: pg_net call failed for rsvp %: %', rid, sqlerrm;
    end;
  end loop;
  return null;
end;
$$;

drop trigger if exists rsvp_events_notify on rsvp_events;
create trigger rsvp_events_notify
after insert on rsvp_events
referencing new table as new_events
for each statement
execute function public.notify_new_rsvp();
