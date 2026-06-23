# Negar & Matthew — Wedding Website Design Spec

**Date:** 2026-06-22
**Domain:** negarandmatt.com
**Status:** Design approved; pending spec review → implementation plan

---

## 1. Overview

A bilingual (English / Farsi) multi-page wedding website for Negar Neshat & Matthew
Grogan. It presents three celebrations, provides travel/accommodation information,
answers guest questions, and collects per-event RSVPs (stored in Supabase, with an
email confirmation sent to the couple). The visual identity is derived directly from
the couple's printed invitation: a cobalt-blue field, gold accents, a gold seashell
crest, and formal script + serif typography ("Coastal Heirloom" direction).

This spec covers the **frontend design and supporting architecture**. Hosting/DNS
wiring and backend implementation happen after the front end is approved, but the
relevant decisions are recorded here so the build accounts for them.

---

## 2. Goals & Non-Goals

### Goals
- Elegant, invitation-matched design that works beautifully on mobile (primary device
  for most guests).
- Clear primary CTAs everywhere: **RSVP** and **at-a-glance when/where**.
- Full English + Farsi parity: translated content, right-to-left (RTL) layout, Persian
  solar (Jalali) calendar dates, and Persian numerals when Farsi is active.
- Per-event RSVP with a main-course selection for the Georgia dinner.
- Graceful "details coming soon" states for not-yet-known information so the site can
  launch early and be filled in without redesign.
- Soft privacy via a single shared passcode.

### Non-Goals (for now)
- Per-guest accounts / magic links / guest-list management.
- A dedicated photo gallery page (photos live inline; may add later).
- Hard security/auth (passcode is a soft gate, not a security boundary — stated plainly).
- Multi-currency or payment handling.

---

## 3. Confirmed Decisions

| Topic | Decision |
|---|---|
| Design direction | **A — Coastal Heirloom** (cobalt + gold, invitation-derived) |
| Photo treatment | **Alternating light bands** — cobalt hero/key moments + cream/photo bands between |
| Names script font | **Pinyon Script** (Google Fonts, free web-licensed look-alike for the paid "Monalisa Script") |
| Page structure | **Multi-page** site |
| Privacy | **Single shared passcode** (soft gate); guests self-select which events they attend |
| RSVP scope | **One site, per-event RSVP**; guests indicate Yes/No per celebration |
| RSVP email | Supabase **DB webhook on insert → email via Resend** (store + notify) |
| Hosting | **Vercel** (SPA) + **Supabase** (DB/email). Supabase static hosting evaluated and rejected (not a real SPA host). |
| i18n scope | **Full** translation, RTL, Jalali dates, Persian numerals; couple approves Farsi copy |
| Hotels | **Pre-fill real nearby hotels** (verify before launch) |
| TBD content | **Graceful "coming soon" placeholders** |
| Gallery | **Omitted for now** |

---

## 4. Tech Stack

- **Build:** Vite + React (TypeScript) + Tailwind CSS v4.
- **Routing:** React Router (multi-page SPA).
- **i18n:** `react-i18next` (or a lightweight custom context) with JSON resource files
  per locale (`en`, `fa`). RTL via `dir="rtl"` on `<html>` + Tailwind logical
  properties / `[dir=rtl]` variants.
- **Dates:** `dayjs` with `jalaliday` (or `jalaali-js`) for Gregorian↔Jalali conversion
  and Persian-numeral formatting. A single `formatEventDate(date, locale)` helper is the
  only place calendar logic lives.
- **Data/Backend:** Supabase (Postgres + Edge Functions + DB webhooks).
- **Email:** Resend (domain-verified on negarandmatt.com), triggered by a Supabase DB
  webhook on RSVP insert.
- **Hosting:** Vercel; DNS for negarandmatt.com pointed at Vercel.
- **Fonts (all free/web-licensed):**
  - Display script (names): **Pinyon Script**
  - Serif headings/body accents: **Cormorant Garamond**
  - All-caps label/crest serif: **Cinzel**
  - UI/body sans: **Jost**
  - Farsi: **Vazirmatn** (and/or a Persian serif such as **Gulzar** for display) — chosen
    for good Persian glyph coverage and RTL.

---

## 5. Visual Identity

- **Palette (CSS variables):**
  - `--cobalt: #3a4a8c`, `--cobalt-deep: #2b3667`, `--cobalt-dark: #222c54`
  - `--cream: #f3ede0`, `--cream-2: #ece4d3`
  - `--gold: #c79a4b`, `--gold-soft: #d8b873`
  - `--ink: #1d2240`
  - (Exact hex to be color-picked from the invitation PNGs during implementation.)
- **Motifs:** gold inner border "frame" on cobalt panels; gold seashell crest; "N · M"
  monogram; thin gold rules.
- **Hero:** cobalt field, gold inner frame, names in Pinyon Script, crest, Farsi
  "جشن عروسی" label, formal date line, RSVP CTA.
