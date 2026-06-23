# Wedding Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (English/Farsi) multi-page wedding website for Negar & Matthew with a per-event RSVP form that saves to Supabase and emails a confirmation, hosted on Vercel at negarandmatt.com.

**Architecture:** Vite + React (TypeScript) + Tailwind CSS v4 SPA, React Router for pages, a LocaleProvider for EN/FA + RTL + Jalali calendar, content stored in structured locale/data files (not hardcoded), Supabase for RSVP persistence + a DB-webhook→Resend email. Testing is targeted: real Vitest tests for the date helper, RSVP validation, and Supabase mapping; render/smoke checks for pages; visual verification in-browser.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind v4, react-router-dom, react-i18next, dayjs + jalaliday, Vitest + @testing-library/react, @supabase/supabase-js, Resend (via Supabase Edge Function), Vercel.

**Reference:** Design spec at `docs/superpowers/specs/2026-06-22-wedding-site-design.md`. Content checklist at `docs/content-checklist.md`. Source photos in `/photos`. Invitation images at `photos/invitation_front.png` / `invitation_back.png` (color/font reference).

---

## Conventions for the whole plan

- Commit after each task with the message shown.
- Run `npm run lint` and `npm run test` before commits where tests exist.
- Color tokens, fonts, and content live in dedicated files — never hardcode hex/strings in components.
- All dates are stored/authored as ISO Gregorian strings; display conversion is the date helper's job only.
- Persian numerals and Jalali only affect *display* when locale === 'fa'.

---

## Phase 0 — Project Scaffold

### Task 1: Initialize Vite + React + TS project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Scaffold**

Run in repo root:
```bash
npm create vite@latest . -- --template react-ts
```
If prompted about the non-empty directory (photos/, docs/, .git/ exist), choose **"Ignore files and continue"**.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install react-router-dom react-i18next i18next dayjs jalaliday @supabase/supabase-js
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Verify dev server boots**

Run: `npm run dev`
Expected: Vite serves on http://localhost:5173 with the default page. Stop with Ctrl-C.

- [ ] **Step 4: Configure Vitest**

Add to `vite.config.ts` inside `defineConfig({...})`:
```ts
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
},
```
Create `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom';
```
Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Smoke test passes**

Create `src/test/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
describe('smoke', () => {
  it('runs', () => { expect(1 + 1).toBe(2); });
});
```
Run: `npm run test`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS + Vitest"
```

---

### Task 2: Install and configure Tailwind v4

**Files:**
- Create: `src/index.css`
- Modify: `vite.config.ts`, `src/main.tsx`

- [ ] **Step 1: Install Tailwind v4 Vite plugin**

```bash
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Add the plugin to `vite.config.ts`**

```ts
import tailwindcss from '@tailwindcss/vite';
// inside plugins: [react(), tailwindcss()]
```

- [ ] **Step 3: Create `src/index.css` with theme tokens**

```css
@import "tailwindcss";

@theme {
  --color-cobalt: #3a4a8c;
  --color-cobalt-deep: #2b3667;
  --color-cobalt-dark: #222c54;
  --color-cream: #f3ede0;
  --color-cream-2: #ece4d3;
  --color-gold: #c79a4b;
  --color-gold-soft: #d8b873;
  --color-ink: #1d2240;

  --font-script: "Pinyon Script", cursive;
  --font-serif: "Cormorant Garamond", serif;
  --font-crest: "Cinzel", serif;
  --font-sans: "Jost", sans-serif;
  --font-fa: "Vazirmatn", sans-serif;
}

:root { color-scheme: light; }
body { margin: 0; font-family: var(--font-sans); }
[dir="rtl"] body { font-family: var(--font-fa); }
```

- [ ] **Step 4: Import CSS in `src/main.tsx`**

Ensure `import './index.css';` is present.

- [ ] **Step 5: Add Google Fonts to `index.html`**

In `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Pinyon+Script&family=Cinzel:wght@400;500&family=Jost:wght@300;400;500&family=Vazirmatn:wght@300;400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 6: Verify a Tailwind utility renders**

Temporarily set `App.tsx` body to `<div className="bg-cobalt text-cream p-8">Test</div>`, run `npm run dev`, confirm cobalt background. Revert the temp change.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add Tailwind v4 with invitation color + font tokens"
```

---

### Task 3: Image optimization pipeline

**Files:**
- Create: `scripts/optimize-photos.mjs`, `src/assets/photos/` (output)

- [ ] **Step 1: Install sharp**

```bash
npm install -D sharp
```

- [ ] **Step 2: Write the optimize script**

Create `scripts/optimize-photos.mjs`:
```js
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join, parse } from 'node:path';

const SRC = 'photos';
const OUT = 'src/assets/photos';
const WIDTHS = [800, 1400, 2000];

const SKIP = ['invitation_front.png', 'invitation_back.png'];

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter(
  (f) => /\.(jpe?g|png)$/i.test(f) && !SKIP.includes(f)
);

for (const file of files) {
  const { name } = parse(file);
  for (const w of WIDTHS) {
    await sharp(join(SRC, file))
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(join(OUT, `${name}-${w}.webp`));
  }
  console.log(`optimized ${file}`);
}
console.log('done');
```

- [ ] **Step 3: Add npm script**

In `package.json` scripts: `"photos": "node scripts/optimize-photos.mjs"`

- [ ] **Step 4: Run it**

Run: `npm run photos`
Expected: `optimized ...` lines and `done`. Confirm `.webp` files exist in `src/assets/photos/`.

- [ ] **Step 5: Commit**

```bash
git add scripts/optimize-photos.mjs src/assets/photos package.json
git commit -m "build: add photo optimization pipeline + optimized webp assets"
```

---

## Phase 1 — i18n, Locale, and the Date Helper (the logic core)

### Task 4: Jalali + Persian-numeral date helper (TDD)

**Files:**
- Create: `src/lib/dateFormat.ts`, `src/lib/dateFormat.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/dateFormat.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { formatEventDate, toPersianDigits } from './dateFormat';

describe('toPersianDigits', () => {
  it('converts ASCII digits to Persian', () => {
    expect(toPersianDigits('2026')).toBe('۲۰۲۶');
  });
});

describe('formatEventDate', () => {
  const iso = '2026-10-06';
  it('formats Gregorian for en', () => {
    expect(formatEventDate(iso, 'en')).toBe('October 6, 2026');
  });
  it('formats Jalali with Persian digits for fa', () => {
    // 2026-10-06 Gregorian === 14 Mehr 1405 Jalali
    expect(formatEventDate(iso, 'fa')).toBe('۱۴ مهر ۱۴۰۵');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- dateFormat`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 3: Implement the helper**

Create `src/lib/dateFormat.ts`:
```ts
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';

dayjs.extend(jalaliday);

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const FA_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export type Locale = 'en' | 'fa';

export function formatEventDate(iso: string, locale: Locale): string {
  const d = dayjs(iso);
  if (locale === 'fa') {
    const j = d.calendar('jalali');
    const day = toPersianDigits(j.date());
    const month = FA_MONTHS[j.month()];
    const year = toPersianDigits(j.year());
    return `${day} ${month} ${year}`;
  }
  return d.format('MMMM D, YYYY');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- dateFormat`
