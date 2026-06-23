export interface Hotel {
  nameEn: string; nameFa: string;
  descEn: string; descFa: string;
  host?: boolean;
  url: string;
}

// NOTE: the two non-host hotels are placeholders — verify details/links before launch.
export const HOTELS: Hotel[] = [
  {
    nameEn: 'Liberty Lykia Resort', nameFa: 'اقامتگاه لیبرتی لیکیا',
    descEn: 'Our host resort — where the ceremony and reception take place.',
    descFa: 'اقامتگاه میزبان ما — محل برگزاری مراسم و پذیرایی.',
    host: true,
    url: 'https://www.libertyhotels.com/',
  },
  {
    nameEn: 'Morina Deluxe Hotel', nameFa: 'هتل مورینا دلوکس',
    descEn: 'A nearby option in Ölüdeniz for guests staying off-resort.',
    descFa: 'گزینه‌ای نزدیک در اولودنیز برای مهمانانی که خارج از اقامتگاه می‌مانند.',
    url: 'https://www.google.com/search?q=Morina+Deluxe+Hotel+Oludeniz',
  },
  {
    nameEn: 'Hotel Karbel Sun', nameFa: 'هتل کاربل سان',
    descEn: 'A nearby option in Ölüdeniz for guests staying off-resort.',
    descFa: 'گزینه‌ای نزدیک در اولودنیز برای مهمانانی که خارج از اقامتگاه می‌مانند.',
    url: 'https://www.google.com/search?q=Hotel+Karbel+Sun+Oludeniz',
  },
];
