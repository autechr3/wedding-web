# Event Details + Hero Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real event details (Balbura rehearsal, Georgia time/dress, wedding-day timeline), redesign the hero to be photo-forward and minimal ("Negar & Matt" over photo 77), replace the cliché story line, restructure the Georgia RSVP into a 3-course (first/entrée/dessert) selection, set per-event RSVP deadlines (Georgia Sep 9 / Türkiye Aug 1), add kids-welcome + no-gifts + day-pass messaging, and add accent photos.

**Architecture:** Extend `EventInfo` with optional per-event fields (dressEn/Fa, rsvpByEn/Fa, kids, timeline, scheduleEn/Fa). `EventSection` renders them. The Georgia RSVP guest model changes from one `georgiaMain` to three course fields across `rsvp.ts` / `georgiaMenu.ts` / `rsvpSubmit.ts` / `RsvpSection.tsx` / schema (one task to avoid a broken intermediate). Hero becomes a background-image section using photo 77.

**Tech Stack:** Vite + React + TS + Tailwind v4, react-i18next, dayjs+jalaliday, Vitest. Single page (no router).

**Reference:** Spec `docs/superpowers/specs/2026-06-23-event-details-update-design.md`. Mac's Tier 2 menu (from `2026 Macs.pdf`): First course = Caesar Salad / Seasonal Salad / Seasonal Soup; Entrée = 8oz Filet / Crispy Chicken / Pan-Seared Salmon; Dessert = NY Cheesecake / Chocolate Mousse.

---

## Conventions
- Commit after each task; run `npm run lint` + `npm run test` before each commit. Keep suite green.
- Preserve existing Persian exactly; new strings get EN + FA with key parity (verify with the node key-diff each task that touches locales).
- Reuse design tokens; don't restyle beyond what each task specifies.

## Key-parity check (used in several tasks)
```bash
node -e "const en=require('./src/locales/en/common.json'),fa=require('./src/locales/fa/common.json');const ks=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v=='object'?ks(v,p+k+'.'):[p+k]);const e=new Set(ks(en)),f=new Set(ks(fa));console.log('en',e.size,'fa',f.size,'enOnly',[...e].filter(k=>!f.has(k)),'faOnly',[...f].filter(k=>!e.has(k)));"
```

---

## Task 1: Add photos 77 (hero) and 47 (accent) to the asset index

**Files:**
- Modify: `src/assets/photos/index.ts`

- [ ] **Step 1: Add imports + map entries**

The optimized webp files already exist (`LVL040526JC1-77-{800,1400,2000}.webp` and `-47-…`). Edit `src/assets/photos/index.ts` to import and expose them. Add after the existing p27 imports:
```ts
import p47_800 from './LVL040526JC1-47-800.webp';
import p47_1400 from './LVL040526JC1-47-1400.webp';
import p47_2000 from './LVL040526JC1-47-2000.webp';
import p77_800 from './LVL040526JC1-77-800.webp';
import p77_1400 from './LVL040526JC1-77-1400.webp';
import p77_2000 from './LVL040526JC1-77-2000.webp';
```
And add to the `PHOTOS` object (keep existing entries):
```ts
  courtyard: { w800: p47_800, w1400: p47_1400, w2000: p47_2000 },
  boardwalk: { w800: p77_800, w1400: p77_1400, w2000: p77_2000 },
```
So `PHOTOS` now has: beachPortrait, embrace, archway, courtyard, boardwalk.

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: success (the webp module declaration already exists from a prior task).

- [ ] **Step 3: Commit**

```bash
git add src/assets/photos/index.ts
git commit -m "feat: index engagement photos 47 (courtyard) + 77 (boardwalk)"
```

---

## Task 2: Extend EventInfo with per-event detail fields + fill in data

**Files:**
- Modify: `src/content/events.ts`

- [ ] **Step 1: Extend the `EventInfo` interface**

