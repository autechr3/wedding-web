import { useLocale } from '../locale/useLocale';
import type { Hotel } from '../content/hotels';

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const { locale } = useLocale();
  const name = locale === 'fa' ? hotel.nameFa : hotel.nameEn;
  const desc = locale === 'fa' ? hotel.descFa : hotel.descEn;
  const distance = locale === 'fa' ? hotel.distanceFa : hotel.distanceEn;
  return (
    <a href={hotel.url} target="_blank" rel="noreferrer" className="block border border-gold-soft/35 p-5 bg-white/5 hover:border-gold-soft transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2">
      <div className="flex justify-between items-baseline gap-3">
        <h3 className="font-serif text-xl text-cream">{name}</h3>
        <span className="text-gold-soft text-xs shrink-0">{hotel.tier}</span>
      </div>
      <p className="text-cream/80 text-sm mt-1">{desc}</p>
      <p className="text-gold-soft/80 text-xs mt-2">{distance}</p>
    </a>
  );
}
