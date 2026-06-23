import type { ReactNode } from 'react';
import { useLocale } from '../../locale/useLocale';
import { useTranslation } from 'react-i18next';
import { formatEventDate } from '../../lib/dateFormat';
import type { EventInfo } from '../../content/events';

export function EventSection({ event, id, children }: { event: EventInfo; id?: string; children?: ReactNode }) {
  const { locale } = useLocale();
  const { t } = useTranslation();
  const title = locale === 'fa' ? event.titleFa : event.titleEn;
  const venue = locale === 'fa' ? event.venueFa : event.venueEn;
  const location = locale === 'fa' ? event.locationFa : event.locationEn;
  const dateLabel = event.date ? formatEventDate(event.date, locale) : t('events.dateComingSoon');
  return (
    <section id={id} className="max-w-2xl mx-auto px-5 py-12 text-start">
      <div className="font-crest text-[9px] tracking-[0.25em] uppercase text-gold-soft">
        <span>{dateLabel}</span>{event.time ? ` · ${event.time}` : ''}
      </div>
      <h3 className="font-serif text-3xl text-cream mt-1">{title}</h3>
      <p className="text-cream/80 text-sm mt-1">{venue} · {location}</p>
      {event.tbd && <p className="text-gold-soft/80 italic text-xs mt-2">{t('events.moreDetails')}</p>}
      {children}
    </section>
  );
}
