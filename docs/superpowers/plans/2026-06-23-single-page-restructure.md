# Single-Page Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the multi-route wedding site into a single long-scroll page: remove React Router, fold FAQ facts into sections, colocate travel info with the Türkiye events, drop the boat party (3 events), and trim to 3 hotels with a simplified shape — keeping the visual identity, i18n/RTL/Jalali, passcode gate, and RSVP behavior unchanged.

**Architecture:** One page (`HomePage`) composes the Hero plus small section components (`StorySection`, `EventSection`, `TravelInfo`, `RsvpSection`). `App` renders `LocaleProvider > PasscodeGate > Layout > HomePage` directly (no router). Content data files shrink (3 events, 3 hotels, no FAQ); the `EventKey` union drops `'boat'`.

**Tech Stack:** Vite + React + TS + Tailwind v4, react-i18next, dayjs+jalaliday, Vitest + @testing-library/react. (Removing `react-router-dom`.)

**Reference:** Spec at `docs/superpowers/specs/2026-06-23-single-page-restructure-design.md`. The prior multi-page design is `2026-06-22-wedding-site-design.md` (visual identity unchanged).

---

## Conventions

- Commit after each task with the message shown. Run `npm run lint` and `npm run test` before each commit.
- Keep the full suite green at every task. Preserve all existing Persian text exactly; new strings get EN+FA with key parity.
- Reuse existing components/tokens; do not restyle the design.

## File map (what changes)

- **Data:** `src/content/events.ts` (drop boat), `src/content/hotels.ts` (simplify shape, 3 hotels), delete `src/content/faq.ts`.
- **Types:** `src/lib/rsvp.ts` (`EventKey` drops `'boat'`), `src/pages/Rsvp.tsx` EMPTY default, `src/lib/rsvpSubmit.test.ts` fixture.
- **Locales:** `src/locales/en/common.json` + `src/locales/fa/common.json` (remove `faq.*`, add inline-copy keys).
- **App/Nav:** `src/App.tsx` (no router), `src/components/Nav.tsx` (monogram + flags only).
- **New:** `src/components/sections/StorySection.tsx`, `EventSection.tsx`, `TravelInfo.tsx`, `RsvpSection.tsx`, `src/pages/HomePage.tsx`.
- **Move:** RSVP form body from `src/pages/Rsvp.tsx` into `RsvpSection.tsx`.
- **Update HotelCard:** `src/components/HotelCard.tsx` (simplified shape).
- **Delete:** `src/pages/{Events,Travel,Faq,Home,Rsvp}.tsx` + their tests after their logic moves.
- **Config:** remove `react-router-dom` from `package.json`; delete `vercel.json`.

---

## Task 1: Drop the boat event + EventKey

**Files:**
- Modify: `src/content/events.ts`, `src/lib/rsvp.ts`, `src/pages/Rsvp.tsx`, `src/lib/rsvpSubmit.test.ts`

- [ ] **Step 1: Update the EventKey union and the validation**

In `src/lib/rsvp.ts` line 1, change:
```ts
export type EventKey = 'georgia' | 'turkey_rehearsal' | 'turkey_wedding';
```
(Removes `| 'boat'`.) Leave the rest of the file unchanged.

- [ ] **Step 2: Remove the boat event from content**

In `src/content/events.ts`, delete the entire `boat` object (the 4th entry, keys `key: 'boat'` … through its closing `},`). The array now has exactly 3 entries: `georgia`, `turkey_rehearsal`, `turkey_wedding`. The `EventInfo.key` type union also no longer needs `'boat'` — update line 2:
```ts
  key: 'georgia' | 'turkey_rehearsal' | 'turkey_wedding';
```

- [ ] **Step 3: Update the RSVP EMPTY default**

In `src/pages/Rsvp.tsx`, line 12, change the events default to drop boat:
```ts
  events: { georgia: false, turkey_rehearsal: false, turkey_wedding: false },
```

- [ ] **Step 4: Update the submit-mapping test fixture**

In `src/lib/rsvpSubmit.test.ts`, find the draft fixture's `events` object and remove `boat: false`. Then the test `expect(events).toHaveLength(4)` must become `toHaveLength(3)` (there are now 3 event keys). Update that assertion. Keep the `turkey_wedding` attending assertion.

