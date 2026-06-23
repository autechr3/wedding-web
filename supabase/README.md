# Supabase setup (RSVP backend)

This directory holds the database schema for the wedding RSVP form. The app already
works in dev without Supabase (RSVPs are logged to the console as a stub). To enable
real persistence + email:

## 1. Create the project
- Create a Supabase project at https://supabase.com (or run locally with `supabase start`,
  which requires Docker Desktop to be running).

## 2. Apply the schema
- Cloud: open the project's SQL editor and run the contents of `schema.sql`.
- Local: `supabase start` then `supabase db reset` (after placing schema in a migration),
  or paste `schema.sql` into the local Studio SQL editor (http://localhost:54323).

## 3. Wire the app
- Copy the project URL + anon key into `.env.local`:
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```
- Restart `npm run dev`. `isSupabaseConfigured` flips true and real inserts happen.

## 4. Email confirmation
- See `functions/rsvp-email/` (Edge Function) and the webhook setup notes for emailing
  the couple on each new RSVP via Resend.

## Security note
RLS grants anon INSERT only (no read). The shared passcode on the site is soft privacy,
not a security boundary; RLS is the real data protection.
