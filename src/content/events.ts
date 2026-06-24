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
  tbd?: boolean;
}

export const EVENTS: EventInfo[] = [
  {
    key: 'georgia',
    titleEn: 'Georgia Celebration', titleFa: 'جشن جورجیا',
    date: null, time: '12:00 PM ceremony · 2:00 PM dinner',
    venueEn: "Mac's Chophouse", venueFa: 'مکس چاپ‌هاوس',
    locationEn: 'Marietta, GA', locationFa: 'ماریتا، جورجیا',
    tbd: true,
  },
  {
    key: 'turkey_rehearsal',
    titleEn: 'Rehearsal Dinner', titleFa: 'شام تمرین',
    date: '2026-10-05', time: null,
    venueEn: 'Liberty Lykia Resort', venueFa: 'اقامتگاه لیبرتی لیکیا',
    locationEn: 'Ölüdeniz, Türkiye', locationFa: 'اولودنیز، ترکیه',
  },
  {
    key: 'turkey_wedding',
    titleEn: 'Wedding & Reception', titleFa: 'مراسم عروسی و پذیرایی',
    date: '2026-10-06', time: '5:30 PM',
    venueEn: 'Liberty Lykia Resort', venueFa: 'اقامتگاه لیبرتی لیکیا',
    locationEn: 'Ölüdeniz, Türkiye', locationFa: 'اولودنیز، ترکیه',
  },
];
