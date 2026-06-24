import { useTranslation } from 'react-i18next';
import { PhotoBand } from '../PhotoBand';
import { PHOTOS } from '../../assets/photos';

export function StorySection() {
  const { t } = useTranslation();
  return (
    <section id="story">
      <PhotoBand photo={PHOTOS.beachPortrait} alt={t('photos.beachPortrait')} loading="lazy" />
      <div className="max-w-2xl mx-auto px-5 py-12 text-center">
        <div className="font-crest text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-2">{t('story.kicker')}</div>
        <h2 className="font-serif text-3xl text-cream">{t('story.title')}</h2>
        <p className="text-cream/80 text-sm mt-3 leading-relaxed">{t('story.body')}</p>
      </div>
    </section>
  );
}
