import { useLocale } from '../locale/useLocale';

export function Nav() {
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
