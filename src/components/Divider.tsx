/**
 * Decorative section divider: a hollow gold diamond flanked by two small solid
 * diamonds, with hairlines that fade to transparent at each end. Pure CSS shapes
 * (no glyphs) so it renders identically everywhere.
 */
export function Divider() {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="mx-auto flex max-w-2xl items-center justify-center gap-3 px-6 py-10"
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-soft/55" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold-soft/60" />
      <span className="h-3 w-3 rotate-45 border border-gold-soft" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold-soft/60" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-soft/55" />
    </div>
  );
}