Expected: PASS (3 tests). If the Jalali expectation is off by a day/month, correct the *expected* string to match `jalaliday`'s real output (verify the conversion), not by hacking the helper.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dateFormat.ts src/lib/dateFormat.test.ts
git commit -m "feat: add Jalali + Persian-numeral date helper with tests"
```

---

### Task 5: Locale resource files + i18n setup

**Files:**
- Create: `src/locales/en/common.json`, `src/locales/fa/common.json`, `src/i18n.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create English resources**

Create `src/locales/en/common.json` with the top-level UI keys (expand as pages are built):
```json
{
  "nav": { "home": "Home", "events": "Events", "travel": "Travel & Stay", "faq": "FAQ", "rsvp": "RSVP" },
  "hero": {
    "celebration": "The Wedding Celebration",
    "and": "&",
    "date": "Tuesday · October Sixth · 2026",
    "venue": "Liberty Lykia Resort — Ölüdeniz, Türkiye",
    "cta": "RSVP"
  },
  "passcode": { "prompt": "Please enter the passcode from your invitation", "placeholder": "Passcode", "submit": "Enter", "error": "That passcode isn't right — check your invitation." },
  "langPick": { "title": "Choose your language", "en": "English", "fa": "فارسی" }
}
```

- [ ] **Step 2: Create Farsi resources (placeholders clearly marked)**

Create `src/locales/fa/common.json`:
```json
{
  "nav": { "home": "خانه", "events": "مراسم‌ها", "travel": "سفر و اقامت", "faq": "پرسش‌ها", "rsvp": "پاسخ به دعوت" },
  "hero": {
    "celebration": "جشن عروسی",
    "and": "و",
    "date": "سه‌شنبه · چهاردهم مهر · ۱۴۰۵",
    "venue": "اقامتگاه لیبرتی لیکیا — اولودنیز، ترکیه",
    "cta": "پاسخ به دعوت"
  },
  "passcode": { "prompt": "لطفاً رمز روی دعوت‌نامه را وارد کنید", "placeholder": "رمز", "submit": "ورود", "error": "رمز درست نیست — دعوت‌نامه را بررسی کنید." },
  "langPick": { "title": "زبان خود را انتخاب کنید", "en": "English", "fa": "فارسی" }
}
```

- [ ] **Step 3: Configure i18next**

Create `src/i18n.ts`:
```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import faCommon from './locales/fa/common.json';

export const STORAGE_KEY = 'nm-locale';

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    fa: { common: faCommon },
  },
  lng: localStorage.getItem(STORAGE_KEY) ?? undefined,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
```

- [ ] **Step 4: Import in `src/main.tsx`**

Add `import './i18n';` before rendering `<App/>`.

- [ ] **Step 5: Commit**

```bash
git add src/locales src/i18n.ts src/main.tsx
git commit -m "feat: add i18n setup with en/fa common resources"
```

---

### Task 6: LocaleProvider (locale, dir, persistence, date formatting)

**Files:**
- Create: `src/locale/LocaleProvider.tsx`, `src/locale/useLocale.ts`, `src/locale/LocaleProvider.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/locale/LocaleProvider.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '../i18n';
import { LocaleProvider } from './LocaleProvider';
import { useLocale } from './useLocale';

function Probe() {
  const { locale, setLocale } = useLocale();
  return (
    <div>
      <span data-testid="loc">{locale}</span>
      <button onClick={() => setLocale('fa')}>fa</button>
    </div>
  );
}

describe('LocaleProvider', () => {
  it('defaults to en and sets html dir', () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    expect(screen.getByTestId('loc').textContent).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('switches to fa and sets rtl', () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    act(() => { screen.getByText('fa').click(); });
    expect(screen.getByTestId('loc').textContent).toBe('fa');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- LocaleProvider`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the provider and hook**

Create `src/locale/useLocale.ts`:
```ts
import { createContext, useContext } from 'react';
import type { Locale } from '../lib/dateFormat';

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
```

Create `src/locale/LocaleProvider.tsx`:
```tsx
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Locale } from '../lib/dateFormat';
import { STORAGE_KEY } from '../i18n';
import { LocaleContext } from './useLocale';

function applyDir(locale: Locale) {
  document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const initial = (localStorage.getItem(STORAGE_KEY) as Locale) || 'en';
  const [locale, setLocaleState] = useState<Locale>(initial);

  useEffect(() => { applyDir(locale); i18n.changeLanguage(locale); }, [locale, i18n]);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- LocaleProvider`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/locale
git commit -m "feat: add LocaleProvider with dir + persistence"
```

---

## Phase 2 — App Shell, Routing, Gate

### Task 7: Content data files (events, hotels, faq)

**Files:**
- Create: `src/content/events.ts`, `src/content/hotels.ts`, `src/content/faq.ts`

- [ ] **Step 1: Create events data**

Create `src/content/events.ts`:
```ts
export interface EventInfo {
  key: 'georgia' | 'turkey_rehearsal' | 'turkey_wedding' | 'boat';
  titleEn: string;
  titleFa: string;
  date: string | null;     // ISO Gregorian, null when TBD
  time: string | null;
  venueEn: string;
  venueFa: string;
  locationEn: string;
  locationFa: string;
  rsvpable: boolean;
  tbd?: boolean;
}

export const EVENTS: EventInfo[] = [
  {
    key: 'georgia',
    titleEn: 'Georgia Celebration', titleFa: 'جشن جورجیا',
    date: null, time: '12:00 PM ceremony · 2:00 PM dinner',
    venueEn: "Mac's Chophouse", venueFa: 'مکس چاپ‌هاوس',
    locationEn: 'Marietta, GA', locationFa: 'ماریتا، جورجیا',
    rsvpable: true, tbd: true,
  },
  {
    key: 'turkey_rehearsal',
    titleEn: 'Rehearsal Dinner', titleFa: 'شام تمرین',
    date: '2026-10-05', time: null,
    venueEn: 'Liberty Lykia Resort', venueFa: 'اقامتگاه لیبرتی لیکیا',
    locationEn: 'Ölüdeniz, Türkiye', locationFa: 'اولودنیز، ترکیه',
    rsvpable: true,
  },
  {
    key: 'turkey_wedding',
    titleEn: 'Wedding & Reception', titleFa: 'مراسم عروسی و پذیرایی',
    date: '2026-10-06', time: '5:30 PM',
    venueEn: 'Liberty Lykia Resort', venueFa: 'اقامتگاه لیبرتی لیکیا',
    locationEn: 'Ölüdeniz, Türkiye', locationFa: 'اولودنیز، ترکیه',
    rsvpable: true,
  },
  {
    key: 'boat',
    titleEn: 'Boat Party', titleFa: 'مهمانی قایق',
    date: '2026-10-07', time: null,
    venueEn: 'Details coming soon', venueFa: 'جزئیات به‌زودی',
    locationEn: 'Türkiye', locationFa: 'ترکیه',
    rsvpable: true, tbd: true,
  },
];
```

- [ ] **Step 2: Create hotels data (real, verify-before-launch)**

Create `src/content/hotels.ts`:
```ts
export interface Hotel {
  nameEn: string; nameFa: string;
  descEn: string; descFa: string;
  distanceEn: string; distanceFa: string;
  tier: '$$$' | '$$$$' | '$$$$$';
  url: string;
}

