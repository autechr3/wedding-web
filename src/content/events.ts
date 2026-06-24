export interface EventInfo {
  key: 'georgia' | 'turkey_rehearsal' | 'turkey_wedding';
  titleEn: string;
  titleFa: string;
  date: string | null;     // ISO Gregorian, null when TBD
  time: string | null;
  venueEn: string;
  venueFa: string;
  locationEn: string;
  locationFa: string;
  dressEn?: string;
  dressFa?: string;
  rsvpByEn?: string;
  rsvpByFa?: string;
  kids?: boolean;          // true → "Children are welcome"
  scheduleEn?: string[];   // wedding-day timeline lines (EN)
  scheduleFa?: string[];   // wedding-day timeline lines (FA)
  noteEn?: string;         // extra note, e.g. no-gifts
  noteFa?: string;
  tbd?: boolean;
}

export const EVENTS: EventInfo[] = [
  {
    key: 'georgia',
    titleEn: 'Georgia Celebration', titleFa: 'جشن جورجیا',
    date: null, time: '12:30 PM – 3:30 PM',
    venueEn: "Mac's Chophouse", venueFa: 'مکس چاپ‌هاوس',
    locationEn: 'Marietta, GA', locationFa: 'ماریتا، جورجیا',
    dressEn: 'Day Cocktail', dressFa: 'کوکتل روزانه',
    rsvpByEn: 'Kindly RSVP by September 9, 2026', rsvpByFa: 'لطفاً تا ۱۸ شهریور ۱۴۰۵ پاسخ دهید',
    kids: true,
    tbd: true,
  },
  {
    key: 'turkey_rehearsal',
    titleEn: 'Rehearsal Dinner', titleFa: 'شام تمرین',
    date: '2026-10-05', time: '6:00 PM',
    venueEn: 'Balbura Italian Restaurant · Liberty Lykia Resort',
    venueFa: 'رستوران ایتالیایی بالبورا · اقامتگاه لیبرتی لیکیا',
    locationEn: 'Ölüdeniz, Türkiye', locationFa: 'اولودنیز، ترکیه',
    dressEn: 'Beach Cocktail', dressFa: 'کوکتل ساحلی',
    rsvpByEn: 'Kindly RSVP by August 1, 2026', rsvpByFa: 'لطفاً تا ۱۰ مرداد ۱۴۰۵ پاسخ دهید',
    kids: true,
  },
  {
    key: 'turkey_wedding',
    titleEn: 'Wedding & Reception', titleFa: 'مراسم عروسی و پذیرایی',
    date: '2026-10-06', time: '5:30 PM',
    venueEn: 'Liberty Lykia Resort', venueFa: 'اقامتگاه لیبرتی لیکیا',
    locationEn: 'Ölüdeniz, Türkiye', locationFa: 'اولودنیز، ترکیه',
    dressEn: 'Beach Formal', dressFa: 'رسمی ساحلی',
    rsvpByEn: 'Kindly RSVP by August 1, 2026', rsvpByFa: 'لطفاً تا ۱۰ مرداد ۱۴۰۵ پاسخ دهید',
    kids: true,
    scheduleEn: [
      '5:30 PM — Ceremony begins',
      '6:00–7:00 PM — Cocktails & photos',
      '7:00 PM — Dinner',
      '8:30 PM — Speeches',
      '9:00 PM–12:00 AM — Dancing & party',
    ],
    scheduleFa: [
      '۵:۳۰ بعدازظهر — آغاز مراسم',
      '۶:۰۰–۷:۰۰ بعدازظهر — کوکتل و عکاسی',
      '۷:۰۰ بعدازظهر — شام',
      '۸:۳۰ شب — سخنرانی‌ها',
      '۹:۰۰ شب تا ۱۲:۰۰ بامداد — رقص و جشن',
    ],
    noteEn: 'No gifts, please — your presence is our gift.',
    noteFa: 'هدیه لازم نیست — حضور شما هدیهٔ ماست.',
  },
];