- [ ] **Step 5: Run tests + typecheck**

Run: `npm run test`
Expected: all green (the rsvpSubmit test now asserts 3 events). If TS complains anywhere about a missing `boat` key in a `Record<EventKey, boolean>`, fix that spot to the 3-key shape.
Run: `npm run build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add src/content/events.ts src/lib/rsvp.ts src/pages/Rsvp.tsx src/lib/rsvpSubmit.test.ts
git commit -m "refactor: drop boat party event (3 events; EventKey trimmed)"
```

---

## Task 2: Simplify the Hotel shape + trim to 3 hotels

**Files:**
- Modify: `src/content/hotels.ts`, `src/components/HotelCard.tsx`

- [ ] **Step 1: Rewrite `src/content/hotels.ts`**

Replace the whole file with the simplified shape (drop `distanceEn/Fa` and `tier`; add optional `host`):
```ts
export interface Hotel {
  nameEn: string; nameFa: string;
  descEn: string; descFa: string;
  host?: boolean;
  url: string;
}

// NOTE: the two non-host hotels are placeholders — verify details/links before launch.
export const HOTELS: Hotel[] = [
  {
    nameEn: 'Liberty Lykia Resort', nameFa: 'اقامتگاه لیبرتی لیکیا',
    descEn: 'Our host resort — where the ceremony and reception take place.',
    descFa: 'اقامتگاه میزبان ما — محل برگزاری مراسم و پذیرایی.',
    host: true,
    url: 'https://www.libertyhotels.com/',
  },
  {
    nameEn: 'Morina Deluxe Hotel', nameFa: 'هتل مورینا دلوکس',
    descEn: 'A nearby option in Ölüdeniz for guests staying off-resort.',
    descFa: 'گزینه‌ای نزدیک در اولودنیز برای مهمانانی که خارج از اقامتگاه می‌مانند.',
    url: 'https://www.google.com/search?q=Morina+Deluxe+Hotel+Oludeniz',
  },
  {
    nameEn: 'Hotel Karbel Sun', nameFa: 'هتل کاربل سان',
    descEn: 'A nearby option in Ölüdeniz for guests staying off-resort.',
    descFa: 'گزینه‌ای نزدیک در اولودنیز برای مهمانانی که خارج از اقامتگاه می‌مانند.',
    url: 'https://www.google.com/search?q=Hotel+Karbel+Sun+Oludeniz',
  },
];
```

- [ ] **Step 2: Update `src/components/HotelCard.tsx` to the simplified shape**

Replace the file with (no tier/distance; show a small "Host" badge when `hotel.host`):
```tsx
import { useTranslation } from 'react-i18next';
import { useLocale } from '../locale/useLocale';
import type { Hotel } from '../content/hotels';

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const name = locale === 'fa' ? hotel.nameFa : hotel.nameEn;
  const desc = locale === 'fa' ? hotel.descFa : hotel.descEn;
  return (
    <a href={hotel.url} target="_blank" rel="noreferrer" className="block border border-gold-soft/35 p-5 bg-white/5 hover:border-gold-soft transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2">
      <div className="flex justify-between items-baseline gap-3">
        <h3 className="font-serif text-xl text-cream">{name}</h3>
        {hotel.host && <span className="text-gold-soft text-[10px] uppercase tracking-[0.2em] shrink-0">{t('travel.host')}</span>}
      </div>
      <p className="text-cream/80 text-sm mt-1">{desc}</p>
    </a>
  );
}
```

- [ ] **Step 3: Add the `travel.host` key to both locales**

In `src/locales/en/common.json`, inside the `travel` object add: `"host": "Host"`.
In `src/locales/fa/common.json`, inside the `travel` object add: `"host": "میزبان"`.
(Keep JSON valid; maintain key parity.)

- [ ] **Step 4: Typecheck + tests**

Run: `npm run build`
Expected: success (no references to the removed `tier`/`distance` remain — if the old `Travel.tsx` page still imports HotelCard and builds fine, that's OK; it's deleted in Task 6).
Run: `npm run test`
Expected: green. Note: `src/pages/Travel.test.tsx` asserts the OLD hotel names ("Liberty Lykia – Adults Only", "Sundia"). It will now FAIL. That's expected — that page/test is removed in Task 6. To keep the suite green in the meantime, update `src/pages/Travel.test.tsx` now: change the two assertions to `screen.getByText(/Liberty Lykia Resort/)` and `screen.getByText(/Morina Deluxe Hotel/)`.

