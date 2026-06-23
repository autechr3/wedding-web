import { useTranslation } from 'react-i18next';
import { useLocale } from '../locale/useLocale';
import { formatEventDate } from '../lib/dateFormat';
import type { EventInfo } from '../content/events';

export function EventCard({ event }: { event: EventInfo }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const title = locale === 'fa' ? event.titleFa : event.titleEn;
  const venue = locale === 'fa' ? event.venueFa : event.venueEn;
  const location = locale === 'fa' ? event.locationFa : event.locationEn;
  const dateLabel = event.date
    ? formatEventDate(event.date, locale)
    : t('events.dateComingSoon');

  return (
    <article className="border border-gold-soft/35 bg-white/5 p-6 text-start transition-colors hover:border-gold-soft/60">
      <div className="font-crest text-[9px] uppercase tracking-[0.2em] text-gold-soft">
        <span>{dateLabel}</span>
        {event.time ? <span>{` · ${event.time}`}</span> : null}
      </div>
      <h3 className="mt-1 font-serif text-2xl text-cream">{title}</h3>
      <p className="text-sm text-cream/80">
        {venue} · {location}
      </p>
      {event.tbd && (
        <p className="mt-2 text-xs italic text-gold-soft/80">
          {t('events.moreDetails')}
        </p>
      )}
    </article>
  );
}
