export interface Hotel {
  nameEn: string; nameFa: string;
  descEn: string; descFa: string;
  distanceEn: string; distanceFa: string;
  tier: '$$$' | '$$$$' | '$$$$$';
  url: string;
}

// NOTE: verify availability/details before launch.
export const HOTELS: Hotel[] = [
  { nameEn: 'Liberty Lykia – Adults Only', nameFa: 'لیبرتی لیکیا (بزرگسالان)', descEn: 'Connected adults-only sister property to the main resort.', descFa: 'بخش مخصوص بزرگسالان، متصل به اقامتگاه اصلی.', distanceEn: 'On resort', distanceFa: 'در محل اقامتگاه', tier: '$$$$$', url: 'https://www.libertyhotels.com/' },
  { nameEn: 'Sundia by Liberty Ölüdeniz', nameFa: 'سوندیا بای لیبرتی', descEn: 'Liberty property with a Michelin-recommended seafront restaurant.', descFa: 'متعلق به مجموعه لیبرتی با رستوران ساحلی.', distanceEn: 'Ölüdeniz', distanceFa: 'اولودنیز', tier: '$$$$', url: 'https://www.libertyhotels.com/' },
  { nameEn: 'Beyaz Yunus Hotel (Adults Only)', nameFa: 'بیاض یونس', descEn: 'Highly rated adults-only boutique near the beach.', descFa: 'بوتیک‌هتل مخصوص بزرگسالان نزدیک ساحل.', distanceEn: '~1.3 mi from resort', distanceFa: '≈۲ کیلومتر', tier: '$$$$', url: 'https://www.tripadvisor.com/' },
  { nameEn: 'Ecclesia Boutique Hotel (Adults Only)', nameFa: 'اکلسیا بوتیک', descEn: 'Top-rated adults-only boutique hotel.', descFa: 'بوتیک‌هتل برتر مخصوص بزرگسالان.', distanceEn: '~1.5 mi from resort', distanceFa: '≈۲٫۵ کیلومتر', tier: '$$$$', url: 'https://www.tripadvisor.com/' },
  { nameEn: 'Belcekum Beach Hotel', nameFa: 'بلجکوم بیچ', descEn: 'Beachfront hotel with a private beach.', descFa: 'هتل ساحلی با ساحل اختصاصی.', distanceEn: '~1.5 mi from resort', distanceFa: '≈۲٫۵ کیلومتر', tier: '$$$', url: 'https://www.tripadvisor.com/' },
  { nameEn: 'Garcia Resort & Spa', nameFa: 'گارسیا ریزورت و اسپا', descEn: 'Ölüdeniz beachfront resort & spa.', descFa: 'اقامتگاه و اسپای ساحلی اولودنیز.', distanceEn: 'Ölüdeniz', distanceFa: 'اولودنیز', tier: '$$$', url: 'https://www.tripadvisor.com/' },
];