- [ ] **Step 5: Commit**

```bash
git add src/content/hotels.ts src/components/HotelCard.tsx src/locales/en/common.json src/locales/fa/common.json src/pages/Travel.test.tsx
git commit -m "refactor: simplify Hotel shape; 3 hotels (Liberty Lykia + Morina Deluxe + Karbel Sun)"
```

---

## Task 3: Add section/inline-copy locale keys; remove faq keys

**Files:**
- Modify: `src/locales/en/common.json`, `src/locales/fa/common.json`

- [ ] **Step 1: Remove the `faq` object from both locale files**

Delete the entire `"faq": { ... }` object from `src/locales/en/common.json` and `src/locales/fa/common.json`. (The FAQ section is gone.)

- [ ] **Step 2: Add a `story` object to both**

en `story`:
```json
"story": {
  "kicker": "Our Story",
  "title": "Negar & Matthew",
  "body": "From a Georgia courthouse to the shores of the Mediterranean — we can't wait to celebrate with you.",
  "deadline": "Kindly RSVP by September 6, 2026."
}
```
fa `story`:
```json
"story": {
  "kicker": "داستان ما",
  "title": "نگار و متیو",
  "body": "از دادگاه جورجیا تا سواحل مدیترانه — بی‌صبرانه منتظر جشن گرفتن با شما هستیم.",
  "deadline": "لطفاً تا ۱۵ شهریور ۱۴۰۵ پاسخ خود را اعلام کنید."
}
```

- [ ] **Step 3: Extend the `travel` object in both with the inline facts**

Add these keys inside the existing `travel` object (keep existing keys like title/intro/hotelsTitle/dress/etc.):
en:
```json
"airport": "Fly into Dalaman Airport (DLM), the closest airport. Transfers to the resort can be arranged.",
"dayPass": "Staying off-resort? A day pass lets you access the resort for the celebration.",
"whereToStay": "Where to Stay"
```
fa:
```json
"airport": "به فرودگاه دالامان (DLM)، نزدیک‌ترین فرودگاه، پرواز کنید. ترانسفر به اقامتگاه قابل هماهنگی است.",
"dayPass": "خارج از اقامتگاه می‌مانید؟ با بلیت روزانه می‌توانید برای جشن به اقامتگاه دسترسی داشته باشید.",
"whereToStay": "محل اقامت"
```
(`travel.dress` already exists for the dress code; reuse it. `travel.host` was added in Task 2.)

- [ ] **Step 4: Verify JSON validity + key parity**

Run:
```bash
node -e "const en=require('./src/locales/en/common.json'),fa=require('./src/locales/fa/common.json');const ks=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v=='object'?ks(v,p+k+'.'):[p+k]);const e=new Set(ks(en)),f=new Set(ks(fa));console.log('en',e.size,'fa',f.size,'enOnly',[...e].filter(k=>!f.has(k)),'faOnly',[...f].filter(k=>!e.has(k)));"
```
Expected: en and fa counts equal, enOnly `[]`, faOnly `[]`.
Run: `npm run test` — still green (no component reads the removed faq keys yet except the Faq page/test, which are removed in Task 6; if `Faq.test.tsx` fails now because faq strings changed, that's fine — it's deleted in Task 6. To keep green now, you may temporarily skip it, but simpler: proceed to Task 6 promptly. If you prefer green at every commit, delete `src/pages/Faq.tsx` and `src/pages/Faq.test.tsx` as part of THIS commit.)

- [ ] **Step 5: Commit**

```bash
git add src/locales/en/common.json src/locales/fa/common.json
git commit -m "i18n: remove faq keys; add story + inline travel copy keys"
```

---

## Task 4: TravelInfo + EventSection + StorySection components

**Files:**
- Create: `src/components/sections/TravelInfo.tsx`, `src/components/sections/EventSection.tsx`, `src/components/sections/StorySection.tsx`
- Test: `src/components/sections/EventSection.test.tsx`

