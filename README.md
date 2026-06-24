# Negar & Matt — Wedding Site

A bilingual (English / Farsi) wedding website with an online RSVP.

**Live:** https://negarandmatt.com

## Stack

- **React 19** + **Vite 8** + **TypeScript**
- **Tailwind CSS v4** for styling
- **Supabase** (Postgres) for RSVP persistence — `anon` `INSERT`-only RLS
- **i18next** for EN/FA localization (RTL + Jalali / Persian-digit dates)
- **Vercel** hosting · **GitHub Actions** CI (lint · test · build)

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:5173
```

`.env.local`:

| Variable | Purpose |
|----------|---------|
| `VITE_SITE_PASSCODE` | Shared passcode for the entry gate |
| `VITE_SUPABASE_URL` | Supabase project URL — optional; RSVP falls back to a console stub if unset |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable (anon) key |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm test` | Run the Vitest suite |
| `npm run lint` | ESLint |
| `npm run photos` | Optimize source photos to WebP |

## Notes

- Single long-scroll page behind a shared-passcode gate. The passcode is soft
  privacy; the real data boundary is Supabase Row-Level Security.
- The Supabase client is code-split and loaded only when an RSVP is submitted.
- Deployment + DNS runbook: [`DEPLOY.md`](./DEPLOY.md). RSVP schema: [`supabase/schema.sql`](./supabase/schema.sql).
