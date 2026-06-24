# Event Details + Hero Update — Design Spec

**Date:** 2026-06-23
**Builds on:** the single-page structure (`2026-06-23-single-page-restructure-design.md`). Visual
identity, i18n/RTL/Jalali, passcode gate, Supabase stub all unchanged.

## Goal

Fill in real event details (rehearsal venue/time/dress, Georgia time/dress/menu, wedding-day
timeline), redesign the hero to be photo-forward and minimal, replace the cliché story line,
restructure the Georgia RSVP into a 3-course selection, set per-event RSVP deadlines, add
kids-welcome + no-gifts + day-pass messaging, and sprinkle a few engagement photos.

## Confirmed decisions

### Hero (first page)
- Content ONLY: names "**Negar & Matt**", one warm line "**We can't wait to celebrate our big
  days with you**", the date (October 6, 2026), and a photo. Nothing else.
- Use **photo `LVL040526JC1-77`** (sunlit palm boardwalk, couple full-length) as the hero
  **background image**, framed so both are visible, with a cobalt/gradient scrim for legibility
  and the gold frame motif retained. Names in Pinyon script over it.
- Remove the "From a Georgia courthouse to the shores of the Mediterranean…" line everywhere.

### Story section
- Replace the cliché body with a short, warm, natural line (reuse the hero sentiment or a
  brief variant). Remove the single global RSVP-deadline line (deadlines are now per-event).
- Keep a photo band; may use a different/extra engagement photo.

### Events
Each event shows: date, time, venue/location, dress code, "kids welcome", and its own RSVP
deadline. New per-event fields are added to `EventInfo`.

- **Georgia Celebration** — Mac's Chophouse, Marietta GA. Time **12:30–3:30 PM**. Dress: **Day
  Cocktail**. Kids welcome. **RSVP by September 9, 2026**.
- **Rehearsal Dinner** — **Balbura Italian Restaurant** at Liberty Lykia Resort, Ölüdeniz.
  **October 5, 2026, 6:00 PM**. Dress: **Beach Cocktail** (between formal and casual). Kids
  welcome. **Day pass provided** for off-resort guests (rehearsal + wedding day). **RSVP by
  August 1, 2026**.
- **Wedding & Reception** — Liberty Lykia Resort, Ölüdeniz. **October 6, 2026**. Timeline:
  - 5:30 PM — Ceremony begins
  - 6:00–7:00 PM — Cocktails & photos
  - 7:00 PM — Dinner
  - 8:30 PM — Speeches
  - 9:00 PM–12:00 AM — Dancing & party
  Dress: Beach Formal (existing). Kids welcome. Day pass provided. **No gifts — "your presence
  is our gift."** **RSVP by August 1, 2026**.

### Travel / day pass
The day-pass line already exists in the wedding section's TravelInfo. Reword to make explicit
it covers **both the rehearsal dinner and the wedding day** for off-resort guests.

### Georgia RSVP — 3-course selection (data-model change)
Per attending guest, three dropdowns from Mac's **Tier Two**:
- **First course:** Caesar Salad · Seasonal Salad · Seasonal Soup
- **Entrée:** 8oz Filet · Crispy Chicken · Pan-Seared Salmon
- **Dessert:** NY Cheesecake · Chocolate Mousse
No write-in (dietary needs captured by the existing "Dietary restrictions" field).

This changes `GuestDraft` from `{ name, georgiaMain }` to
`{ name, georgiaFirst, georgiaEntree, georgiaDessert }`, and the Supabase `rsvp_guests` row +
mapping accordingly. `georgiaMenu.ts` exports three option arrays. Validation: when attending
Georgia, all three course fields required per guest. Locale keys + tests updated.

### Photos
Sprinkle a few engagement photos as accent bands (e.g. `-47` courtyard kiss, `-110` embrace,
`-102` beach) in Story / between events / before RSVP. Add the needed entries to
`src/assets/photos/index.ts`.

## Out of scope / unchanged
Supabase schema column type (georgia_main → renamed/expanded; the SQL is a TODO doc since DB
isn't live — update `supabase/schema.sql` to the new columns). Visual tokens, gate, i18n
mechanics. No new routes (still single page).

## Testing
- RSVP validation: 3 Georgia courses required when attending Georgia.
- buildRsvpRows maps the 3 course fields to the guest row.
- EventSection/HomePage render the new dress/kids/deadline fields and the wedding timeline.
- Full suite green, lint clean, build success.

## Open items (user content)
- Confirm Balbura spelling/details; Seasonal Salad/Soup specifics at Mac's.
- Farsi for all new strings (dress codes, timeline, no-gifts, kids-welcome) — native review.
- Georgia exact date still TBD (only the time is known).
