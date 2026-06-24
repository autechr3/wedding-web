import type { PhotoSet } from '../assets/photos';

interface PhotoBandProps {
  photo: PhotoSet;
  alt: string;
  heightClass?: string;
  /** CSS object-position focal point for the crop, e.g. "top" or "center". */
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  /**
   * When true, show the whole photo full-width at its natural aspect ratio
   * (no cropping). Otherwise it's a full-bleed band cropped to `heightClass`.
   */
  contain?: boolean;
}

export function PhotoBand({
  photo,
  alt,
  heightClass = 'h-72 md:h-96',
  objectPosition = 'center',
  loading = 'lazy',
  contain = false,
}: PhotoBandProps) {
  const srcSet = `${photo.w800} 800w, ${photo.w1400} 1400w, ${photo.w2000} 2000w`;

  if (contain) {
    return (
      <img
        src={photo.w1400}
        srcSet={srcSet}
        sizes="100vw"
        alt={alt}
        loading={loading}
        className="block w-full h-auto"
      />
    );
  }

  return (
    <img
      src={photo.w1400}
      srcSet={srcSet}
      sizes="100vw"
      alt={alt}
      loading={loading}
      style={{ objectPosition }}
      className={`block w-full ${heightClass} object-cover`}
    />
  );
}
