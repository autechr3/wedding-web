import dayjs from 'dayjs';
import jalaliday from 'jalaliday';

dayjs.extend(jalaliday);

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const FA_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export type Locale = 'en' | 'fa';

export function formatEventDate(iso: string, locale: Locale): string {
  const d = dayjs(iso);
  if (locale === 'fa') {
    const j = d.calendar('jalali');
    const day = toPersianDigits(j.date());
    const month = FA_MONTHS[j.month()];
    const year = toPersianDigits(j.year());
    return `${day} ${month} ${year}`;
  }
  return d.format('MMMM D, YYYY');
}