// NOTE: verify availability/details before launch.
export const HOTELS: Hotel[] = [
  { nameEn: 'Liberty Lykia – Adults Only', nameFa: 'لیبرتی لیکیا (بزرگسالان)', descEn: 'Connected adults-only sister property to the main resort.', descFa: 'بخش مخصوص بزرگسالان، متصل به اقامتگاه اصلی.', distanceEn: 'On resort', distanceFa: 'در محل اقامتگاه', tier: '$$$$$', url: 'https://www.libertyhotels.com/' },
  { nameEn: 'Sundia by Liberty Ölüdeniz', nameFa: 'سوندیا بای لیبرتی', descEn: 'Liberty property with a Michelin-recommended seafront restaurant.', descFa: 'متعلق به مجموعه لیبرتی با رستوران ساحلی.', distanceEn: 'Ölüdeniz', distanceFa: 'اولودنیز', tier: '$$$$', url: 'https://www.libertyhotels.com/' },
  { nameEn: 'Beyaz Yunus Hotel (Adults Only)', nameFa: 'بیاض یونس', descEn: 'Highly rated adults-only boutique near the beach.', descFa: 'بوتیک‌هتل مخصوص بزرگسالان نزدیک ساحل.', distanceEn: '~1.3 mi from resort', distanceFa: '≈۲ کیلومتر', tier: '$$$$', url: 'https://www.tripadvisor.com/' },
  { nameEn: 'Ecclesia Boutique Hotel (Adults Only)', nameFa: 'اکلسیا بوتیک', descEn: 'Top-rated adults-only boutique hotel.', descFa: 'بوتیک‌هتل برتر مخصوص بزرگسالان.', distanceEn: '~1.5 mi from resort', distanceFa: '≈۲٫۵ کیلومتر', tier: '$$$$', url: 'https://www.tripadvisor.com/' },
  { nameEn: 'Belcekum Beach Hotel', nameFa: 'بلجکوم بیچ', descEn: 'Beachfront hotel with a private beach.', descFa: 'هتل ساحلی با ساحل اختصاصی.', distanceEn: '~1.5 mi from resort', distanceFa: '≈۲٫۵ کیلومتر', tier: '$$$', url: 'https://www.tripadvisor.com/' },
  { nameEn: 'Garcia Resort & Spa', nameFa: 'گارسیا ریزورت و اسپا', descEn: 'Ölüdeniz beachfront resort & spa.', descFa: 'اقامتگاه و اسپای ساحلی اولودنیز.', distanceEn: 'Ölüdeniz', distanceFa: 'اولودنیز', tier: '$$$', url: 'https://www.tripadvisor.com/' },
];
```

- [ ] **Step 3: Create FAQ data (starter, from checklist)**

Create `src/content/faq.ts`:
```ts
export interface Faq { qEn: string; qFa: string; aEn: string; aFa: string; }

export const FAQS: Faq[] = [
  { qEn: 'When should I RSVP by?', qFa: 'تا چه زمانی پاسخ دهم؟', aEn: 'Kindly RSVP by September 6th, 2026.', aFa: 'لطفاً تا ۱۵ شهریور ۱۴۰۵ پاسخ دهید.' },
  { qEn: 'Which airport should I fly into?', qFa: 'به کدام فرودگاه پرواز کنم؟', aEn: 'Dalaman Airport (DLM) is closest to the resort. Transfers can be arranged.', aFa: 'فرودگاه دالامان (DLM) نزدیک‌ترین گزینه است. ترانسفر قابل هماهنگی است.' },
  { qEn: 'What is the dress code?', qFa: 'کد لباس چیست؟', aEn: 'Beach Formal — light, colorful, Mediterranean-inspired attire. Please avoid black or very dark colors.', aFa: 'رسمی ساحلی — لباس روشن و رنگی با حال‌وهوای مدیترانه‌ای. لطفاً از مشکی و رنگ‌های خیلی تیره پرهیز کنید.' },
  { qEn: 'Can I stay at a different hotel?', qFa: 'می‌توانم در هتل دیگری بمانم؟', aEn: 'Yes. See Travel & Stay for nearby options; off-resort guests may access the resort via a day pass.', aFa: 'بله. گزینه‌های نزدیک در بخش سفر و اقامت آمده است؛ مهمانان خارج از اقامتگاه می‌توانند با بلیت روزانه دسترسی داشته باشند.' },
];
```

- [ ] **Step 4: Commit**

```bash
git add src/content
git commit -m "feat: add structured content (events, hotels, faq)"
```

---

### Task 8: App shell, router, and Nav with language switcher

**Files:**
- Create: `src/components/Nav.tsx`, `src/components/Layout.tsx`, `src/pages/Home.tsx`, `src/pages/Events.tsx`, `src/pages/Travel.tsx`, `src/pages/Faq.tsx`, `src/pages/Rsvp.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Create placeholder pages**

Each page file (e.g. `src/pages/Home.tsx`) for now:
```tsx
export default function Home() { return <div data-testid="page-home" />; }
```
Repeat with matching testids: `page-events`, `page-travel`, `page-faq`, `page-rsvp`.

- [ ] **Step 2: Create Nav**

Create `src/components/Nav.tsx`:
```tsx
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../locale/useLocale';

export function Nav() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const links: [string, string][] = [
    ['/', t('nav.home')], ['/events', t('nav.events')],
    ['/travel', t('nav.travel')], ['/faq', t('nav.faq')], ['/rsvp', t('nav.rsvp')],
  ];
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between bg-cobalt-deep/95 px-4 py-3 backdrop-blur border-b border-gold-soft/25">
      <span className="font-crest tracking-[0.25em] text-gold-soft text-sm">N · M</span>
      <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider text-cream/90">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'text-gold-soft' : 'hover:text-gold-soft'} end={to === '/'}>{label}</NavLink>
        ))}
        <span className="flex gap-2 text-base">
          <button aria-label="English" onClick={() => setLocale('en')} className={locale === 'en' ? 'opacity-100' : 'opacity-50'}>🇺🇸</button>
          <button aria-label="فارسی" onClick={() => setLocale('fa')} className={locale === 'fa' ? 'opacity-100' : 'opacity-50'}>🇮🇷</button>
        </span>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create Layout**

Create `src/components/Layout.tsx`:
```tsx
import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';

export function Layout() {
  return (
    <div className="min-h-screen bg-cobalt text-cream">
      <Nav />
      <main><Outlet /></main>
    </div>
  );
}
```

- [ ] **Step 4: Wire the router in `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './locale/LocaleProvider';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import Travel from './pages/Travel';
import Faq from './pages/Faq';
import Rsvp from './pages/Rsvp';

export default function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="travel" element={<Travel />} />
            <Route path="faq" element={<Faq />} />
            <Route path="rsvp" element={<Rsvp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  );
}
```

- [ ] **Step 5: Smoke test the router renders Nav + Home**

Create `src/App.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import './i18n';
import App from './App';

