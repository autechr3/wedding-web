# Launch Tie-Off — Negar & Matthew Wedding Site

Status after the single-page restructure. **The entire frontend is built, tested (25 passing),
and verified working in a browser** — passcode gate, bilingual EN/Farsi with RTL + Jalali
(Persian solar) dates, and a working RSVP form. The site is now a **single long-scroll page**
(no separate routes): Hero → Our Story → Georgia Celebration → Rehearsal Dinner → Wedding &
Reception (with travel info + hotels colocated here) → RSVP. There is no separate FAQ — those
facts are woven into the relevant sections. The RSVP currently runs in **stub mode**
(submissions log to the browser console) because Supabase isn't wired up yet — see step 1 below.

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
- [ ] **RSVP deadline** (invitation says Sept 6, 2026 — confirm; it's in the Story section copy, `story.deadline`).
- [ ] **Georgia exact date** — `src/content/events.ts`, georgia event `date` (currently null → "Date coming soon").
- [ ] **Mac's Chophouse main-course options** — `src/content/georgiaMenu.ts` (placeholders now).
- [ ] **Who's invited to which events** — guests self-select on the RSVP form; confirm that's acceptable.
- [ ] **Airport transfer specifics** (cost, how to book, deadline) — `travel.airport` in the locale files.
- [ ] **A contact method** for guest questions — not yet on the site; consider adding to the Story or footer.
- [ ] **Verify the two placeholder hotels** in `src/content/hotels.ts` — **Morina Deluxe Hotel** and
      **Hotel Karbel Sun** have neutral placeholder descriptions and Google-search links; confirm real
      details/booking links before launch. (Liberty Lykia Resort is the host.)

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

- A "Things to do in Türkiye" block within the Wedding section (Ölüdeniz Blue Lagoon,
  paragliding, Saklıkent, Butterfly Valley, Fethiye old town) — content ready in
  `docs/content-checklist.md`.
- The boat party (the day after) was dropped from the page — re-add to `src/content/events.ts`
  + the RSVP `EventKey` if you want it back.
- A photo gallery (we have 5 optimized engagement photos; only one band is used now).
- Localizing the RSVP **validation** error strings (currently English; they come from
  `src/lib/rsvp.ts`).

---

## Verified working (so you can trust the foundation)

- 25 unit/render tests pass; `npm run lint` clean; `npm run build` succeeds (no chunk warning —
  Supabase is code-split into an on-demand chunk). React Router was removed (single page).
- Browser-verified: the single page scrolls Hero → Story → 3 events → Wedding (with inline
  travel + 3 hotels) → RSVP; the hero CTA anchors to the RSVP section (clears the sticky nav);
  passcode gate blocks/unlocks; EN and Farsi both render with RTL mirroring; Jalali dates show
  Persian numerals (Wedding = ۱۴ مهر ۱۴۰۵); full RSVP submit reaches the "Thank you!" state.
- RSVP payload maps exactly to the Supabase schema (`rsvps` / `rsvp_guests` / `rsvp_events`),
  so enabling Supabase needs zero code changes — just env vars. Event keys are now the three
  `georgia` / `turkey_rehearsal` / `turkey_wedding`.
