import { useTranslation } from 'react-i18next';
import { Hero } from '../components/Hero';
import { PhotoBand } from '../components/PhotoBand';
import { PHOTOS } from '../assets/photos';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div data-testid="page-home">
      <Hero />
      <PhotoBand photo={PHOTOS.beachPortrait} alt={t('photos.beachPortrait')} loading="eager" />
    </div>
  );
}