Replace the interface in `src/content/events.ts` with (adds optional fields; existing fields unchanged):
```ts
export interface EventInfo {
  key: 'georgia' | 'turkey_rehearsal' | 'turkey_wedding';
  titleEn: string;
  titleFa: string;
  date: string | null;     // ISO Gregorian, null when TBD
  time: string | null;
  venueEn: string;
  venueFa: string;
  locationEn: string;
  locationFa: string;
  dressEn?: string;
  dressFa?: string;
  rsvpByEn?: string;
  rsvpByFa?: string;
  kids?: boolean;          // true → "Children are welcome"
  scheduleEn?: string[];   // wedding-day timeline lines (EN)
  scheduleFa?: string[];   // wedding-day timeline lines (FA)
  noteEn?: string;         // extra note, e.g. no-gifts
  noteFa?: string;
  tbd?: boolean;
}
```

- [ ] **Step 2: Replace the EVENTS array with the real details**

```ts
export const EVENTS: EventInfo[] = [
  {
    key: 'georgia',
    titleEn: 'Georgia Celebration', titleFa: 'جشن جورجیا',
    date: null, time: '12:30 PM – 3:30 PM',
    venueEn: "Mac's Chophouse", venueFa: 'مکس چاپ‌هاوس',
    locationEn: 'Marietta, GA', locationFa: 'ماریتا، جورجیا',
    dressEn: 'Day Cocktail', dressFa: 'کوکتل روزانه',
    rsvpByEn: 'Kindly RSVP by September 9, 2026', rsvpByFa: 'لطفاً تا ۱۸ شهریور ۱۴۰۵ پاسخ دهید',
    kids: true,
    tbd: true,
  },
  {
    key: 'turkey_rehearsal',
    titleEn: 'Rehearsal Dinner', titleFa: 'شام تمرین',
    date: '2026-10-05', time: '6:00 PM',
    venueEn: 'Balbura Italian Restaurant · Liberty Lykia Resort',
    venueFa: 'رستوران ایتالیایی بالبورا · اقامتگاه لیبرتی لیکیا',
    locationEn: 'Ölüdeniz, Türkiye', locationFa: 'اولودنیز، ترکیه',
    dressEn: 'Beach Cocktail', dressFa: 'کوکتل ساحلی',
    rsvpByEn: 'Kindly RSVP by August 1, 2026', rsvpByFa: 'لطفاً تا ۱۰ مرداد ۱۴۰۵ پاسخ دهید',
    kids: true,
  },
  {
    key: 'turkey_wedding',
    titleEn: 'Wedding & Reception', titleFa: 'مراسم عروسی و پذیرایی',
    date: '2026-10-06', time: '5:30 PM',
    venueEn: 'Liberty Lykia Resort', venueFa: 'اقامتگاه لیبرتی لیکیا',
    locationEn: 'Ölüdeniz, Türkiye', locationFa: 'اولودنیز، ترکیه',
    dressEn: 'Beach Formal', dressFa: 'رسمی ساحلی',
    rsvpByEn: 'Kindly RSVP by August 1, 2026', rsvpByFa: 'لطفاً تا ۱۰ مرداد ۱۴۰۵ پاسخ دهید',
    kids: true,
    scheduleEn: [
      '5:30 PM — Ceremony begins',
      '6:00–7:00 PM — Cocktails & photos',
      '7:00 PM — Dinner',
      '8:30 PM — Speeches',
      '9:00 PM–12:00 AM — Dancing & party',
    ],
    scheduleFa: [
      '۵:۳۰ بعدازظهر — آغاز مراسم',
      '۶:۰۰–۷:۰۰ بعدازظهر — کوکتل و عکاسی',
      '۷:۰۰ بعدازظهر — شام',
      '۸:۳۰ شب — سخنرانی‌ها',
      '۹:۰۰ شب تا ۱۲:۰۰ بامداد — رقص و جشن',
    ],
    noteEn: 'No gifts, please — your presence is our gift.',
    noteFa: 'هدیه لازم نیست — حضور شما هدیهٔ ماست.',
  },
];
```

- [ ] **Step 3: Typecheck + tests**

