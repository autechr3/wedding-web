# Launch Tie-Off — Negar & Matthew Wedding Site

Status as of the overnight build. **The entire frontend is built, tested (27 passing),
and verified working in a browser** — passcode gate, bilingual EN/Farsi with RTL + Jalali
(Persian solar) dates, Home/Hero, Events, Travel & Stay (real hotels), FAQ, and a working
RSVP form. The RSVP currently runs in **stub mode** (submissions log to the browser console)
because Supabase isn't wired up yet — see step 1 below.

Run it locally: `npm install` then `npm run dev`, open the URL, enter the passcode
(`lykia2026` in `.env.local`, change before launch). Toggle the 🇺🇸/🇮🇷 flags top-right.

---

## What still needs YOU (accounts/credentials) — the go-live sequence

Follow `DEPLOY.md` (full detail). Short version:

1. **Supabase** — create a project, run `supabase/schema.sql` in its SQL editor, then put
   `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env.local` (and later in Vercel).
   The RSVP form flips from stub to real persistence automatically. *(Local alternative:
   start Docker Desktop, then `supabase start` — I couldn't tonight because the Docker
   daemon wasn't running.)*
2. **Email** — deploy `supabase/functions/rsvp-email`, set `RESEND_API_KEY` + `COUPLE_EMAIL`
   secrets, and create the INSERT webhook on `rsvps`. See `supabase/functions/rsvp-email/README.md`.
3. **Vercel** — import the repo (auto-detects Vite), set the three env vars, deploy.
4. **DNS for negarandmatt.com** — add Vercel's apex A + `www` CNAME records, plus Resend's
   DKIM/SPF records, at your registrar. See `DEPLOY.md`.

---

## Content still to finalize (drives the "coming soon" placeholders)

These are the **minimum-to-launch** gaps from `docs/content-checklist.md`. The site looks
intentional without them (graceful "coming soon" states), but fill them when known:

- [ ] **Shared passcode** value (set `VITE_SITE_PASSCODE`; tell guests on the invitation).
- [ ] **RSVP deadline** (invitation says Sept 6, 2026 — confirm; it's in the FAQ already).
- [ ] **Georgia exact date** — `src/content/events.ts`, georgia event `date` (currently null → "Date coming soon").
- [ ] **Mac's Chophouse main-course options** — `src/content/georgiaMenu.ts` (placeholders now).
- [ ] **Who's invited to which events** — guests self-select on the RSVP form; confirm that's acceptable.
- [ ] **Boat party details** (Oct 7) — `src/content/events.ts` boat event (currently "Details coming soon").
- [ ] **Airport transfer specifics** (cost, how to book, deadline) — FAQ / Travel copy.
- [ ] **A contact method** for guest questions — not yet on the site; consider adding to FAQ or footer.
- [ ] **Verify the hotels** in `src/content/hotels.ts` (names/links/distances are researched
      starting points — confirm before launch; note flagged in the file).

---

## Farsi to have a native speaker confirm before launch

The Farsi is coherent and complete, but a few authored strings are worth a native pass:

- **"Georgia" = US state, not the country.** The Georgia event Farsi uses "گرجستان" (the
  country). Since the dinner is in Georgia, USA (Marietta), confirm the intended wording in
  `src/content/events.ts` (titleFa/locationFa) and `rsvp.georgiaLegend` in `src/locales/fa/common.json`.
- **"شام تمرین"** (rehearsal dinner) — literal; a native speaker may prefer an idiom.
- **RSVP form** new strings in `src/locales/fa/common.json` under `rsvp.*` (party size, guest
  name interpolation, thank-you) — quick read-through recommended.
- The Georgia event **time string** ("12:00 PM ceremony · 2:00 PM dinner") is a single English
  content field in `events.ts` and renders in English even in Farsi — localize if desired.

---

## Nice-to-haves deferred (not blockers)

- "Things to do in Türkiye" section on Travel (Ölüdeniz Blue Lagoon, paragliding, Saklıkent,
  Butterfly Valley, Fethiye old town) — content ready in `docs/content-checklist.md`.
- A dedicated photo gallery page (we have 5 optimized engagement photos; only some are used).
- Countdown to Oct 6 on the Home page.
- Localizing the RSVP **validation** error strings (currently English; they come from
  `src/lib/rsvp.ts`).

---

## Verified working (so you can trust the foundation)

- 27 unit/render tests pass; `npm run lint` clean; `npm run build` succeeds (no chunk warning —
  Supabase is code-split into an on-demand chunk).
- Browser-verified: passcode gate blocks/unlocks; EN and Farsi both render; RTL mirrors
  correctly; Jalali dates show Persian numerals (Wedding = ۱۴ مهر ۱۴۰۵); full RSVP submit
  reaches the "Thank you!" success state with a correctly-shaped payload.
- RSVP payload maps exactly to the Supabase schema (`rsvps` / `rsvp_guests` / `rsvp_events`),
  so enabling Supabase needs zero code changes — just env vars.
