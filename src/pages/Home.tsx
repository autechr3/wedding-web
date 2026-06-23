import { Hero } from '../components/Hero';
import { PhotoBand } from '../components/PhotoBand';
import { PHOTOS } from '../assets/photos';

export default function Home() {
  return (
    <div data-testid="page-home">
      <Hero />
      <PhotoBand photo={PHOTOS.beachPortrait} alt="Negar and Matthew on the beach" />
    </div>
  );
}
