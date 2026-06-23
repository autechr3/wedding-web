import { EVENTS } from '../content/events';
import { EventCard } from '../components/EventCard';
import { useLocale } from '../locale/useLocale';

export default function Events() {
  const { locale } = useLocale();
  const heading = locale === 'fa' ? 'جشن‌ها' : 'Celebrations';
  const kicker = locale === 'fa' ? 'برنامه‌ی ما' : 'Our Itinerary';

  return (
    <div
      data-testid="page-events"
      className="mx-auto max-w-2xl space-y-4 px-5 py-10 text-start"
    >
      <header className="mb-8 text-center">
        <p className="font-crest text-[10px] uppercase tracking-[0.3em] text-gold-soft">
          {kicker}
        </p>
        <h2 className="mt-2 font-serif text-4xl text-cream">{heading}</h2>
      </header>
      {EVENTS.map((e) => (
        <EventCard key={e.key} event={e} />
      ))}
    </div>
  );
}
