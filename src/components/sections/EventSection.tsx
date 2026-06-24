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
  const dress = locale === 'fa' ? event.dressFa : event.dressEn;
  const rsvpBy = locale === 'fa' ? event.rsvpByFa : event.rsvpByEn;
  const schedule = locale === 'fa' ? event.scheduleFa : event.scheduleEn;
  const note = locale === 'fa' ? event.noteFa : event.noteEn;
  return (
    <section id={id} className="max-w-2xl mx-auto px-5 py-12 text-start">
      <div className="font-crest text-[9px] tracking-[0.25em] uppercase text-gold-soft">
        <span>{dateLabel}</span>{event.time ? ` · ${event.time}` : ''}
      </div>
      <h3 className="font-serif text-3xl text-cream mt-1">{title}</h3>
      <p className="text-cream/80 text-sm mt-1">{venue} · {location}</p>
      {event.tbd && <p className="text-gold-soft/80 italic text-xs mt-2">{t('events.moreDetails')}</p>}

      {schedule && (
        <ul className="mt-4 space-y-1 text-cream/90 text-sm">
          {schedule.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      )}

      {(dress || event.kids || note || rsvpBy) && (
        <div className="mt-4 space-y-1 text-sm">
          {dress && <div className="flex gap-2"><span className="text-gold-soft">{t('events.dress')}</span><span className="text-cream/80">{dress}</span></div>}
          {event.kids && <p className="text-cream/80">{t('events.kids')}</p>}
          {note && <p className="text-cream/90 italic mt-1">{note}</p>}
          {rsvpBy && <p className="text-gold-soft/90 font-crest text-[11px] tracking-[0.12em] uppercase mt-2">{rsvpBy}</p>}
        </div>
      )}

      {children}
    </section>
  );
}
