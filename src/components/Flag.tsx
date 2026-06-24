type Country = 'us' | 'ir';

/**
 * Renders a country flag from a bundled SVG. We use real artwork (not emoji)
 * because Windows ships no flag-emoji glyphs — browsers there render 🇺🇸 / 🇮🇷
 * as the bare letters "US" / "IR".
 */
export function Flag({
  country,
  className,
  alt = '',
}: {
  country: Country;
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={`/flags/${country}.svg`}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}
