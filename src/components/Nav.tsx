import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../locale/useLocale';

export function Nav() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const links: [string, string][] = [
    ['/', t('nav.home')], ['/events', t('nav.events')],
    ['/travel', t('nav.travel')], ['/rsvp', t('nav.rsvp')],
  ];
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between bg-cobalt-deep/95 px-4 py-3 backdrop-blur border-b border-gold-soft/25">
      <span className="font-crest tracking-[0.25em] text-gold-soft text-sm">N · M</span>
      <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider text-cream/90">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'text-gold-soft' : 'hover:text-gold-soft') + ' focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2'} end={to === '/'}>{label}</NavLink>
        ))}
        <span className="flex gap-2 text-base">
          <button type="button" aria-label="English" aria-pressed={locale === 'en'} onClick={() => setLocale('en')} className={(locale === 'en' ? 'opacity-100' : 'opacity-50') + ' focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2'}>🇺🇸</button>
          <button type="button" aria-label="فارسی" aria-pressed={locale === 'fa'} onClick={() => setLocale('fa')} className={(locale === 'fa' ? 'opacity-100' : 'opacity-50') + ' focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2'}>🇮🇷</button>
        </span>
      </div>
    </nav>
  );
}