Run: `npm run build` (success), `npm run test` (green — no consumer reads the new optional fields yet, so nothing breaks).

- [ ] **Step 4: Commit**

```bash
git add src/content/events.ts
git commit -m "feat: real event details (Balbura rehearsal, Georgia time/dress, wedding timeline, per-event RSVP-by)"
```

---

## Task 3: Render the new event fields in EventSection

**Files:**
- Modify: `src/components/sections/EventSection.tsx`
- Modify: `src/components/sections/EventSection.test.tsx`

- [ ] **Step 1: Add a failing test for the new fields**

Append to `src/components/sections/EventSection.test.tsx` inside the existing `describe`:
```tsx
  it('renders dress code, kids-welcome, rsvp-by, and a wedding timeline', () => {
    render(<LocaleProvider><EventSection event={wedding} /></LocaleProvider>);
    expect(screen.getByText(/Beach Formal/)).toBeInTheDocument();
    expect(screen.getByText(/Children are welcome/)).toBeInTheDocument();
    expect(screen.getByText(/Kindly RSVP by August 1, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Ceremony begins/)).toBeInTheDocument();
    expect(screen.getByText(/your presence is our gift/)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run it, verify FAIL**

Run: `npm run test -- EventSection`
Expected: the new test fails (text not present yet).

- [ ] **Step 3: Add the new fields to EventSection**

In `src/components/sections/EventSection.tsx`, the component currently renders dateLabel, title, venue/location, and the tbd note, then `{children}`. Add locale-aware rendering of the new fields. Replace the component's returned JSX body (keep the existing imports + the `const` derivations at top; add `dress`, `rsvpBy`, `schedule`, `note` derivations):
```tsx
  const dress = locale === 'fa' ? event.dressFa : event.dressEn;
  const rsvpBy = locale === 'fa' ? event.rsvpByFa : event.rsvpByEn;
  const schedule = locale === 'fa' ? event.scheduleFa : event.scheduleEn;
  const note = locale === 'fa' ? event.noteFa : event.noteEn;
  return (
    <section id={id} className="max-w-2xl mx-auto px-5 py-12 text-start">
      <div className="font-crest text-[9px] tracking-[0.25em] uppercase text-gold-soft">
        <span>{dateLabel}</span>{event.time ? ` · ${event.time}` : ''}
      </div>
      <h3 className="font-serif text-3xl text-cream mt-1">{title}</h3>
      <p className="text-cream/80 text-sm mt-1">{venue} · {location}</p>
      {event.tbd && <p className="text-gold-soft/80 italic text-xs mt-2">{t('events.moreDetails')}</p>}

      {schedule && (
        <ul className="mt-4 space-y-1 text-cream/85 text-sm">
          {schedule.map((line) => <li key={line}>{line}</li>)}
        </ul>
      )}

      <dl className="mt-4 space-y-1 text-sm">
        {dress && <div className="flex gap-2"><dt className="text-gold-soft">{t('events.dress')}</dt><dd className="text-cream/80">{dress}</dd></div>}
        {event.kids && <p className="text-cream/80">{t('events.kids')}</p>}
        {note && <p className="text-cream/90 italic mt-1">{note}</p>}
        {rsvpBy && <p className="text-gold-soft/90 font-crest text-[11px] tracking-[0.12em] uppercase mt-2">{rsvpBy}</p>}
      </dl>

      {children}
    </section>
  );
```
(Keep the top of the component — `const { locale } = useLocale(); const { t } = useTranslation();` and the title/venue/location/dateLabel derivations — unchanged.)

- [ ] **Step 4: Add the `events.dress` and `events.kids` locale keys**

In `src/locales/en/common.json`, inside `events`: `"dress": "Dress:"`, `"kids": "Children are welcome."`
In `src/locales/fa/common.json`, inside `events`: `"dress": "کد لباس:"`, `"kids": "حضور کودکان مورد استقبال است."`

- [ ] **Step 5: Run the test, verify PASS + parity**

Run: `npm run test -- EventSection` (the new test passes; the existing 3 still pass).
Run the key-parity check (top of plan) — expect equal counts, no diff.
Run full `npm run test` (green), `npm run lint` (clean), `npm run build` (success).

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/EventSection.tsx src/components/sections/EventSection.test.tsx src/locales/en/common.json src/locales/fa/common.json
git commit -m "feat: render dress/kids/rsvp-by/timeline/note in EventSection"
```

