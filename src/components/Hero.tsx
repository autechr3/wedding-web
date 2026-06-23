import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden bg-cobalt text-cream text-center px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-3 md:inset-5 border border-gold-soft/40" />
      <div className="pointer-events-none absolute inset-4 md:inset-6 border border-gold-soft/15" />
      <div className="relative mx-auto max-w-2xl">
        <div
          className="font-crest tracking-[0.45em] text-gold-soft text-xs md:text-sm"
          aria-label="N · M"
        >
          <span aria-hidden="true">N</span>
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span aria-hidden="true">M</span>
        </div>
        <p className="font-serif text-cream/75 tracking-[0.25em] uppercase text-[11px] md:text-xs mt-5">
          {t('hero.celebration')}
        </p>
        <h1 className="font-script text-cream leading-[0.85] text-7xl md:text-9xl mt-6">
          <span className="block">Negar</span>
          <span className="block font-script text-gold-soft text-5xl md:text-6xl my-1 md:my-2">
            {t('hero.and')}
          </span>
          <span className="block">Matthew</span>
        </h1>
        <div className="mx-auto mt-9 h-px w-20 bg-gold-soft/50" />
        <p className="font-serif tracking-[0.22em] uppercase text-[11px] md:text-xs text-cream/90 mt-7 leading-loose">
          {t('hero.date')}
          <br />
          {t('hero.venue')}
        </p>
        <Link
          to="/rsvp"
          className="inline-block mt-10 border border-gold text-gold-soft px-12 py-3.5 text-[10px] md:text-[11px] uppercase tracking-[0.35em] hover:bg-gold/10 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2"
        >
          {t('hero.cta')}
        </Link>
      </div>
    </section>
  );
}
