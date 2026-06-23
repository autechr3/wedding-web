import { useTranslation } from 'react-i18next';
import { HOTELS } from '../../content/hotels';
import { HotelCard } from '../HotelCard';

export function TravelInfo() {
  const { t } = useTranslation();
  return (
    <div className="mt-6 space-y-4 text-start">
      <ul className="space-y-2 text-cream/80 text-sm">
        <li>✈️ {t('travel.airport')}</li>
        <li>👗 {t('travel.dress')}</li>
        <li>🎟️ {t('travel.dayPass')}</li>
      </ul>
      <div>
        <h4 className="font-serif text-lg text-cream mb-3">{t('travel.whereToStay')}</h4>
        <div className="space-y-3">
          {HOTELS.map((h) => <HotelCard key={h.nameEn} hotel={h} />)}
        </div>
      </div>
    </div>
  );
}
