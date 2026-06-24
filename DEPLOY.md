# Deploy & DNS Runbook — negarandmatt.com

The site is a Vite + React SPA. Hosting on Vercel; data/email on Supabase + Resend.

## 1. Vercel project
- Push this repo to GitHub (or run `npx vercel`).
- Import into Vercel. It auto-detects Vite (build: `npm run build`, output: `dist`).
- The site is a single page (no client-side routes), so no SPA fallback/rewrite is needed —
  Vercel serves `index.html` directly. (The former `vercel.json` rewrite was removed.)

## 2. Environment variables (Vercel → Project → Settings → Environment Variables)
Set for Production (and Preview if desired):
- `VITE_SITE_PASSCODE` — the shared passcode guests use (e.g. from the invitation).
- `VITE_SUPABASE_URL` — from your Supabase project.
- `VITE_SUPABASE_ANON_KEY` — from your Supabase project.
(Without the Supabase vars, the RSVP form still works but only logs to the console — the
graceful stub. Set them to enable real persistence.)
Redeploy after setting env vars so the build picks them up.

## 3. Custom domain + DNS (negarandmatt.com)
- Vercel → Project → Settings → Domains → add `negarandmatt.com` and `www.negarandmatt.com`.
- At your domain registrar's DNS panel, add the records Vercel shows:
  - Apex `negarandmatt.com`: an A record to Vercel's IP (or ALIAS/ANAME if supported).
  - `www`: CNAME to `cname.vercel-dns.com`.
- Vercel provisions HTTPS automatically once DNS resolves.

## 4. Resend (daily RSVP digest email) DNS
- In Resend, add `negarandmatt.com` and copy the DKIM/SPF/return-path records.
- Add those records in the SAME registrar DNS panel (they use a `send` subdomain /
  DKIM selector, so they don't disturb the apex Vercel records or `eforward` MX).
- Once verified, set the Edge Function `FROM_EMAIL=rsvp@negarandmatt.com` (see
  `supabase/functions/rsvp-digest/README.md`).

## 5. Supabase backend
- `supabase/schema.sql` is applied. A **daily 5 PM ET digest** of all RSVPs emails
  the couple via Resend — the `rsvp-digest` function is deployed and scheduled with
  Supabase Cron (no per-RSVP emails). Set its secrets per
  `supabase/functions/rsvp-digest/README.md`.

## 6. Final checks (on the live domain)
- Passcode gate works; both languages (EN + Farsi RTL with Jalali dates) render.
- Submit a test RSVP → row appears in Supabase → confirmation email arrives.
- The page scrolls through all sections; the hero RSVP button jumps to the RSVP form.