describe('App', () => {
  it('renders nav and home by default', () => {
    render(<App />);
    expect(screen.getByText('N · M')).toBeInTheDocument();
    expect(screen.getByTestId('page-home')).toBeInTheDocument();
  });
});
```
Run: `npm run test -- App`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: app shell, router, nav with language switcher"
```

---

### Task 9: Passcode gate + one-time language pick

**Files:**
- Create: `src/components/PasscodeGate.tsx`, `src/components/PasscodeGate.test.tsx`
- Modify: `src/App.tsx`, `.env.example`

- [ ] **Step 1: Add the passcode env var**

Create/append `.env.example`:
```
VITE_SITE_PASSCODE=changeme
```
And `.env.local` (gitignored) with the real value (placeholder for now): `VITE_SITE_PASSCODE=lykia2026`.

- [ ] **Step 2: Write the failing test**

Create `src/components/PasscodeGate.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '../i18n';
import { LocaleProvider } from '../locale/LocaleProvider';
import { PasscodeGate } from './PasscodeGate';

const UNLOCK_KEY = 'nm-unlocked';

function setup() {
  return render(
    <LocaleProvider>
      <PasscodeGate><div data-testid="secret">welcome</div></PasscodeGate>
    </LocaleProvider>
  );
}

describe('PasscodeGate', () => {
  beforeEach(() => { localStorage.removeItem(UNLOCK_KEY); });

  it('hides content until correct passcode', () => {
    setup();
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
  });

  it('rejects a wrong passcode', () => {
    setup();
    fireEvent.change(screen.getByLabelText(/passcode/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText(/enter/i));
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
  });

  it('unlocks on correct passcode', () => {
    setup();
    fireEvent.change(screen.getByLabelText(/passcode/i), { target: { value: import.meta.env.VITE_SITE_PASSCODE } });
    fireEvent.click(screen.getByText(/enter/i));
    expect(screen.getByTestId('secret')).toBeInTheDocument();
  });
});
```
Note: set `VITE_SITE_PASSCODE=lykia2026` in the test env. Add to `vite.config.ts` test block: `env: { VITE_SITE_PASSCODE: 'lykia2026' }`.

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- PasscodeGate`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement the gate**

Create `src/components/PasscodeGate.tsx`:
```tsx
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const UNLOCK_KEY = 'nm-unlocked';