- [ ] **Step 1: Create `src/components/sections/TravelInfo.tsx`**

The inline travel facts + hotel list (rendered inside the wedding event).
```tsx
import { useTranslation } from 'react-i18next';
import { HOTELS } from '../../content/hotels';
import { HotelCard } from '../HotelCard';

export function TravelInfo() {
  const { t } = useTranslation();
  return (
    <div className="mt-6 space-y-4 text-start">
      <ul className="space-y-2 text-cream/80 text-sm">
        <li>✈️ {t('travel.airport')}</li>
        <li>👗 {t('travel.dress')}</li>
        <li>🎟️ {t('travel.dayPass')}</li>
      </ul>
      <div>
        <h4 className="font-serif text-lg text-cream mb-3">{t('travel.whereToStay')}</h4>
        <div className="space-y-3">
          {HOTELS.map((h) => <HotelCard key={h.nameEn} hotel={h} />)}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the failing test for EventSection**

Create `src/components/sections/EventSection.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../../i18n';
import { LocaleProvider } from '../../locale/LocaleProvider';
import { EventSection } from './EventSection';
import { EVENTS } from '../../content/events';

const wedding = EVENTS.find((e) => e.key === 'turkey_wedding')!;
const georgia = EVENTS.find((e) => e.key === 'georgia')!;

