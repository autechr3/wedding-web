import { useTranslation } from 'react-i18next';
import { useLocale } from '../locale/useLocale';
import { FAQS } from '../content/faq';

export default function Faq() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  return (
    <div data-testid="page-faq" className="max-w-2xl mx-auto px-5 py-10">
      <div className="text-center mb-8">
        <div className="font-crest text-[10px] tracking-[0.3em] uppercase text-gold-soft mb-2">
          {t('faq.kicker')}
        </div>
        <h2 className="font-serif text-3xl text-cream">
          {t('faq.title')}
        </h2>
      </div>
      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <details key={i} className="border border-gold-soft/35 p-4 bg-white/5 group">
            <summary className="font-serif text-lg text-cream cursor-pointer marker:text-gold-soft text-start">
              {locale === 'fa' ? f.qFa : f.qEn}
            </summary>
            <p className="text-cream/80 text-sm mt-2 leading-relaxed text-start">
              {locale === 'fa' ? f.aFa : f.aEn}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
