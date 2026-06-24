import { useLocale } from '../locale/useLocale';
import { Flag } from './Flag';

export function Nav() {
  const { locale, setLocale } = useLocale();
  const focus = 'focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2';
  const flag = (active: boolean) =>
    `h-4 w-auto rounded-[2px] ring-1 transition ${active ? 'opacity-100 ring-gold-soft' : 'opacity-45 ring-transparent hover:opacity-80'}`;
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between bg-cobalt-deep/95 px-4 py-3 backdrop-blur border-b border-gold-soft/25">
      <span className="font-crest tracking-[0.25em] text-gold-soft text-sm">N · M</span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label="English" aria-pressed={locale === 'en'} onClick={() => setLocale('en')} className={focus}>
          <Flag country="us" className={flag(locale === 'en')} />
        </button>
        <button type="button" aria-label="فارسی" aria-pressed={locale === 'fa'} onClick={() => setLocale('fa')} className={focus}>
          <Flag country="ir" className={flag(locale === 'fa')} />
        </button>
      </span>
    </nav>
  );
}