describe('EventSection', () => {
  beforeEach(() => { localStorage.clear(); });

  it('renders an event title and formatted date', () => {
    render(<LocaleProvider><EventSection event={wedding} /></LocaleProvider>);
    expect(screen.getByText('Wedding & Reception')).toBeInTheDocument();
    expect(screen.getByText(/October 6, 2026/)).toBeInTheDocument();
  });

  it('shows a coming-soon date for a TBD event', () => {
    render(<LocaleProvider><EventSection event={georgia} /></LocaleProvider>);
    expect(screen.getByText('Date coming soon')).toBeInTheDocument();
  });

  it('renders extra content passed as children', () => {
    render(<LocaleProvider><EventSection event={wedding}><div data-testid="extra" /></EventSection></LocaleProvider>);
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it, verify it FAILS**

Run: `npm run test -- EventSection`
Expected: FAIL (module not found).

- [ ] **Step 4: Create `src/components/sections/EventSection.tsx`**

Reuses the date helper + locale, renders one event, with an optional `children` slot for the colocated travel block. (This replaces the old `EventCard` rendering; styled as a full-width section.)
```tsx
import type { ReactNode } from 'react';
import { useLocale } from '../../locale/useLocale';
import { useTranslation } from 'react-i18next';
import { formatEventDate } from '../../lib/dateFormat';
import type { EventInfo } from '../../content/events';

export function EventSection({ event, id, children }: { event: EventInfo; id?: string; children?: ReactNode }) {
  const { locale } = useLocale();
  const { t } = useTranslation();
  const title = locale === 'fa' ? event.titleFa : event.titleEn;
  const venue = locale === 'fa' ? event.venueFa : event.venueEn;
  const location = locale === 'fa' ? event.locationFa : event.locationEn;
  const dateLabel = event.date ? formatEventDate(event.date, locale) : t('events.dateComingSoon');
  return (
    <section id={id} className="max-w-2xl mx-auto px-5 py-12 text-start">
      <div className="font-crest text-[9px] tracking-[0.25em] uppercase text-gold-soft">
        {dateLabel}{event.time ? ` · ${event.time}` : ''}
      </div>
      <h3 className="font-serif text-3xl text-cream mt-1">{title}</h3>
      <p className="text-cream/80 text-sm mt-1">{venue} · {location}</p>
      {event.tbd && <p className="text-gold-soft/80 italic text-xs mt-2">{t('events.moreDetails')}</p>}
      {children}
    </section>
  );
}
```
(`events.dateComingSoon` and `events.moreDetails` keys already exist from the prior i18n consolidation.)

- [ ] **Step 5: Run the test, verify it PASSES**

Run: `npm run test -- EventSection`
Expected: 3 pass.

- [ ] **Step 6: Create `src/components/sections/StorySection.tsx`**

```tsx
import { useTranslation } from 'react-i18next';
import { PhotoBand } from '../PhotoBand';
import { PHOTOS } from '../../assets/photos';

export function StorySection() {
  const { t } = useTranslation();
  return (
    <section id="story">
      <PhotoBand photo={PHOTOS.beachPortrait} alt={t('photos.beachPortrait')} loading="eager" />
      <div className="max-w-2xl mx-auto px-5 py-12 text-center">
        <div className="font-crest text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-2">{t('story.kicker')}</div>
        <h2 className="font-serif text-3xl text-cream">{t('story.title')}</h2>
        <p className="text-cream/80 text-sm mt-3 leading-relaxed">{t('story.body')}</p>
        <p className="text-gold-soft/90 text-sm mt-4 font-crest tracking-[0.15em] uppercase">{t('story.deadline')}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Lint + full test + build**

Run: `npm run lint` (clean), `npm run test` (green), `npm run build` (success).

- [ ] **Step 8: Commit**

```bash
git add src/components/sections/TravelInfo.tsx src/components/sections/EventSection.tsx src/components/sections/EventSection.test.tsx src/components/sections/StorySection.tsx
git commit -m "feat: Story/Event/Travel section components"
```

---

## Task 5: RsvpSection (move the form) + HomePage

**Files:**
- Create: `src/components/sections/RsvpSection.tsx`, `src/pages/HomePage.tsx`
- Test: `src/pages/HomePage.test.tsx`

- [ ] **Step 1: Create `src/components/sections/RsvpSection.tsx`**

Move the ENTIRE component body of the current `src/pages/Rsvp.tsx` into this new file, renaming the default export `Rsvp` to a named export `RsvpSection`, and wrapping the returned form/success markup in a `<section id="rsvp">`. Concretely:
- Copy `src/pages/Rsvp.tsx` verbatim into `src/components/sections/RsvpSection.tsx`.
- Fix the relative imports (now one level deeper): `../lib/rsvp` → `../../lib/rsvp`, `../lib/rsvpSubmit` → `../../lib/rsvpSubmit`, `../content/georgiaMenu` → `../../content/georgiaMenu`, `../content/events` → `../../content/events`, `../locale/useLocale` → `../../locale/useLocale`.
- Change `export default function Rsvp()` to `export function RsvpSection()`.
- Wrap BOTH return blocks (the success `div` and the form) so the outer element is `<section id="rsvp" data-testid="page-rsvp" …>`: keep `data-testid="page-rsvp"` (tests rely on it) and add `id="rsvp"`. The success branch's outer `div` becomes `<section id="rsvp" data-testid="page-rsvp" className="max-w-xl mx-auto px-5 py-16 text-center text-cream">`; the form stays a `<form>` but wrap it: simplest is to change its outer to `<form id="rsvp" data-testid="page-rsvp" …>` (a form can carry an id). Keep the EMPTY default already updated in Task 1 (no boat key).

- [ ] **Step 2: Create `src/pages/HomePage.tsx`**

Composes the whole page in order. The wedding `EventSection` gets the `TravelInfo` as children.
```tsx
import { Hero } from '../components/Hero';
import { StorySection } from '../components/sections/StorySection';
import { EventSection } from '../components/sections/EventSection';
import { TravelInfo } from '../components/sections/TravelInfo';
import { RsvpSection } from '../components/sections/RsvpSection';
import { EVENTS } from '../content/events';

export default function HomePage() {
  const georgia = EVENTS.find((e) => e.key === 'georgia')!;
  const rehearsal = EVENTS.find((e) => e.key === 'turkey_rehearsal')!;
  const wedding = EVENTS.find((e) => e.key === 'turkey_wedding')!;
  return (
    <div data-testid="page-home">
      <Hero />
      <StorySection />
      <EventSection event={georgia} id="georgia" />
      <EventSection event={rehearsal} id="rehearsal" />
      <EventSection event={wedding} id="wedding">
        <TravelInfo />
      </EventSection>
      <RsvpSection />
    </div>
  );
}
```

- [ ] **Step 3: Write a HomePage render test**

Create `src/pages/HomePage.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../i18n';
import { LocaleProvider } from '../locale/LocaleProvider';
import HomePage from './HomePage';

describe('HomePage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('renders hero, all three events, hotels, and the rsvp form', () => {
    render(<LocaleProvider><HomePage /></LocaleProvider>);
    expect(screen.getByText('Negar')).toBeInTheDocument();              // hero
    expect(screen.getByText('Georgia Celebration')).toBeInTheDocument();
    expect(screen.getByText('Rehearsal Dinner')).toBeInTheDocument();
    expect(screen.getByText('Wedding & Reception')).toBeInTheDocument();
    expect(screen.getByText(/Liberty Lykia Resort/)).toBeInTheDocument();
    expect(screen.getByText(/Morina Deluxe Hotel/)).toBeInTheDocument();
    expect(screen.getByText(/Hotel Karbel Sun/)).toBeInTheDocument();
    expect(screen.getByTestId('page-rsvp')).toBeInTheDocument();        // rsvp form
  });
});
```
Note: Hero renders the name "Negar" (a `getByText('Negar')` worked in the prior Home test). The RSVP form and Hero both contain a link/button referencing rsvp; this test only checks presence, so no ambiguity. If `getByText('Negar')` is ambiguous because the name appears twice, switch to `screen.getAllByText('Negar')[0]`.

- [ ] **Step 4: Run the HomePage test**

Run: `npm run test -- HomePage`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/RsvpSection.tsx src/pages/HomePage.tsx src/pages/HomePage.test.tsx
git commit -m "feat: RsvpSection + HomePage composition"
```

---

## Task 6: De-router App + minimal Nav + delete old pages

**Files:**
- Modify: `src/App.tsx`, `src/components/Nav.tsx`, `src/App.test.tsx`
- Delete: `src/pages/{Home,Events,Travel,Faq,Rsvp}.tsx` and `src/pages/{Home,Events,Travel,Faq,Rsvp}.test.tsx`, `src/content/faq.ts`, `vercel.json`
- Modify: `package.json` (remove react-router-dom)

- [ ] **Step 1: Rewrite `src/App.tsx` without the router**

```tsx
import { LocaleProvider } from './locale/LocaleProvider';
import { PasscodeGate } from './components/PasscodeGate';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <LocaleProvider>
      <PasscodeGate>
        <Layout>
          <HomePage />
        </Layout>
      </PasscodeGate>
    </LocaleProvider>
  );
}
```

- [ ] **Step 2: Update `src/components/Layout.tsx` to take children (no Outlet)**

Replace its body so it renders `children` instead of react-router's `<Outlet/>`:
```tsx
import type { ReactNode } from 'react';
import { Nav } from './Nav';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cobalt text-cream">
      <Nav />
      <main>{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `src/components/Nav.tsx` — monogram + flags only (no router)**

```tsx
import { useTranslation } from 'react-i18next';
import { useLocale } from '../locale/useLocale';

export function Nav() {
  useTranslation();
  const { locale, setLocale } = useLocale();
  const focus = 'focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2';
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between bg-cobalt-deep/95 px-4 py-3 backdrop-blur border-b border-gold-soft/25">
      <span className="font-crest tracking-[0.25em] text-gold-soft text-sm">N · M</span>
      <span className="flex gap-2 text-base">
        <button type="button" aria-label="English" aria-pressed={locale === 'en'} onClick={() => setLocale('en')} className={`${locale === 'en' ? 'opacity-100' : 'opacity-50'} ${focus}`}>🇺🇸</button>
        <button type="button" aria-label="فارسی" aria-pressed={locale === 'fa'} onClick={() => setLocale('fa')} className={`${locale === 'fa' ? 'opacity-100' : 'opacity-50'} ${focus}`}>🇮🇷</button>
      </span>
    </nav>
  );
}
```

- [ ] **Step 4: Rewrite `src/App.test.tsx`**

The smoke test should render `<App/>`, pre-unlock the gate, and assert the monogram + that HomePage rendered. Replace with:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import './i18n';
import App from './App';
import { UNLOCK_KEY } from './components/PasscodeGate';

describe('App', () => {
  beforeEach(() => { localStorage.setItem(UNLOCK_KEY, '1'); });
  afterEach(() => { localStorage.removeItem(UNLOCK_KEY); });

  it('renders nav and the single-page home', () => {
    render(<App />);
    expect(screen.getByText('N · M')).toBeInTheDocument();
    expect(screen.getByTestId('page-home')).toBeInTheDocument();
  });
});
```
Add the missing `afterEach` import: change the vitest import line to `import { describe, it, expect, beforeEach, afterEach } from 'vitest';`.