---

## Task 4: Redesign the Hero (photo 77 background, "Negar & Matt", new line)

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/locales/en/common.json`, `src/locales/fa/common.json`

- [ ] **Step 1: Update the hero copy keys**

In `src/locales/en/common.json` `hero`: change/confirm these values (keep other hero keys like `cta`):
- `"tagline": "We can't wait to celebrate our big days with you."`
Remove `hero.celebration` usage from the hero (the new hero won't show "The Wedding Celebration"); leave the key if other code uses it (grep `hero.celebration` — if only Hero used it, you may remove it from both locales for parity). Keep `hero.date` and `hero.cta`. Note: `hero.and` is still used (the "&").
In `src/locales/fa/common.json` `hero`: `"tagline": "بی‌صبرانه منتظریم روزهای بزرگمان را با شما جشن بگیریم."`
Ensure en/fa parity after add/remove.

- [ ] **Step 2: Rewrite `src/components/Hero.tsx` as a photo-background hero**

Names are now "Negar & Matt" (Matt, not Matthew). Use `PHOTOS.boardwalk` as a full-bleed background with a cobalt gradient scrim for legibility; keep the gold frame motif and the script names; show the tagline, date, and the RSVP anchor button. (Proper nouns stay hardcoded.)
```tsx
import { useTranslation } from 'react-i18next';
import { PHOTOS } from '../assets/photos';

