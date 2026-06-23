import { describe, it, expect } from 'vitest';
import { formatEventDate, toPersianDigits } from './dateFormat';

describe('toPersianDigits', () => {
  it('converts ASCII digits to Persian', () => {
    expect(toPersianDigits('2026')).toBe('۲۰۲۶');
  });
});

describe('formatEventDate', () => {
  const iso = '2026-10-06';
  it('formats Gregorian for en', () => {
    expect(formatEventDate(iso, 'en')).toBe('October 6, 2026');
  });
  it('formats Jalali with Persian digits for fa', () => {
    // 2026-10-06 Gregorian === 14 Mehr 1405 Jalali
    expect(formatEventDate(iso, 'fa')).toBe('۱۴ مهر ۱۴۰۵');
  });
});