- [ ] **Step 5: Delete the superseded files**

```bash
git rm src/pages/Home.tsx src/pages/Home.test.tsx \
       src/pages/Events.tsx src/pages/Events.test.tsx \
       src/pages/Travel.tsx src/pages/Travel.test.tsx \
       src/pages/Faq.tsx src/pages/Faq.test.tsx \
       src/pages/Rsvp.tsx src/pages/Rsvp.test.tsx \
       src/content/faq.ts vercel.json
```
(Their logic now lives in HomePage + section components. The EventCard component is also now unused — check with `grep -rn "EventCard" src` and if there are no remaining importers, `git rm src/components/EventCard.tsx`.)

- [ ] **Step 6: Remove react-router-dom**

Run: `npm uninstall react-router-dom`
Then `grep -rn "react-router" src` — expect NO matches. If any remain, fix them.

- [ ] **Step 7: Lint + full test + build**

Run: `npm run lint` (clean), `npm run test` (all green — report count), `npm run build` (success).
Verify `grep -rn "react-router\|Outlet\|NavLink\|BrowserRouter" src` returns nothing.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: single-page App (remove router), minimal Nav, delete old pages + vercel.json"
```

---

## Task 7: Verify end-to-end + update launch docs

**Files:**
- Modify: `LAUNCH.md`, `DEPLOY.md`

- [ ] **Step 1: Manual browser pass**

Run `npm run dev`. In the browser: unlock with the passcode, confirm the single page scrolls through Hero → Story (with RSVP-by date) → Georgia → Rehearsal → Wedding (with the travel facts + 3 hotels inline) → RSVP. Toggle 🇮🇷 and confirm Farsi + RTL + Jalali dates across the whole page, and that the 3 hotels + travel facts read correctly. Submit a test RSVP → "Thank you!". (The event checkboxes should list exactly 3 events — no boat.)

- [ ] **Step 2: Update `DEPLOY.md`**

Remove the line about the SPA rewrite / `vercel.json` (it's deleted; a single-page app with one `index.html` needs no rewrite). Confirm the rest (env vars, Supabase, Resend, DNS) is unchanged.

- [ ] **Step 3: Update `LAUNCH.md`**

Adjust the structure description to "single long-scroll page" and the hotels list to the 3 current ones; note the two new hotels are placeholders to verify; remove the boat-party reference. Keep the Farsi-review and content-TODO notes.

- [ ] **Step 4: Final verification**

Run: `npm run test` (green), `npm run lint` (clean), `npm run build` (success, no chunk warning).

- [ ] **Step 5: Commit + tag**

```bash
git add LAUNCH.md DEPLOY.md
git commit -m "docs: update launch/deploy notes for single-page structure"
git tag v1.1.0
```

---

## Self-Review notes (addressed)

- **Spec coverage:** single page + no router (Task 6), minimal nav (Task 6), FAQ removed + folded (Tasks 3,4 — story.deadline + TravelInfo), travel colocated (Task 4/5 TravelInfo inside wedding EventSection), 3 events / boat dropped (Task 1), 3 hotels + simplified shape (Task 2), RSVP inline final section (Task 5), i18n parity (Task 3 check), docs (Task 7). All mapped.
- **Type consistency:** `EventKey` trimmed in Task 1 and reused in rsvp/rsvpSubmit; `Hotel` simplified in Task 2 and consumed by HotelCard (Task 2) + TravelInfo (Task 4); `EventSection` props (event/id/children) consistent between Task 4 definition and Task 5 usage; `Layout` children prop (Task 6) matches App usage (Task 6).
- **Placeholder scan:** hotel placeholders are intentional/flagged. No other placeholders.
- **Green-at-every-commit caveat:** Task 2 Step 4 and Task 3 Step 4 note that old page tests (Travel/Faq) referencing removed data are deleted in Task 6; Task 2 updates Travel.test.tsx assertions to keep it green until then, and Task 3 offers deleting Faq page/test early if strict green is desired. Acceptable.
