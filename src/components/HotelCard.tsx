import { useTranslation } from 'react-i18next';
import { useLocale } from '../locale/useLocale';
import type { Hotel } from '../content/hotels';

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const name = locale === 'fa' ? hotel.nameFa : hotel.nameEn;
  const desc = locale === 'fa' ? hotel.descFa : hotel.descEn;
  return (
    <a href={hotel.url} target="_blank" rel="noreferrer" className="block border border-gold-soft/35 p-5 bg-white/5 hover:border-gold-soft transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2">
      <div className="flex justify-between items-baseline gap-3">
        <h5 className="font-serif text-xl text-cream">{name}</h5>
        {hotel.host && <span className="text-gold-soft text-[10px] uppercase tracking-[0.2em] shrink-0">{t('travel.host')}</span>}
      </div>
      <p className="text-cream/80 text-sm mt-1">{desc}</p>
    </a>
  );
}
