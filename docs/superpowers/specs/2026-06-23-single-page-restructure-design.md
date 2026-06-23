# Single-Page Restructure — Design Spec

**Date:** 2026-06-23
**Supersedes (structure only):** the multi-page layout in `2026-06-22-wedding-site-design.md`.
The visual identity (Coastal Heirloom: cobalt + gold, Pinyon Script names, photo bands,
EN/FA + RTL + Jalali dates, soft passcode gate, Supabase-stub RSVP) is UNCHANGED.

---

## 1. Goal

Convert the site from 5 routes (Home/Events/Travel/FAQ/RSVP) into a **single long-scroll
page**. Remove the FAQ-as-Q&A; fold its facts into the relevant sections. Colocate travel
info with the Türkiye events. Trim to a couple of sections and three events. Reduce the
hotel list to three.

## 2. Confirmed decisions

| Topic | Decision |
|---|---|
| Layout | **Single long-scroll page**; no separate routes |
| Routing | **Remove `react-router-dom`** — render the page directly; sections have anchor `id`s |
| Nav | **Minimal** — N·M monogram + EN/FA flags only (no section links) |
| FAQ | **Removed as a section**; its facts folded inline where relevant |
| Events | **Three**: Georgia, Türkiye Rehearsal, Türkiye Ceremony. **Boat party dropped** |
| Travel | **Colocated inside the Türkiye Ceremony section** (airport, transfers, dress code, day pass, hotels) |
| RSVP | **Final inline section** of the page; nav/hero CTA scrolls to it |
| Hotels | **Three**: Liberty Lykia Resort, Morina Deluxe Hotel, Hotel Karbel Sun |
| Hotel detail | **Minimal placeholders** for the two new ones (name + neutral one-liner + link); verify-before-launch note |
| Hotel data shape | **Simplified** (see §5) |

## 3. Page structure (top → bottom)

1. **Hero** — names, date, venue, RSVP-jump CTA (cobalt keepsake; unchanged visually).
2. **Welcome / Our Story** — short welcome + a photo band. Folds in the **RSVP deadline**
   fact ("Kindly RSVP by September 6, 2026").
3. **Georgia Celebration** — date coming soon · Marietta, GA · Mac's Chophouse ·
   12:00 PM ceremony, 2:00 PM dinner.
4. **Türkiye — Rehearsal Dinner** — October 5, 2026 · Liberty Lykia Resort.
5. **Türkiye — Ceremony & Reception (+ Travel & Stay)** — October 6, 2026, 5:30 PM ·
   Liberty Lykia Resort, Ölüdeniz. Inline travel facts: **fly into Dalaman (DLM), transfers
   can be arranged; dress code Beach Formal (light Mediterranean colors); day pass for
   off-resort guests**. Then **Where to stay**: the 3 hotels.
6. **RSVP** — the full form (unchanged behavior). Success state replaces this section.

Each section gets an `id` (`story`, `georgia`, `rehearsal`, `wedding`, `rsvp`) for anchor
scrolling and future deep-links.

## 4. Architecture changes

- **`src/App.tsx`**: remove `BrowserRouter/Routes/Route`. Render
  `LocaleProvider > PasscodeGate > Layout > <HomePage/>` where `HomePage` composes all
  sections. `Layout` keeps Nav + the cobalt background wrapper.
- **`src/components/Nav.tsx`**: drop the `NavLink` section links; keep the monogram + the two
  flag buttons (and their a11y attributes). No `react-router-dom` import.
