import { useTranslation } from 'react-i18next';
import { PHOTOS } from '../assets/photos';

export function Hero() {
  const { t } = useTranslation();
  const bg = PHOTOS.boardwalk;
  return (
    <section className="relative overflow-hidden text-cream text-center px-6 py-16 min-h-[calc(100svh-3rem)] flex items-center justify-center">
      <img
        src={bg.w1400}
        srcSet={`${bg.w800} 800w, ${bg.w1400} 1400w, ${bg.w2000} 2000w`}
        sizes="100vw"
        alt="Negar and Matt"
        loading="eager"
        fetchPriority="high"
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
        <p className="font-serif tracking-[0.22em] uppercase text-[11px] md:text-xs text-cream/90 mt-7">
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
