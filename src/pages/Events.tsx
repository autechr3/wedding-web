import { useTranslation } from 'react-i18next';
import { EVENTS } from '../content/events';
import { EventCard } from '../components/EventCard';

export default function Events() {
  const { t } = useTranslation();

  return (
    <div
      data-testid="page-events"
      className="mx-auto max-w-2xl space-y-4 px-5 py-10 text-start"
    >
      <header className="mb-8 text-center">
        <p className="font-crest text-[10px] uppercase tracking-[0.3em] text-gold-soft">
          {t('events.kicker')}
        </p>
        <h2 className="mt-2 font-serif text-4xl text-cream">{t('events.title')}</h2>
      </header>
      {EVENTS.map((e) => (
        <EventCard key={e.key} event={e} />
      ))}
    </div>
  );
}
