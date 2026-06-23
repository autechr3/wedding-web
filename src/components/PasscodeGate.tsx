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