export function PasscodeGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(localStorage.getItem(UNLOCK_KEY) === '1');
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() === import.meta.env.VITE_SITE_PASSCODE) {
      localStorage.setItem(UNLOCK_KEY, '1');
      setUnlocked(true);
    } else { setError(true); }
  }

  return (
    <div className="min-h-screen bg-cobalt text-cream flex items-center justify-center p-6">
      <form onSubmit={submit} className="text-center max-w-sm w-full">
        <div className="font-crest tracking-[0.3em] text-gold-soft text-sm mb-6">N · M</div>
        <label htmlFor="pc" className="block font-serif text-xl mb-4">{t('passcode.prompt')}</label>
        <input id="pc" aria-label="passcode" value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          placeholder={t('passcode.placeholder')}
          className="w-full bg-transparent border border-gold-soft/50 px-4 py-3 text-center tracking-widest focus:outline-none focus:border-gold-soft" />
        {error && <p className="text-gold-soft text-sm mt-3">{t('passcode.error')}</p>}
        <button type="submit" className="mt-5 border border-gold text-gold-soft px-8 py-3 text-xs uppercase tracking-[0.25em] hover:bg-gold/10">{t('passcode.submit')}</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- PasscodeGate`
Expected: PASS (3 tests).

- [ ] **Step 6: Wrap the app**

In `src/App.tsx`, wrap `<BrowserRouter>` with `<PasscodeGate>` inside `<LocaleProvider>`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add soft passcode gate"
```

---

## Phase 3 — Pages (presentational; render/smoke tests + visual verification)

### Task 10: Hero + Home page

**Files:**
- Create: `src/components/Hero.tsx`, `src/components/PhotoBand.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Build Hero**

Create `src/components/Hero.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative bg-cobalt text-cream text-center px-6 py-20">
      <div className="pointer-events-none absolute inset-4 border border-gold-soft/50" />
      <div className="font-crest tracking-[0.3em] text-gold-soft text-xs mb-2">🐚</div>
      <div className="font-crest tracking-[0.3em] text-gold-soft text-xs mb-4">N&nbsp;&nbsp;&nbsp;M</div>
      <p className="font-serif text-cream/80 mb-4">{t('hero.celebration')}</p>
      <h1 className="font-script text-cream leading-tight text-6xl">
        Negar<span className="block text-gold-soft text-4xl my-1">{t('hero.and')}</span>Matthew
      </h1>
      <p className="font-serif tracking-[0.2em] uppercase text-[11px] text-cream/90 mt-6 leading-loose">
        {t('hero.date')}<br />{t('hero.venue')}
      </p>
      <Link to="/rsvp" className="inline-block mt-6 border border-gold text-gold-soft px-8 py-3 text-[10px] uppercase tracking-[0.25em] hover:bg-gold/10">
        {t('hero.cta')}
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Build reusable PhotoBand**

Create `src/components/PhotoBand.tsx`:
```tsx
interface PhotoBandProps { srcBase: string; alt: string; height?: string; }
export function PhotoBand({ srcBase, alt, height = 'h-72' }: PhotoBandProps) {
  return (
    <img
      src={`/src/assets/photos/${srcBase}-1400.webp`}
      srcSet={`/src/assets/photos/${srcBase}-800.webp 800w, /src/assets/photos/${srcBase}-1400.webp 1400w, /src/assets/photos/${srcBase}-2000.webp 2000w`}
      sizes="100vw" alt={alt} loading="lazy"
      className={`w-full ${height} object-cover`}
    />
  );
}
```
Note: confirm the actual optimized filename bases from `src/assets/photos/` (e.g. `LVL040526JC1-102`) and use a real one. Prefer importing assets via Vite (`import hero from '../assets/photos/...webp'`) if direct paths don't resolve in the build — adjust accordingly.

- [ ] **Step 3: Compose Home**

`src/pages/Home.tsx`:
```tsx
import { Hero } from '../components/Hero';
import { PhotoBand } from '../components/PhotoBand';

export default function Home() {
  return (
    <div data-testid="page-home">
      <Hero />
      <PhotoBand srcBase="LVL040526JC1-102" alt="Negar and Matthew on the beach" />
    </div>
  );
}
```

- [ ] **Step 4: Render test**

Create `src/pages/Home.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../i18n';
import Home from './Home';

describe('Home', () => {
  it('renders the hero names and RSVP CTA', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText('Negar')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /rsvp/i })).toHaveAttribute('href', '/rsvp');
  });
});
```
Run: `npm run test -- Home`
Expected: PASS.

- [ ] **Step 5: Visual check**

Run `npm run dev`, open http://localhost:5173, enter passcode, confirm hero matches the invitation feel (cobalt, gold frame, Pinyon names). Adjust spacing/sizes to taste.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: hero + home page with photo band"
```

---

### Task 11: Events page

**Files:**
- Create: `src/components/EventCard.tsx`
- Modify: `src/pages/Events.tsx`

- [ ] **Step 1: Build EventCard (uses date helper + locale + TBD state)**

Create `src/components/EventCard.tsx`:
```tsx
import { useLocale } from '../locale/useLocale';
import { formatEventDate } from '../lib/dateFormat';
import type { EventInfo } from '../content/events';

export function EventCard({ event }: { event: EventInfo }) {
  const { locale } = useLocale();
  const title = locale === 'fa' ? event.titleFa : event.titleEn;
  const venue = locale === 'fa' ? event.venueFa : event.venueEn;
  const location = locale === 'fa' ? event.locationFa : event.locationEn;
  const dateLabel = event.date
    ? formatEventDate(event.date, locale)
    : (locale === 'fa' ? 'تاریخ به‌زودی' : 'Date coming soon');
  return (
    <article className="border border-gold-soft/35 p-5 bg-white/5">
      <div className="font-crest text-[9px] tracking-[0.2em] uppercase text-gold-soft">
        {dateLabel}{event.time ? ` · ${event.time}` : ''}
      </div>
      <h3 className="font-serif text-2xl text-cream mt-1">{title}</h3>
      <p className="text-cream/80 text-sm">{venue} · {location}</p>
      {event.tbd && <p className="text-gold-soft/80 italic text-xs mt-2">{locale === 'fa' ? 'جزئیات بیشتر به‌زودی' : 'More details to come'}</p>}
    </article>
  );
}
```

- [ ] **Step 2: Compose Events page**

`src/pages/Events.tsx`:
```tsx
import { EVENTS } from '../content/events';
import { EventCard } from '../components/EventCard';

export default function Events() {
  return (
    <div data-testid="page-events" className="max-w-2xl mx-auto px-5 py-10 space-y-4">
      {EVENTS.map((e) => <EventCard key={e.key} event={e} />)}
    </div>
  );
}
```

- [ ] **Step 3: Render test (incl. TBD state)**

Create `src/pages/Events.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../i18n';
import { LocaleProvider } from '../locale/LocaleProvider';
import Events from './Events';

describe('Events', () => {
  it('renders all events and a coming-soon for TBD', () => {
    render(<LocaleProvider><Events /></LocaleProvider>);
    expect(screen.getByText('Wedding & Reception')).toBeInTheDocument();
    expect(screen.getAllByText('More details to come').length).toBeGreaterThan(0);
    expect(screen.getByText('Date coming soon')).toBeInTheDocument();
  });
});
```
Run: `npm run test -- Events`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: events page with date helper + TBD states"
```

---

### Task 12: Travel & Stay page (hotels)

**Files:**
- Create: `src/components/HotelCard.tsx`
- Modify: `src/pages/Travel.tsx`

- [ ] **Step 1: Build HotelCard**

Create `src/components/HotelCard.tsx`:
```tsx
import { useLocale } from '../locale/useLocale';
import type { Hotel } from '../content/hotels';

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const { locale } = useLocale();
  const name = locale === 'fa' ? hotel.nameFa : hotel.nameEn;
  const desc = locale === 'fa' ? hotel.descFa : hotel.descEn;
  const distance = locale === 'fa' ? hotel.distanceFa : hotel.distanceEn;
  return (
    <a href={hotel.url} target="_blank" rel="noreferrer" className="block border border-gold-soft/35 p-5 bg-white/5 hover:border-gold-soft">
      <div className="flex justify-between items-baseline">
        <h3 className="font-serif text-xl text-cream">{name}</h3>
        <span className="text-gold-soft text-xs">{hotel.tier}</span>
      </div>
      <p className="text-cream/80 text-sm mt-1">{desc}</p>
      <p className="text-gold-soft/80 text-xs mt-2">{distance}</p>
    </a>
  );
}
```

- [ ] **Step 2: Compose Travel page**

`src/pages/Travel.tsx`:
```tsx
import { useTranslation } from 'react-i18next';
import { HOTELS } from '../content/hotels';
import { HotelCard } from '../components/HotelCard';

export default function Travel() {
  useTranslation();
  return (
    <div data-testid="page-travel" className="max-w-2xl mx-auto px-5 py-10">
      <h2 className="font-serif text-3xl text-cream text-center mb-2">Travel & Stay</h2>
      <p className="text-cream/80 text-center text-sm mb-8">Fly into Dalaman (DLM) · transfers can be arranged · day pass available for off-resort guests.</p>
      <div className="space-y-4">
        {HOTELS.map((h) => <HotelCard key={h.nameEn} hotel={h} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Render test**

Create `src/pages/Travel.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../i18n';
import { LocaleProvider } from '../locale/LocaleProvider';
import Travel from './Travel';

describe('Travel', () => {
  it('lists hotels', () => {
    render(<LocaleProvider><Travel /></LocaleProvider>);
    expect(screen.getByText(/Liberty Lykia – Adults Only/)).toBeInTheDocument();
    expect(screen.getByText(/Sundia by Liberty/)).toBeInTheDocument();
  });
});
```
Run: `npm run test -- Travel`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: travel & stay page with real hotel list"
```

---

### Task 13: FAQ page

**Files:**
- Modify: `src/pages/Faq.tsx`

- [ ] **Step 1: Build FAQ accordion**

`src/pages/Faq.tsx`:
```tsx
import { useLocale } from '../locale/useLocale';
import { FAQS } from '../content/faq';

export default function Faq() {
  const { locale } = useLocale();
  return (
    <div data-testid="page-faq" className="max-w-2xl mx-auto px-5 py-10 space-y-3">
      {FAQS.map((f, i) => (
        <details key={i} className="border border-gold-soft/35 p-4 bg-white/5">
          <summary className="font-serif text-lg text-cream cursor-pointer">{locale === 'fa' ? f.qFa : f.qEn}</summary>
          <p className="text-cream/80 text-sm mt-2">{locale === 'fa' ? f.aFa : f.aEn}</p>
        </details>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Render test**

Create `src/pages/Faq.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocaleProvider } from '../locale/LocaleProvider';
import '../i18n';
import Faq from './Faq';

describe('Faq', () => {
  it('renders questions', () => {
    render(<LocaleProvider><Faq /></LocaleProvider>);
    expect(screen.getByText(/When should I RSVP by/)).toBeInTheDocument();
  });
});
```
Run: `npm run test -- Faq`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: faq page"
```

---

## Phase 4 — RSVP (form logic + Supabase)

### Task 14: RSVP validation logic (TDD)

**Files:**
- Create: `src/lib/rsvp.ts`, `src/lib/rsvp.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/rsvp.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { validateRsvp, type RsvpDraft } from './rsvp';

const base: RsvpDraft = {
  fullName: 'Sam Guest', email: 'sam@example.com', partySize: 1,
  guests: [{ name: 'Sam Guest', georgiaMain: 'Filet' }],
  events: { georgia: true, turkey_rehearsal: false, turkey_wedding: false, boat: false },
  dietary: '', songRequest: '', note: '',
};

describe('validateRsvp', () => {
  it('accepts a valid draft', () => {
    expect(validateRsvp(base).valid).toBe(true);
  });
  it('requires a name', () => {
    expect(validateRsvp({ ...base, fullName: '' }).errors.fullName).toBeDefined();
  });
  it('requires a valid email', () => {
    expect(validateRsvp({ ...base, email: 'nope' }).errors.email).toBeDefined();
  });
  it('requires at least one event answered yes', () => {
    const r = validateRsvp({ ...base, events: { georgia: false, turkey_rehearsal: false, turkey_wedding: false, boat: false } });
    expect(r.errors.events).toBeDefined();
  });
  it('requires a Georgia main course when attending Georgia', () => {
    const r = validateRsvp({ ...base, guests: [{ name: 'Sam Guest', georgiaMain: '' }] });
    expect(r.errors.guests).toBeDefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- rsvp`
