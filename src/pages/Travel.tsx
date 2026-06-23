import { useTranslation } from 'react-i18next';
import { HOTELS } from '../content/hotels';
import { HotelCard } from '../components/HotelCard';

export default function Travel() {
  const { t } = useTranslation();
  return (
    <div data-testid="page-travel" className="max-w-2xl mx-auto px-5 py-10">
      <div className="text-center mb-8">
        <div className="font-crest text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-2">{t('travel.kicker')}</div>
        <h2 className="font-serif text-3xl text-cream">{t('travel.title')}</h2>
        <p className="text-cream/80 text-sm mt-3 leading-relaxed">{t('travel.intro')}</p>
      </div>
      <h3 className="font-serif text-xl text-cream mb-3">{t('travel.hotelsTitle')}</h3>
      <div className="space-y-4">
        {HOTELS.map((h) => <HotelCard key={h.nameEn} hotel={h} />)}
      </div>
      <p className="text-gold-soft/70 italic text-xs mt-3">{t('travel.verifyNote')}</p>
      <div className="mt-10 border-t border-gold-soft/20 pt-6">
        <h3 className="font-serif text-xl text-cream mb-2">{t('travel.dressTitle')}</h3>
        <p className="text-cream/80 text-sm leading-relaxed">{t('travel.dress')}</p>
      </div>
    </div>
  );
}