- **Photo bands:** edge-to-edge cream/photo sections between cobalt sections; large
  featured shots + occasional duos.
- **Motion:** restrained, tasteful — staggered fade/rise on load for hero elements,
  gentle reveal-on-scroll for sections. No heavy animation.

### Image pipeline
Source photos in `/photos` are very large (up to ~20 MB). Build step (or a one-time
script) produces web-optimized, responsive variants (e.g., 800/1400/2000 px WebP/JPEG)
served from the app's assets. Originals stay out of the deployed bundle.

---

## 6. Site Map & Routes

Passcode gate → one-time language pick → site. Persistent top nav on every page
(`N·M` monogram · Home · Events · Travel & Stay · FAQ · **RSVP** · 🇺🇸/🇮🇷 flags).

| Route | Page | Key content |
|---|---|---|
| `/` | **Home** | Hero (names/date/crest), RSVP CTA + at-a-glance when/where, welcome/story band, snapshot of the three celebrations, optional countdown to Oct 6 2026 |
| `/events` | **Events** | Georgia (court + dinner, Mac's Chophouse, date TBD); Türkiye Rehearsal (Oct 5, Liberty Lykia); Türkiye Wedding & Reception (Oct 6, 5:30 PM); Boat Party (Oct 7, TBD). Each: when/where/map/dress code + graceful TBD states |
| `/travel` | **Travel & Stay** | Fly into Dalaman (DLM); transfers; Liberty Lykia (main) + Adults-Only (alt); **pre-filled nearby hotels**; day-pass note; Beach Formal dress code; things to do (nice-to-have) |
| `/faq` | **FAQ** | Destination-wedding FAQs (visa, currency, weather, packing, tipping, kids, plus-ones, gifts) — driven by the content checklist |
| `/rsvp` | **RSVP** | The form (see §8) |
| (gate) | **Passcode + language** | Soft passcode entry, then 🇺🇸/🇮🇷 language pick |

Language switch (small flags, top-right) is available on every page and persists the
choice (localStorage). Selecting Farsi sets `dir="rtl"` and Jalali dates globally.

---

## 7. Internationalization (EN / FA)

- **Resource files:** `src/locales/en/*.json`, `src/locales/fa/*.json`, keyed by page/
  section. Couple supplies/approves the Farsi copy; structure ships with English plus
  Farsi placeholders clearly marked where prose is pending.
- **Direction:** `dir="rtl"` on `<html>` when `fa`; layout uses logical properties so
  mirroring is automatic. Spot-check nav, RSVP form, and event cards in RTL.
- **Calendar:** when locale is `fa`, all displayed dates render in the **Persian solar
  (Jalali)** calendar with **Persian numerals**; English uses Gregorian. All dates stored
  as ISO Gregorian; conversion is display-only via `formatEventDate`.
- **Fonts:** Latin stack for `en`; Persian stack (Vazirmatn / Persian display serif) for
  `fa`, swapped via the `lang`/`dir` attributes.
- **Persisted choice:** language stored in localStorage; first visit shows the explicit
  flag pick after the passcode gate.

---

## 8. RSVP Form & Data Model

### Form fields
- Full name (per primary guest / household).
- Email.
- Party size + names of additional guests (dynamic rows).
- **Per-event attendance** (Yes / No) for each celebration the guest self-selects:
  Georgia, Türkiye Rehearsal, Türkiye Wedding, Boat Party.
- **Main-course selection per attending guest** for the Georgia dinner
  (options TBD — placeholder set until Mac's menu is finalized).
- Dietary restrictions / allergies (free text).
- Song request (optional).
- Note to the couple (optional).

### Supabase schema (initial)
```
rsvps
  id              uuid pk default gen_random_uuid()
  created_at      timestamptz default now()
  full_name       text not null
  email           text not null
  party_size      int  not null default 1
  locale          text not null default 'en'   -- which language they used
  note            text
  song_request    text
  dietary         text

rsvp_guests        -- one row per person in the party
  id              uuid pk
  rsvp_id         uuid fk -> rsvps.id
  guest_name      text
  -- main course only relevant for Georgia dinner
  georgia_main    text

rsvp_events        -- one row per (rsvp, event) attendance answer
  id              uuid pk
  rsvp_id         uuid fk -> rsvps.id
  event_key       text   -- 'georgia' | 'turkey_rehearsal' | 'turkey_wedding' | 'boat'
  attending       boolean
```
(Final shape refined during the implementation plan; this captures the intent.)

### Flow
1. Guest submits → client validates → insert into `rsvps` (+ child rows) via Supabase JS
   client using the anon key, governed by **Row Level Security** that permits inserts
   only (no public read of others' RSVPs).
2. A **Supabase DB webhook on insert** to `rsvps` calls an Edge Function (or Resend
   directly) that emails a formatted confirmation/summary to the couple's address.
3. Guest sees an on-site success state.

### Privacy note
The shared passcode is a **soft gate** (client-side, keeps the site out of casual/public
view and out of search engines). It is not a security boundary. RLS protects the data
regardless of the gate.

---

## 9. Content Plan & Real Starter Data

### Hotels (pre-filled — **verify before launch**)
Near Liberty Lykia Resort, Ölüdeniz / Fethiye:
- **Liberty Lykia – Adults Only** — connected adults-only sister property (couple's alt #1).
- **Sundia by Liberty Ölüdeniz** — Liberty property; Michelin-recommended restaurant (Ada).
- **Beyaz Yunus Hotel (Adults Only)** — ~1.3 mi, highly rated (~9.6).
- **Ecclesia Boutique Hotel (Adults Only)** — ~1.5 mi, highly rated (~9.8).
- **Belcekum Beach Hotel** — ~1.5 mi, private beach.
- **Garcia Resort & Spa** / **Kassandra Boutique Hotel** — additional Ölüdeniz options.

Each hotel card: name, short descriptor, approx distance to resort, price tier, link.
A clear note instructs the couple to verify availability/details before launch.

### Known facts baked into content
- Wedding: **Tuesday, October 6, 2026, 5:30 PM**, Liberty Lykia Resort, Ölüdeniz, Türkiye.
- Rehearsal dinner: **October 5, 2026**, at the resort.
- Boat party: **October 7, 2026** (details TBD).
- Georgia: court ceremony at noon + dinner 2:00 PM at Mac's Chophouse, Marietta, GA
  (~2–3 weeks before; exact date TBD).
- Airport: **Dalaman (DLM)**; transfers can be arranged; day-pass for off-resort guests.
- Dress code: **Beach Formal**; light, colorful, Mediterranean-inspired; avoid black/very dark.

### Graceful TBD placeholders
Georgia exact date, Mac's main-course menu, boat-party details, exact transfer logistics —
all render as elegant "More details to come" states.

### Separate deliverable
A **content-gathering checklist** (the fiancée's request) is produced alongside this
spec, organized by category with Required-before-launch / Nice-to-have / Optional tags.
It drives which placeholders must be filled before go-live. Saved to
`docs/content-checklist.md`.

---

## 10. Hosting & DNS (post-design)

- **Vercel** project from the Vite build; SPA fallback rewrite so client routes work.
- **DNS for negarandmatt.com:** point apex + `www` at Vercel (A/ALIAS + CNAME per Vercel's
  instructions); Vercel provisions HTTPS automatically.
- **Resend:** add the DKIM/SPF DNS records on negarandmatt.com to verify the sending domain.
- **Supabase:** project + tables + RLS + insert webhook; store anon/URL as Vite env vars;
  keep service-role key server-side only (Edge Function).

---

## 11. Component Architecture (frontend)

Small, focused, independently understandable units:

- `App` / router shell — providers (i18n, locale/dir, passcode gate), layout.
- `PasscodeGate` — soft passcode entry; unlocks app; one-time language pick.
- `LocaleProvider` — current locale, `dir`, date formatter, persistence.
- `Nav` — persistent top nav + flag language switcher.
- `Hero` — cobalt keepsake hero (names, crest, date, CTA).
- `PhotoBand` — reusable edge-to-edge photo/cream section (single or duo).
- `EventCard` — when/where/map/dress-code, supports TBD state.
- `HotelCard` — hotel info card.
- `FaqList` — accordion of Q&A from locale resources.
- `RsvpForm` — multi-event form + per-guest main course; Supabase submit; success state.
- `useEventDate` / `formatEventDate` — the single calendar/numeral formatting helper.
- Pages: `Home`, `Events`, `Travel`, `Faq`, `Rsvp`.

Content (event details, hotels, FAQ) lives in structured data/locale files, not hardcoded
in components, so it's editable without touching layout.

---

## 12. Build Order (high level — detailed in implementation plan)

1. Scaffold Vite + React + TS + Tailwind v4; fonts; color tokens; image pipeline.
2. Layout shell, Nav, LocaleProvider, RTL plumbing, date helper.
3. Home (hero + bands + snapshot).
4. Events, Travel & Stay (with real hotels), FAQ.
5. RSVP form (UI + validation) with mocked submit.
6. Passcode gate.
7. Farsi resource files + RTL/Jalali pass.
8. Supabase wiring (tables, RLS, insert, webhook → Resend email).
9. Hosting + DNS + Resend domain verification.
10. Content fill-in from checklist; verify hotels; launch.

---

## 13. Open Items (do not block design approval)

- Final Farsi copy (couple-supplied/approved).
- Monalisa Script is paid → using Pinyon Script (resolved).
- Mac's Chophouse main-course options.
- Georgia exact date; boat-party details; transfer logistics.
- Shared passcode value.
- Exact invitation hex values (color-pick during build).