Expected: FAIL.

- [ ] **Step 3: Implement validation**

Create `src/lib/rsvp.ts`:
```ts
export type EventKey = 'georgia' | 'turkey_rehearsal' | 'turkey_wedding' | 'boat';

export interface GuestDraft { name: string; georgiaMain: string; }
export interface RsvpDraft {
  fullName: string; email: string; partySize: number;
  guests: GuestDraft[];
  events: Record<EventKey, boolean>;
  dietary: string; songRequest: string; note: string;
}

export interface ValidationResult { valid: boolean; errors: Record<string, string>; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRsvp(d: RsvpDraft): ValidationResult {
  const errors: Record<string, string> = {};
  if (!d.fullName.trim()) errors.fullName = 'Name is required';
  if (!EMAIL_RE.test(d.email)) errors.email = 'A valid email is required';
  if (!Object.values(d.events).some(Boolean)) errors.events = 'Please RSVP to at least one event';
  if (d.events.georgia && d.guests.some((g) => !g.georgiaMain.trim())) {
    errors.guests = 'Please choose a main course for each guest attending the Georgia dinner';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- rsvp`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/rsvp.ts src/lib/rsvp.test.ts
git commit -m "feat: rsvp validation logic with tests"
```

---

### Task 15: Supabase client + submit mapping (TDD on the mapping)

**Files:**
- Create: `src/lib/supabase.ts`, `src/lib/rsvpSubmit.ts`, `src/lib/rsvpSubmit.test.ts`
- Modify: `.env.example`

- [ ] **Step 1: Add env vars**

Append to `.env.example`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 2: Create the Supabase client**

Create `src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

- [ ] **Step 3: Write the failing test for the row mapping (pure function, no network)**

Create `src/lib/rsvpSubmit.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildRsvpRows } from './rsvpSubmit';
import type { RsvpDraft } from './rsvp';

const draft: RsvpDraft = {
  fullName: 'Sam Guest', email: 'sam@example.com', partySize: 2,
  guests: [{ name: 'Sam Guest', georgiaMain: 'Filet' }, { name: 'Pat Plus', georgiaMain: 'Salmon' }],
  events: { georgia: true, turkey_rehearsal: false, turkey_wedding: true, boat: false },
  dietary: 'none', songRequest: 'Dancing Queen', note: 'Yay',
};

describe('buildRsvpRows', () => {
  const { rsvp, guests, events } = buildRsvpRows(draft, 'en');

  it('maps the rsvp row', () => {
    expect(rsvp).toMatchObject({ full_name: 'Sam Guest', email: 'sam@example.com', party_size: 2, locale: 'en', dietary: 'none', song_request: 'Dancing Queen', note: 'Yay' });
  });
  it('maps one guest row per guest', () => {
    expect(guests).toHaveLength(2);
    expect(guests[1]).toMatchObject({ guest_name: 'Pat Plus', georgia_main: 'Salmon' });
  });
  it('maps one event row per event with attendance', () => {
    expect(events).toHaveLength(4);
    const wedding = events.find((e) => e.event_key === 'turkey_wedding');
    expect(wedding?.attending).toBe(true);
  });
});
```

- [ ] **Step 4: Run to verify it fails**

Run: `npm run test -- rsvpSubmit`
Expected: FAIL.

- [ ] **Step 5: Implement mapping + submit**

Create `src/lib/rsvpSubmit.ts`:
```ts
import { supabase } from './supabase';
import type { RsvpDraft, EventKey } from './rsvp';

export interface RsvpRow { full_name: string; email: string; party_size: number; locale: string; dietary: string; song_request: string; note: string; }
export interface GuestRow { guest_name: string; georgia_main: string; }
export interface EventRow { event_key: EventKey; attending: boolean; }

export function buildRsvpRows(d: RsvpDraft, locale: string): { rsvp: RsvpRow; guests: GuestRow[]; events: EventRow[] } {
  return {
    rsvp: { full_name: d.fullName.trim(), email: d.email.trim(), party_size: d.partySize, locale, dietary: d.dietary, song_request: d.songRequest, note: d.note },
    guests: d.guests.map((g) => ({ guest_name: g.name.trim(), georgia_main: g.georgiaMain })),
    events: (Object.keys(d.events) as EventKey[]).map((k) => ({ event_key: k, attending: d.events[k] })),
  };
}

export async function submitRsvp(d: RsvpDraft, locale: string): Promise<{ error: string | null }> {
  const { rsvp, guests, events } = buildRsvpRows(d, locale);
  const { data, error } = await supabase.from('rsvps').insert(rsvp).select('id').single();
  if (error || !data) return { error: error?.message ?? 'Insert failed' };
  const id = data.id as string;
  const { error: gErr } = await supabase.from('rsvp_guests').insert(guests.map((g) => ({ ...g, rsvp_id: id })));
  if (gErr) return { error: gErr.message };
  const { error: eErr } = await supabase.from('rsvp_events').insert(events.map((e) => ({ ...e, rsvp_id: id })));
  if (eErr) return { error: eErr.message };
  return { error: null };
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `npm run test -- rsvpSubmit`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase.ts src/lib/rsvpSubmit.ts src/lib/rsvpSubmit.test.ts .env.example
git commit -m "feat: supabase client + rsvp row mapping/submit with tests"
```

---

### Task 16: RSVP form UI

**Files:**
- Modify: `src/pages/Rsvp.tsx`
- Create: `src/content/georgiaMenu.ts`

