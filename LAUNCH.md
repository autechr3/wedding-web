# Launch Tie-Off — Negar & Matthew Wedding Site

Status after the event-details + hero update. **The entire frontend is built, tested (26 passing),
and verified working in a browser** — passcode gate, bilingual EN/Farsi with RTL + Jalali
(Persian solar) dates, and a working RSVP form. The site is a **single long-scroll page**
(no separate routes): a photo-forward **Hero** ("Negar & Matt" over the boardwalk engagement
photo) → Our Story → Georgia Celebration → Rehearsal Dinner → photo band → Wedding & Reception
(with the day-of timeline, travel info + 3 hotels colocated here) → RSVP. Each event shows its
own dress code, "children welcome", and RSVP-by date. There is no separate FAQ — those facts
are woven into the relevant sections. The RSVP currently runs in **stub mode** (submissions log
to the browser console) because Supabase isn't wired up yet — see step 1 below.

**Event details now baked in:** Georgia 12:30–3:30 PM, Day Cocktail, RSVP by Sep 9 · Rehearsal
at **Balbura Italian Restaurant** (Liberty Lykia), 6:00 PM, Beach Cocktail, RSVP by Aug 1 ·
Wedding Oct 6, 5:30 PM ceremony with full timeline (cocktails 6–7, dinner 7, speeches 8:30,
dancing 9–12), Beach Formal, **no gifts ("your presence is our gift")**, RSVP by Aug 1. A
**complimentary day pass** covers off-resort guests for both the rehearsal and the wedding.
The Georgia RSVP collects **three Mac's Tier 2 courses per guest** (first / entrée / dessert).

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
- [ ] **Georgia exact date** — `src/content/events.ts`, georgia event `date` (currently null → "Date coming soon"). The time (12:30–3:30 PM) and RSVP-by (Sep 9) are set.
- [ ] **Confirm Mac's Tier 2 selections** — the 3-course dropdowns use Caesar/Seasonal Salad/Seasonal Soup, 8oz Filet/Crispy Chicken/Pan-Seared Salmon, NY Cheesecake/Chocolate Mousse (`src/content/georgiaMenu.ts`). Verify "Seasonal Salad/Soup" specifics with Mac's.
- [ ] **Who's invited to which events** — guests self-select on the RSVP form; confirm that's acceptable.
- [ ] **A contact method** for guest questions — not yet on the site; consider adding to the Story or footer.
- [ ] **Verify the two placeholder hotels** in `src/content/hotels.ts` — **Morina Deluxe Hotel** and
      **Hotel Karbel Sun** have neutral placeholder descriptions and Google-search links; confirm real
      details/booking links before launch. (Liberty Lykia Resort is the host.)
- [ ] **Confirm Balbura** (rehearsal venue) spelling/details.
- [ ] **Supabase schema migration:** `supabase/schema.sql` changed `rsvp_guests` from `georgia_main`
      to `georgia_first/entree/dessert`. The DB isn't live yet; if you ever already created the table,
      run an `ALTER TABLE` (the create-if-not-exists won't add the columns).

---

## Farsi to have a native speaker confirm before launch

The Farsi is coherent and complete, but a few authored strings are worth a native pass:

- **"Georgia" = US state, not the country.** The Georgia event Farsi uses "گرجستان" (the
  country). Since the dinner is in Georgia, USA (Marietta), confirm the intended wording in
  `src/content/events.ts` (titleFa/locationFa) and `rsvp.georgiaLegend` in `src/locales/fa/common.json`.
- **"شام تمرین"** (rehearsal dinner) — literal; a native speaker may prefer an idiom.
- **New event-detail strings** in `src/content/events.ts` (Farsi dress codes — کوکتل روزانه /
  کوکتل ساحلی / رسمی ساحلی; the wedding **timeline** lines; the **no-gifts** note; Balbura's
  Farsi name بالبورا) and the RSVP **3-course** labels (پیش‌غذا / غذای اصلی / دسر) in
  `src/locales/fa/common.json` — quick native read-through recommended.
- **Event time/date strings** (e.g. Georgia "12:30 PM – 3:30 PM", the wedding timeline) are
  single content fields and render the same in both locales except the leading event **date**,
  which converts to Jalali. The timeline Farsi uses Persian numerals; English times within it
  read fine. Localize the bare time strings further only if desired.
- **Menu item names** (Caesar Salad, 8oz Filet, etc.) render in English in both locales —
  intentional (dish names); localize if you'd prefer Persian.
- **Validation error messages** (e.g. "Please choose a first course, entrée, and dessert…")
  come from `src/lib/rsvp.ts` and are English-only in both locales — a deferred i18n item.

---

## Nice-to-haves deferred (not blockers)

- A "Things to do in Türkiye" block within the Wedding section (Ölüdeniz Blue Lagoon,
  paragliding, Saklıkent, Butterfly Valley, Fethiye old town) — content ready in
  `docs/content-checklist.md`.
- The boat party (the day after) was dropped from the page — re-add to `src/content/events.ts`
  + the RSVP `EventKey` if you want it back.
- A photo gallery (5 optimized engagement photos exist; the hero + 2 bands use 3 of them —
  102 beach, 47 courtyard, 77 boardwalk; 110 embrace + 27 archway are indexed but spare).
- Localizing the RSVP **validation** error strings + the menu item names (currently English).

---

## Verified working (so you can trust the foundation)

- 26 unit/render tests pass; `npm run lint` clean; `npm run build` succeeds (no chunk warning —
  Supabase is code-split into an on-demand chunk). React Router was removed (single page).
- Browser-verified (EN + Farsi): photo hero ("Negar & Matt" over the boardwalk photo, legible);
  per-event dress/kids/RSVP-by; the wedding timeline + no-gifts note; day-pass wording covering
  both events; the accent photo band; the Georgia RSVP showing **3 course dropdowns** (Mac's
  Tier 2 options confirmed) with a full submit reaching "Thank you!" and a correctly-shaped stub
  payload (guests×1, events×3); the hero CTA anchors to RSVP; Jalali dates + Persian numerals
  throughout Farsi (Wedding = ۱۴ مهر ۱۴۰۵, deadlines ۱۸ شهریور / ۱۰ مرداد ۱۴۰۵).
- RSVP payload maps exactly to the Supabase schema (`rsvps` / `rsvp_guests` / `rsvp_events`),
  so enabling Supabase needs zero code changes — just env vars. Event keys are now the three
  `georgia` / `turkey_rehearsal` / `turkey_wedding`.