export function Hero() {
  const { t } = useTranslation();
  const bg = PHOTOS.boardwalk;
  return (
    <section className="relative overflow-hidden text-cream text-center px-6 py-28 md:py-40 min-h-[88vh] flex items-center justify-center">
      <img
        src={bg.w1400}
        srcSet={`${bg.w800} 800w, ${bg.w1400} 1400w, ${bg.w2000} 2000w`}
        sizes="100vw"
        alt="Negar and Matt"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cobalt-deep/70 via-cobalt-deep/55 to-cobalt-deep/85" />
      <div className="pointer-events-none absolute inset-3 md:inset-6 border border-gold-soft/50" />
      <div className="relative mx-auto max-w-2xl">
        <div className="font-crest tracking-[0.45em] text-gold-soft text-xs md:text-sm" aria-label="N · M">
          <span aria-hidden="true">N</span><span aria-hidden="true" className="mx-1.5">·</span><span aria-hidden="true">M</span>
        </div>
        <h1 className="font-script text-cream leading-[0.85] text-7xl md:text-9xl mt-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          <span className="block">Negar</span>
          <span className="block font-script text-gold-soft text-5xl md:text-6xl my-1 md:my-2">{t('hero.and')}</span>
          <span className="block">Matt</span>
        </h1>
        <div className="mx-auto mt-9 h-px w-20 bg-gold-soft/60" />
        <p className="font-serif text-cream/95 text-base md:text-lg mt-7 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
          {t('hero.tagline')}
        </p>
        <p className="font-serif tracking-[0.22em] uppercase text-[11px] md:text-xs text-cream/90 mt-6">
          {t('hero.date')}
        </p>
        <a
          href="#rsvp"
          className="inline-block mt-9 border border-gold bg-cobalt-deep/30 text-gold-soft px-12 py-3.5 text-[10px] md:text-[11px] uppercase tracking-[0.35em] hover:bg-gold/15 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2"
        >
          {t('hero.cta')}
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify the App smoke test still finds the hero**

The App/HomePage tests assert `getAllByText('Negar')` — still present. There's no test asserting "Matthew" in the hero (the EventSection/HomePage tests use event titles, not the hero surname). Run `npm run test` — if any test asserts the hero shows "Matthew", update it to "Matt". Report if so.

- [ ] **Step 4: Lint + build + visual note**

Run: `npm run lint` (clean), `npm run build` (success). The hero image is eager-loaded (above the fold) — good for LCP.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.tsx src/locales/en/common.json src/locales/fa/common.json
git commit -m "feat: photo-forward hero (boardwalk bg, 'Negar & Matt', warm tagline)"
```

---

## Task 5: Update the Story section copy (remove cliché line)

**Files:**
- Modify: `src/locales/en/common.json`, `src/locales/fa/common.json`
- Modify: `src/components/sections/StorySection.tsx`

- [ ] **Step 1: Replace the story body, drop the global deadline line**

In `src/locales/en/common.json` `story`: set `"body"` to a warm natural line, e.g.
`"We're so happy you're here. We can't wait to celebrate our big days with you — in Georgia and in Türkiye."`
Remove the `story.deadline` key (deadlines are now per-event). In `src/locales/fa/common.json` `story`:
`"body"` → `"از این‌که اینجا هستید بسیار خوشحالیم. بی‌صبرانه منتظریم روزهای بزرگمان را با شما جشن بگیریم — در جورجیا و در ترکیه."` and remove `story.deadline`. Keep `story.kicker` and `story.title`. Maintain parity.

- [ ] **Step 2: Remove the deadline render from StorySection**

In `src/components/sections/StorySection.tsx`, delete the `<p>` line that renders `{t('story.deadline')}` (the gold uppercase deadline paragraph). Keep kicker/title/body and the photo band. Optionally switch its photo to `PHOTOS.embrace` for variety (the hero now uses boardwalk; story can stay beachPortrait or use embrace — your choice; default: keep `beachPortrait`).

- [ ] **Step 3: Verify**

Run `npm run test` — if a test referenced `story.deadline`, update/remove it (the HomePage test doesn't assert the deadline). Run the parity check, `npm run lint`, `npm run build`.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/StorySection.tsx src/locales/en/common.json src/locales/fa/common.json
git commit -m "copy: warm natural story line; remove global deadline (now per-event)"
```

---

## Task 6: 3-course Georgia RSVP (data model: validation, menu, mapping, form, schema)

**Files:**
- Modify: `src/lib/rsvp.ts`, `src/lib/rsvp.test.ts`
- Modify: `src/content/georgiaMenu.ts`
- Modify: `src/lib/rsvpSubmit.ts`, `src/lib/rsvpSubmit.test.ts`
- Modify: `src/components/sections/RsvpSection.tsx`
- Modify: `src/locales/en/common.json`, `src/locales/fa/common.json`
- Modify: `supabase/schema.sql`

> This task changes the guest course model end-to-end. Do it as one unit so there is no broken intermediate. Write the failing tests first.

- [ ] **Step 1: Update the Mac's Tier 2 menu options**

Replace `src/content/georgiaMenu.ts`:
```ts
// Mac's Chophouse Tier Two — guests choose one per course for the Georgia dinner.
export const GEORGIA_FIRST = ['Caesar Salad', 'Seasonal Salad', 'Seasonal Soup'];
export const GEORGIA_ENTREE = ['8oz Filet', 'Crispy Chicken', 'Pan-Seared Salmon'];
export const GEORGIA_DESSERT = ['NY Style Cheesecake', 'Chocolate Mousse'];
```

- [ ] **Step 2: Update the validation types + tests (write tests first)**

In `src/lib/rsvp.test.ts`, the fixtures use `georgiaMain`. Update the base fixture guest to the new shape and the validation expectations:
```ts
// in the base draft:
  guests: [{ name: 'Sam Guest', georgiaFirst: 'Caesar Salad', georgiaEntree: '8oz Filet', georgiaDessert: 'Chocolate Mousse' }],
```
And the "requires a Georgia main course" test becomes "requires all three Georgia courses":
```ts
  it('requires all three Georgia courses when attending Georgia', () => {
    const r = validateRsvp({ ...base, guests: [{ name: 'Sam Guest', georgiaFirst: '', georgiaEntree: '8oz Filet', georgiaDessert: 'Chocolate Mousse' }] });
    expect(r.errors.guests).toBeDefined();
  });
```

- [ ] **Step 3: Run tests, verify FAIL**

Run: `npm run test -- "rsvp"` (matches rsvp.test + rsvpSubmit.test). Expect failures (type mismatch / missing fields). Confirm.

- [ ] **Step 4: Update `src/lib/rsvp.ts`**

Change `GuestDraft` and the validation:
```ts
export interface GuestDraft { name: string; georgiaFirst: string; georgiaEntree: string; georgiaDessert: string; }
```
And the Georgia validation line:
```ts
  if (d.events.georgia && d.guests.some((g) => !g.georgiaFirst.trim() || !g.georgiaEntree.trim() || !g.georgiaDessert.trim())) {
    errors.guests = 'Please choose a first course, entrée, and dessert for each guest attending the Georgia dinner';
  }
```

- [ ] **Step 5: Update `src/lib/rsvpSubmit.ts` + its test**

`GuestRow` and the mapping:
```ts
export interface GuestRow { guest_name: string; georgia_first: string; georgia_entree: string; georgia_dessert: string; }
```
```ts
    guests: d.guests.map((g) => ({ guest_name: g.name.trim(), georgia_first: g.georgiaFirst, georgia_entree: g.georgiaEntree, georgia_dessert: g.georgiaDessert })),
```
In `src/lib/rsvpSubmit.test.ts`, update the fixture guests + the assertion:
```ts
  guests: [
    { name: 'Sam Guest', georgiaFirst: 'Caesar Salad', georgiaEntree: '8oz Filet', georgiaDessert: 'Chocolate Mousse' },
    { name: 'Pat Plus', georgiaFirst: 'Seasonal Salad', georgiaEntree: 'Pan-Seared Salmon', georgiaDessert: 'NY Style Cheesecake' },
  ],
```
```ts
    expect(guests[1]).toMatchObject({ guest_name: 'Pat Plus', georgia_first: 'Seasonal Salad', georgia_entree: 'Pan-Seared Salmon', georgia_dessert: 'NY Style Cheesecake' });
```

- [ ] **Step 6: Update the RSVP form `RsvpSection.tsx`**

- Change the import: `import { GEORGIA_FIRST, GEORGIA_ENTREE, GEORGIA_DESSERT } from '../../content/georgiaMenu';`
- Update the EMPTY default guest and the party-size resize default from `{ name: '', georgiaMain: '' }` to `{ name: '', georgiaFirst: '', georgiaEntree: '', georgiaDessert: '' }` (both the `guests:` initial array on ~line 11 and the `Array.from(... ?? {...})` on ~line 34).
- Replace the single `<select>` (lines ~131-141) with three selects (first/entrée/dessert), each like the existing one. Replace the guest row block with:
```tsx
            <div key={i} className="flex flex-col gap-2 border-b border-gold-soft/15 pb-3">
              <input
                aria-label={t('rsvp.guestName', { n: i + 1 })}
                placeholder={t('rsvp.guestName', { n: i + 1 })}
                className={`${INPUT} mt-0`}
                value={g.name}
                onChange={(e) => setGuest(i, { name: e.target.value })}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <select aria-label={t('rsvp.guestFirst', { n: i + 1 })} className="flex-1 bg-cobalt-deep text-cream border border-gold-soft/40 px-3 py-2 focus:outline-none focus:border-gold-soft transition-colors" value={g.georgiaFirst} onChange={(e) => setGuest(i, { georgiaFirst: e.target.value })}>
                  <option value="">{t('rsvp.firstCourse')}</option>
                  {GEORGIA_FIRST.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select aria-label={t('rsvp.guestEntree', { n: i + 1 })} className="flex-1 bg-cobalt-deep text-cream border border-gold-soft/40 px-3 py-2 focus:outline-none focus:border-gold-soft transition-colors" value={g.georgiaEntree} onChange={(e) => setGuest(i, { georgiaEntree: e.target.value })}>
                  <option value="">{t('rsvp.entree')}</option>
                  {GEORGIA_ENTREE.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select aria-label={t('rsvp.guestDessert', { n: i + 1 })} className="flex-1 bg-cobalt-deep text-cream border border-gold-soft/40 px-3 py-2 focus:outline-none focus:border-gold-soft transition-colors" value={g.georgiaDessert} onChange={(e) => setGuest(i, { georgiaDessert: e.target.value })}>
                  <option value="">{t('rsvp.dessert')}</option>
                  {GEORGIA_DESSERT.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
```
- Remove the now-unused `t('rsvp.guestMain')` and `t('rsvp.selectPlaceholder')` references if no longer used (keep the keys if still referenced elsewhere; otherwise drop in Step 7).

- [ ] **Step 7: Add/adjust locale keys (both locales, parity)**

In `rsvp` (en): `"firstCourse": "First course…"`, `"entree": "Entrée…"`, `"dessert": "Dessert…"`, `"guestFirst": "Guest {{n}} first course"`, `"guestEntree": "Guest {{n}} entrée"`, `"guestDessert": "Guest {{n}} dessert"`. Update `rsvp.georgiaLegend` to `"Georgia dinner — choose three courses per guest"`. Remove `rsvp.guestMain` and `rsvp.selectPlaceholder` if unused now.
(fa): `"firstCourse": "پیش‌غذا…"`, `"entree": "غذای اصلی…"`, `"dessert": "دسر…"`, `"guestFirst": "پیش‌غذای مهمان {{n}}"`, `"guestEntree": "غذای اصلی مهمان {{n}}"`, `"guestDessert": "دسر مهمان {{n}}"`, `georgiaLegend` → `"شام جورجیا — برای هر مهمان سه وعده انتخاب کنید"`. Remove the same unused keys. Keep parity.

- [ ] **Step 8: Run all the RSVP tests, verify PASS**

Run: `npm run test -- "rsvp"` then full `npm run test`. Expect all green. (The empty-submit RSVP form test still asserts the lib's English error strings — the new "first course, entrée, and dessert" message is only shown when attending Georgia with a missing course; the empty-submit test triggers `events`/`fullName` errors, unaffected. If the Georgia-guests render test from the restructure asserted the old single message, update it to the new message.)

- [ ] **Step 9: Update the Supabase schema doc**

In `supabase/schema.sql`, change the `rsvp_guests` table columns from `georgia_main text` to:
```sql
  georgia_first text,
  georgia_entree text,
  georgia_dessert text,
```
(The DB isn't live yet; this keeps the committed schema in sync with the insert mapping.)

- [ ] **Step 10: Lint + build + parity**

Run: `npm run lint` (clean), `npm run build` (success), the key-parity check (equal, no diff), full `npm run test` (green). Also `grep -rn "georgiaMain\|georgia_main\|GEORGIA_MAINS\|selectPlaceholder\|guestMain" src` — expect no stragglers (or only intentional). Fix any.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: 3-course Georgia RSVP (first/entrée/dessert, Mac's Tier 2) across model, form, mapping, schema"
```

---

## Task 7: Day-pass wording + accent photos

**Files:**
- Modify: `src/locales/en/common.json`, `src/locales/fa/common.json`
- Modify: `src/components/sections/TravelInfo.tsx`
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Reword the day-pass line to cover both events**

In `src/locales/en/common.json` `travel.dayPass`: `"Staying off-resort? A complimentary day pass is provided so you can join us for both the rehearsal dinner and the wedding day."`
In `fa` `travel.dayPass`: `"خارج از اقامتگاه می‌مانید؟ بلیت روزانهٔ رایگان فراهم می‌شود تا بتوانید هم در شام تمرین و هم در روز عروسی به ما بپیوندید."`

- [ ] **Step 2: Add an accent photo band between events**

In `src/pages/HomePage.tsx`, import `PhotoBand` and `PHOTOS`, and place one accent band between the rehearsal and wedding sections (courtyard photo). Insert:
```tsx
import { PhotoBand } from '../components/PhotoBand';
import { PHOTOS } from '../assets/photos';
```
and between `<EventSection event={rehearsal} id="rehearsal" />` and the wedding `<EventSection …>`:
```tsx
      <PhotoBand photo={PHOTOS.courtyard} alt="Negar and Matt" heightClass="h-64 md:h-80" />
```
(One tasteful band; don't overdo it. The Story section already has a band; the hero uses boardwalk.)

- [ ] **Step 3: Verify**

Run: `npm run test` (green — HomePage test still finds events/hotels/rsvp; the added band doesn't break it), `npm run lint` (clean), `npm run build` (success), parity check (equal).

- [ ] **Step 4: Commit**

```bash
git add src/locales/en/common.json src/locales/fa/common.json src/components/sections/TravelInfo.tsx src/pages/HomePage.tsx
git commit -m "copy+photos: day-pass covers both events; accent photo band between events"
```

---

## Task 8: Verify end-to-end + update launch docs + tag

**Files:**
- Modify: `LAUNCH.md`

- [ ] **Step 1: Manual browser pass**

`npm run dev`, unlock, confirm: photo hero ("Negar & Matt" + tagline + date over boardwalk photo); Story warm line (no deadline); Georgia (12:30–3:30, Day Cocktail, kids welcome, RSVP Sep 9); Rehearsal (Balbura, 6 PM, Beach Cocktail, day pass, RSVP Aug 1); Wedding (timeline list, Beach Formal, no-gifts note, RSVP Aug 1); the accent band; RSVP form shows 3 course dropdowns per guest with the Tier-2 options; submit works (stub). Toggle Farsi — all new strings render RTL with Jalali dates.

- [ ] **Step 2: Update `LAUNCH.md`**

Update the structure/known-facts notes: hero is photo-forward "Negar & Matt"; per-event deadlines (GA Sep 9 / TR Aug 1); Balbura rehearsal; wedding timeline; no-gifts; kids welcome; Georgia 3-course RSVP. Keep the Farsi-native-review note and add the new strings (dress codes, timeline, no-gifts, tagline) to it. Georgia exact date still TBD.

- [ ] **Step 3: Final verification**

Run: `npm run test` (green, report count), `npm run lint` (clean), `npm run build` (success, no chunk warning).

- [ ] **Step 4: Commit + tag**

```bash
git add LAUNCH.md
git commit -m "docs: launch notes for event-details + hero update"
git tag v1.2.0
```

---

## Self-Review notes (addressed)

- **Spec coverage:** hero redesign + photo 77 (Task 4), remove cliché line (Task 5), "Negar & Matt" (Task 4), Georgia time/dress/kids/deadline (Tasks 2-3), Balbura rehearsal + dress + day pass + deadline (Tasks 2-3,7), wedding timeline + no-gifts + deadline (Tasks 2-3), 3-course Georgia RSVP + schema (Task 6), per-event deadlines (Task 2), accent photos (Tasks 1,7), day-pass both events (Task 7). All mapped.
- **Type consistency:** `GuestDraft` (name, georgiaFirst, georgiaEntree, georgiaDessert) defined in Task 6 Step 4 and used consistently in rsvp.test (Step 2), rsvpSubmit + test (Step 5), RsvpSection (Step 6); `GEORGIA_FIRST/ENTREE/DESSERT` defined Step 1 and consumed Step 6; `GuestRow` columns (georgia_first/entree/dessert) match schema (Step 9). `EventInfo` optional fields defined Task 2 and consumed Task 3. `PHOTOS.boardwalk/courtyard` defined Task 1, used Tasks 4/7.
- **Placeholder scan:** no TBD/placeholder code steps; Farsi for new strings is provided inline (native review is a documented post-launch nicety, not a code gap). Georgia date intentionally remains null (only time known).