- **New section components** under `src/components/sections/` (one responsibility each, kept
  small so they're easy to reason about and test):
  - `StorySection.tsx` (welcome + photo band + RSVP-deadline line)
  - `EventSection.tsx` (reusable: renders one event from `EventInfo`; the Türkiye-ceremony
    instance also renders the travel/hotels block via a `children` slot or a `travel` prop)
  - `TravelInfo.tsx` (the inline airport/dress/day-pass chips + hotel list) — rendered inside
    the wedding `EventSection`
  - `RsvpSection.tsx` (wraps the existing RSVP form body)
- **`src/pages/HomePage.tsx`** (replaces the five page files): composes Hero + the sections
  in order. The old `Events.tsx`, `Travel.tsx`, `Faq.tsx`, `Rsvp.tsx`, `Home.tsx` page files
  and their tests are removed/superseded; their logic moves into the section components.
- **Reuse**: `Hero`, `PhotoBand`, `EventCard`→folded into `EventSection`, `HotelCard`→
  simplified, `formatEventDate`, RSVP form/validation/submit, LocaleProvider — all reused.
- **`react-router-dom`** removed from `package.json`. `vercel.json` SPA rewrite becomes
  unnecessary (a single `index.html` needs no fallback) — leave it (harmless) or remove it;
  spec choice: **remove it** to avoid confusion.

## 5. Data changes

- **`src/content/events.ts`**: remove the `boat` event. Keep `georgia`, `turkey_rehearsal`,
  `turkey_wedding`. The `EventKey` union and RSVP `events` map drop `'boat'` accordingly —
  update `src/lib/rsvp.ts` (`EventKey`, the empty-events default), `rsvpSubmit.ts`,
  `supabase/schema.sql` is unaffected (event_key is free text), and the RSVP form's event
  list (driven by `EVENTS`, so automatic).
- **`src/content/hotels.ts`**: simplify the `Hotel` interface to the fields actually used.
  New shape:
  ```ts
  export interface Hotel { nameEn: string; nameFa: string; descEn: string; descFa: string; host?: boolean; url: string; }
  ```
  (Drop `distanceEn/Fa` and `tier`.) Three entries:
  - **Liberty Lykia Resort** — host; existing copy.
  - **Morina Deluxe Hotel** — neutral one-line desc (EN+FA), `url` to a search/booking link;
    placeholder, verify before launch.
  - **Hotel Karbel Sun** — same treatment.
  `HotelCard.tsx` updated to the simplified shape (no tier/distance).
- **`src/content/faq.ts`**: **removed**. Its facts now live as inline copy:
  - RSVP deadline → Story section line + (already) the RSVP section.
  - Airport / transfers / day pass / dress code → the Türkiye ceremony `TravelInfo`.
- **Locales** (`en/common.json`, `fa/common.json`): remove the now-unused `faq.*` keys; add
  any new inline-copy keys (e.g. `travel.dayPass`, `story.deadline`, section anchors/titles).
  Maintain en/fa key parity. Preserve existing Persian text.

## 6. i18n / RTL / dates

Unchanged mechanics. New inline strings get EN + FA. The Jalali date helper still renders
each event's date (Persian numerals in FA). RTL audited for the new sections (logical
utilities only). Georgia event `time` remains a single content string (English) — flagged
in LAUNCH notes as before.

## 7. Testing

Targeted (matches existing approach):
- Update/replace page tests with section/HomePage render tests: Hero names + RSVP anchor;
  the three events render with correct date labels and "coming soon" for Georgia; the three
  hotels render (Liberty Lykia, Morina Deluxe, Karbel Sun); RSVP validation still surfaces
  errors; the **boat** option is gone from the event checkboxes.
- Keep the date-helper, validation, and submit-mapping unit tests (mapping test loses the
  `boat` key — update the fixture).
- Full suite green; lint clean; build succeeds.

## 8. Out of scope / unchanged

Visual design, colors, fonts, hero, passcode gate, Supabase stub + schema + edge function,
Vercel/DNS runbooks, Farsi-review items. No new backend work.

## 9. Open items (do not block)

- Real details for Morina Deluxe & Hotel Karbel Sun (couple to verify).
- Georgia exact date, Mac's menu, contact method — same as prior LAUNCH.md.
- Confirm hotel `url`s (search links vs. official sites).