- [ ] **Step 1: Add menu options (placeholder until Mac's finalizes)**

Create `src/content/georgiaMenu.ts`:
```ts
// Placeholder options — replace once Mac's Chophouse menu is finalized.
export const GEORGIA_MAINS = ['Filet Mignon', 'Grilled Salmon', 'Roasted Chicken', 'Vegetarian'];
```

- [ ] **Step 2: Build the form**

`src/pages/Rsvp.tsx` (controlled form using `validateRsvp` + `submitRsvp`):
```tsx
import { useState } from 'react';
import { useLocale } from '../locale/useLocale';
import { validateRsvp, type RsvpDraft, type EventKey } from '../lib/rsvp';
import { submitRsvp } from '../lib/rsvpSubmit';
import { GEORGIA_MAINS } from '../content/georgiaMenu';
import { EVENTS } from '../content/events';

const EMPTY: RsvpDraft = {
  fullName: '', email: '', partySize: 1,
  guests: [{ name: '', georgiaMain: '' }],
  events: { georgia: false, turkey_rehearsal: false, turkey_wedding: false, boat: false },
  dietary: '', songRequest: '', note: '',
};

export default function Rsvp() {
  const { locale } = useLocale();
  const [draft, setDraft] = useState<RsvpDraft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  function setEvent(k: EventKey, v: boolean) { setDraft((d) => ({ ...d, events: { ...d.events, [k]: v } })); }
  function setGuest(i: number, patch: Partial<RsvpDraft['guests'][number]>) {
    setDraft((d) => ({ ...d, guests: d.guests.map((g, idx) => idx === i ? { ...g, ...patch } : g) }));
  }
  function setPartySize(n: number) {
    setDraft((d) => {
      const guests = Array.from({ length: n }, (_, i) => d.guests[i] ?? { name: '', georgiaMain: '' });
      return { ...d, partySize: n, guests };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = validateRsvp(draft);
    setErrors(res.errors);
    if (!res.valid) return;
    setStatus('sending');
    const { error } = await submitRsvp(draft, locale);
    setStatus(error ? 'error' : 'done');
  }

  if (status === 'done') {
    return <div data-testid="page-rsvp" className="max-w-xl mx-auto px-5 py-16 text-center">
      <h2 className="font-serif text-3xl text-cream">Thank you!</h2>
      <p className="text-cream/80 mt-3">Your RSVP has been received. We can't wait to celebrate with you.</p>
    </div>;
  }

  return (
    <form data-testid="page-rsvp" onSubmit={onSubmit} className="max-w-xl mx-auto px-5 py-10 space-y-5 text-cream">
      <h2 className="font-serif text-3xl text-center">RSVP</h2>

      <label className="block">Full name
        <input className="mt-1 w-full bg-transparent border border-gold-soft/40 px-3 py-2" value={draft.fullName}
          onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} />
      </label>
      {errors.fullName && <p className="text-gold-soft text-sm">{errors.fullName}</p>}

      <label className="block">Email
        <input type="email" className="mt-1 w-full bg-transparent border border-gold-soft/40 px-3 py-2" value={draft.email}
          onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
      </label>
      {errors.email && <p className="text-gold-soft text-sm">{errors.email}</p>}

      <label className="block">Party size
        <input type="number" min={1} max={8} className="mt-1 w-24 bg-transparent border border-gold-soft/40 px-3 py-2" value={draft.partySize}
          onChange={(e) => setPartySize(Math.max(1, Number(e.target.value)))} />
      </label>

      <fieldset className="border border-gold-soft/30 p-4">
        <legend className="px-2 font-serif">Which events will you attend?</legend>
        {EVENTS.map((ev) => (
          <label key={ev.key} className="flex items-center gap-2 py-1">
            <input type="checkbox" checked={draft.events[ev.key]} onChange={(e) => setEvent(ev.key, e.target.checked)} />
            {locale === 'fa' ? ev.titleFa : ev.titleEn}
          </label>
        ))}
      </fieldset>
      {errors.events && <p className="text-gold-soft text-sm">{errors.events}</p>}

      {draft.events.georgia && (
        <fieldset className="border border-gold-soft/30 p-4 space-y-3">
          <legend className="px-2 font-serif">Georgia dinner — main course per guest</legend>
          {draft.guests.map((g, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder={`Guest ${i + 1} name`} className="flex-1 bg-transparent border border-gold-soft/40 px-3 py-2" value={g.name}
                onChange={(e) => setGuest(i, { name: e.target.value })} />
              <select className="bg-cobalt-deep border border-gold-soft/40 px-3 py-2" value={g.georgiaMain}
                onChange={(e) => setGuest(i, { georgiaMain: e.target.value })}>
                <option value="">Select…</option>
                {GEORGIA_MAINS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          ))}
        </fieldset>
      )}
      {errors.guests && <p className="text-gold-soft text-sm">{errors.guests}</p>}

      <label className="block">Dietary restrictions
        <input className="mt-1 w-full bg-transparent border border-gold-soft/40 px-3 py-2" value={draft.dietary}
          onChange={(e) => setDraft({ ...draft, dietary: e.target.value })} />
      </label>
      <label className="block">Song request (optional)
        <input className="mt-1 w-full bg-transparent border border-gold-soft/40 px-3 py-2" value={draft.songRequest}
          onChange={(e) => setDraft({ ...draft, songRequest: e.target.value })} />
      </label>
      <label className="block">Note to the couple (optional)
        <textarea className="mt-1 w-full bg-transparent border border-gold-soft/40 px-3 py-2" value={draft.note}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
      </label>

      {status === 'error' && <p className="text-gold-soft">Something went wrong — please try again.</p>}
      <button type="submit" disabled={status === 'sending'} className="border border-gold text-gold-soft px-8 py-3 text-xs uppercase tracking-[0.25em] hover:bg-gold/10 disabled:opacity-50">
        {status === 'sending' ? 'Sending…' : 'Send RSVP'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Render/smoke test (validation surfaces, no network)**

Create `src/pages/Rsvp.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocaleProvider } from '../locale/LocaleProvider';
import '../i18n';
import Rsvp from './Rsvp';

describe('Rsvp', () => {
  it('shows validation errors on empty submit', () => {
    render(<LocaleProvider><Rsvp /></LocaleProvider>);
    fireEvent.click(screen.getByText(/Send RSVP/i));
    expect(screen.getByText(/Name is required/)).toBeInTheDocument();
    expect(screen.getByText(/RSVP to at least one event/)).toBeInTheDocument();
  });
});
```
Run: `npm run test -- Rsvp`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: rsvp form UI wired to validation + submit"
```

---

## Phase 5 — Supabase backend, Email, Hosting, DNS (manual/ops)

> These tasks involve external dashboards and credentials. They're written as exact
> checklists; the executor confirms each, and the human supplies secrets via `.env.local`
> and the Supabase/Vercel/Resend dashboards (never commit secrets).

### Task 17: Supabase project, tables, RLS

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Write schema SQL**

Create `supabase/schema.sql`:
```sql
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  party_size int not null default 1,
  locale text not null default 'en',
  dietary text,
  song_request text,
  note text
);

create table if not exists rsvp_guests (
  id uuid primary key default gen_random_uuid(),
  rsvp_id uuid not null references rsvps(id) on delete cascade,
  guest_name text,
  georgia_main text
);

create table if not exists rsvp_events (
  id uuid primary key default gen_random_uuid(),
  rsvp_id uuid not null references rsvps(id) on delete cascade,
  event_key text not null,
  attending boolean not null default false
);

alter table rsvps enable row level security;
alter table rsvp_guests enable row level security;
alter table rsvp_events enable row level security;

-- Public (anon) may INSERT only; no SELECT/UPDATE/DELETE.
create policy "anon insert rsvps" on rsvps for insert to anon with check (true);
create policy "anon insert guests" on rsvp_guests for insert to anon with check (true);
create policy "anon insert events" on rsvp_events for insert to anon with check (true);
```

- [ ] **Step 2: Create the Supabase project + run schema**

Use the Supabase MCP tools (authenticate first) or the dashboard SQL editor to create a project and run `supabase/schema.sql`. Record the project URL + anon key.

- [ ] **Step 3: Put creds in `.env.local`**

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

- [ ] **Step 4: Manual end-to-end insert test**

