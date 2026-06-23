import type { PhotoSet } from '../assets/photos';

interface PhotoBandProps {
  photo: PhotoSet;
  alt: string;
  heightClass?: string;
  loading?: 'lazy' | 'eager';
}

export function PhotoBand({
  photo,
  alt,
  heightClass = 'h-72 md:h-96',
  loading = 'lazy',
}: PhotoBandProps) {
  return (
    <img
      src={photo.w1400}
      srcSet={`${photo.w800} 800w, ${photo.w1400} 1400w, ${photo.w2000} 2000w`}
      sizes="100vw"
      alt={alt}
      loading={loading}
      className={`w-full ${heightClass} object-cover`}
    />
  );
}
