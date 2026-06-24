import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEY } from '../i18n';
import type { Locale } from '../lib/dateFormat';
import { useLocale } from '../locale/useLocale';
import { Flag } from './Flag';

export const UNLOCK_KEY = 'nm-unlocked';

const Crest = () => (
  <div className="font-crest tracking-[0.3em] text-gold-soft text-sm" aria-label="N · M">N · M</div>
);

/** First entry step: pick a language via large flag tiles. */
function LanguageChoice({ onChoose }: { onChoose: (l: Locale) => void }) {
  const tile =
    'group flex flex-col items-center gap-3 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-4';
  const frame =
    'block w-36 sm:w-44 aspect-[3/2] overflow-hidden border border-gold-soft/40 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition duration-300 group-hover:border-gold-soft group-hover:-translate-y-1';
  return (
    <div className="nm-fade-in text-center">
      <Crest />
      <p className="mt-6 font-serif text-cream/70 tracking-[0.15em] text-sm leading-relaxed">
        Select your language
        <span className="block font-fa text-cream/55 mt-1" dir="rtl">زبان خود را انتخاب کنید</span>
      </p>
      <div className="mt-9 flex items-start justify-center gap-8 sm:gap-12">
        <button type="button" className={tile} onClick={() => onChoose('en')}>
          <span className={frame}><Flag country="us" className="h-full w-full object-cover" /></span>
          <span className="font-serif text-lg tracking-wide text-cream transition-colors group-hover:text-gold-soft">English</span>
        </button>
        <button type="button" className={tile} onClick={() => onChoose('fa')}>
          <span className={frame}><Flag country="ir" className="h-full w-full object-cover" /></span>
          <span className="font-fa text-lg text-cream transition-colors group-hover:text-gold-soft" dir="rtl">فارسی</span>
        </button>
      </div>
    </div>
  );
}

/** Second entry step: the shared passcode from the invitation. */
function PasscodeForm({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const expected = import.meta.env.VITE_SITE_PASSCODE;
    if (expected && value.trim() === expected) onUnlock();
    else setError(true);
  }

  return (
    <form onSubmit={submit} className="nm-fade-in text-center max-w-sm w-full">
      <Crest />
      <label htmlFor="pc" className="mt-6 block font-serif text-xl mb-4">{t('passcode.prompt')}</label>
      <input
        id="pc"
        value={value}
        autoComplete="off"
        onChange={(e) => { setValue(e.target.value); setError(false); }}
        placeholder={t('passcode.placeholder')}
        className="w-full bg-transparent border border-gold-soft/50 px-4 py-3 text-center tracking-widest focus:outline-none focus:border-gold-soft"
      />
      {error && <p role="alert" className="text-gold-soft text-sm mt-3">{t('passcode.error')}</p>}
      <button type="submit" className="mt-5 border border-gold text-gold-soft px-8 py-3 text-xs uppercase tracking-[0.25em] hover:bg-gold/10">{t('passcode.submit')}</button>
    </form>
  );
}

export function PasscodeGate({ children }: { children: ReactNode }) {
  const { setLocale } = useLocale();
  const [chosen, setChosen] = useState(() => localStorage.getItem(STORAGE_KEY) != null);
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(UNLOCK_KEY) === '1');

  const gated = !unlocked;

  // While the gate covers the screen, lock body scroll. The page is mounted
  // behind it (so fonts + the hero image preload), but must not scroll or be
  // reachable by keyboard until revealed.
  useEffect(() => {
    if (!gated) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [gated]);

  function choose(l: Locale) {
    setLocale(l);
    setChosen(true);
  }

  function unlock() {
    localStorage.setItem(UNLOCK_KEY, '1');
    setUnlocked(true);
  }

  return (
    <>
      <div className={gated ? 'opacity-0' : 'nm-reveal'} inert={gated} aria-hidden={gated || undefined}>
        {children}
      </div>
      {gated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-cobalt p-6 text-cream">
          {chosen ? <PasscodeForm onUnlock={unlock} /> : <LanguageChoice onChoose={choose} />}
        </div>
      )}
    </>
  );
}