Run `npm run dev`, submit a real RSVP, confirm rows appear in the `rsvps`/`rsvp_guests`/`rsvp_events` tables in the Supabase dashboard.

- [ ] **Step 5: Commit (schema only — no secrets)**

```bash
git add supabase/schema.sql
git commit -m "feat: supabase schema + insert-only RLS"
```

---

### Task 18: Email confirmation via Edge Function + DB webhook (Resend)

**Files:**
- Create: `supabase/functions/rsvp-email/index.ts`

- [ ] **Step 1: Write the Edge Function**

Create `supabase/functions/rsvp-email/index.ts`:
```ts
// Deno Edge Function: receives the new RSVP row from a DB webhook, emails the couple.
import { serve } from 'https://deno.land/std/http/server.ts';

serve(async (req) => {
  const payload = await req.json();
  const r = payload.record ?? {};
  const html = `
    <h2>New RSVP — ${r.full_name}</h2>
    <p>Email: ${r.email}<br/>Party size: ${r.party_size}<br/>Language: ${r.locale}</p>
    <p>Dietary: ${r.dietary ?? ''}<br/>Song: ${r.song_request ?? ''}</p>
    <p>Note: ${r.note ?? ''}</p>
    <p>See the Supabase dashboard for per-event answers and meal choices.</p>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'RSVP <rsvp@negarandmatt.com>',
      to: [Deno.env.get('COUPLE_EMAIL')],
      subject: `RSVP: ${r.full_name}`,
      html,
    }),
  });
  return new Response(JSON.stringify({ ok: res.ok }), { status: res.ok ? 200 : 500 });
});
```

- [ ] **Step 2: Set function secrets**

In the Supabase dashboard (Edge Functions → secrets), set `RESEND_API_KEY` and `COUPLE_EMAIL=mgrogan01@gmail.com`.

- [ ] **Step 3: Deploy the function**

Deploy `rsvp-email` via the Supabase MCP/CLI/dashboard.

- [ ] **Step 4: Create a DB webhook**

In Supabase → Database → Webhooks: on `INSERT` into `rsvps`, call the `rsvp-email` function.

- [ ] **Step 5: Verify Resend domain**

In Resend, add `negarandmatt.com` and copy the DKIM/SPF DNS records (used in Task 20).

- [ ] **Step 6: End-to-end test**

Submit an RSVP; confirm an email arrives at the couple's address. (Until DNS verification in Task 20, use Resend's onboarding/test domain as `from`.)

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/rsvp-email/index.ts
git commit -m "feat: rsvp confirmation email edge function"
```

---

### Task 19: Production build config + Vercel deploy

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: SPA rewrite config**

Create `vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

- [ ] **Step 2: Verify the production build**

Run: `npm run build`
Expected: build succeeds, `dist/` produced. Run `npm run preview` and click through all pages + passcode.

- [ ] **Step 3: Deploy to Vercel**

Connect the repo to Vercel (or `npx vercel`). Set env vars in the Vercel dashboard: `VITE_SITE_PASSCODE`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Deploy.

- [ ] **Step 4: Smoke test the deployment**

Open the Vercel URL, enter passcode, navigate all pages, submit a test RSVP, confirm row + email.

- [ ] **Step 5: Commit**

```bash
git add vercel.json
git commit -m "build: add vercel SPA rewrite config"
```

---

### Task 20: DNS for negarandmatt.com

- [ ] **Step 1: Point the domain at Vercel**

In Vercel → Project → Domains, add `negarandmatt.com` and `www.negarandmatt.com`. Copy the A/ALIAS + CNAME records Vercel shows.

- [ ] **Step 2: Add records at the registrar**

At the domain registrar's DNS panel, add the Vercel records (apex A/ALIAS + `www` CNAME) and the Resend DKIM/SPF records from Task 18 Step 5.

- [ ] **Step 3: Wait for propagation + HTTPS**

Confirm Vercel marks the domain "Valid" and HTTPS is provisioned. Confirm Resend shows the domain "Verified".

- [ ] **Step 4: Switch Resend `from` to the verified domain**

Update the Edge Function `from` to `rsvp@negarandmatt.com` (redeploy if needed). Re-test an RSVP email.

- [ ] **Step 5: Final end-to-end check on the live domain**

Visit https://negarandmatt.com, full pass: passcode → both languages (check RTL + Jalali dates) → submit RSVP → confirm row + email.

---

## Phase 6 — Farsi/RTL polish & launch readiness

### Task 21: RTL + Farsi verification pass

- [ ] **Step 1: Visual RTL audit**

In `fa` locale, click every page. Verify: nav mirrors correctly, form fields/labels read right-to-left, event/hotel cards mirror, Jalali dates show with Persian numerals, no clipped text. Fix layout issues using logical Tailwind utilities (`ps-*`/`pe-*`, `text-start`) where needed.

- [ ] **Step 2: Translation completeness**

Confirm no English leaks in `fa` mode on built pages (nav, hero, buttons, validation messages, success state). Add any missing keys to both locale files. Mark prose still pending accurate Farsi with a visible "(translation pending)" note for the couple to replace.

- [ ] **Step 3: Run full test suite + lint**

Run: `npm run test && npm run lint`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "polish: RTL + Farsi verification pass"
```

---

### Task 22: Launch checklist tie-off

- [ ] **Step 1: Cross-check against content checklist**

Open `docs/content-checklist.md`. Confirm the "minimum set to launch" items are either filled or have graceful "coming soon" states: RSVP deadline, who's invited to which events, Georgia date, Mac's menu options, airport/transfer basics, a contact method.

- [ ] **Step 2: Replace placeholders that are now known**

Update `src/content/*` and locale files with any finalized details the couple has provided (passcode value, menu options, Georgia date, contact email/phone).

- [ ] **Step 3: Verify hotels**

Confirm each hotel in `src/content/hotels.ts` is current (name, link, rough distance). Remove/replace any that don't check out.

- [ ] **Step 4: Final commit + tag**

```bash
git add -A
git commit -m "chore: launch content tie-off"
git tag v1.0.0
```

---

## Self-Review notes (addressed)

- **Spec coverage:** Design direction/colors/fonts (Tasks 2, 10), photo bands (Tasks 3, 10), multi-page routes (Task 8), passcode gate (Task 9), per-event RSVP + Georgia mains (Tasks 14–16), Supabase store + RLS (Task 17), email webhook (Task 18), EN/FA + RTL + Jalali (Tasks 4–6, 21), hotels pre-filled (Tasks 7, 12), TBD states (Task 11), Vercel + DNS + Resend (Tasks 19–20). All spec sections mapped.
- **Type consistency:** `RsvpDraft`, `EventKey`, `GuestDraft` defined in `rsvp.ts` (Task 14) and reused in `rsvpSubmit.ts` (Task 15) and `Rsvp.tsx` (Task 16). `EventInfo.key` union matches `EventKey`. `formatEventDate(iso, locale)` signature consistent across helper (Task 4) and EventCard (Task 11). Row shapes in `rsvpSubmit.ts` match `schema.sql` columns (Task 17).
- **Placeholder scan:** Content placeholders (Georgia menu, passcode value, Farsi prose) are intentional and flagged for the couple; no unfilled *code* steps.
