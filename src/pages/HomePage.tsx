import { useTranslation } from 'react-i18next';
import { Hero } from '../components/Hero';
import { EventSection } from '../components/sections/EventSection';
import { TravelInfo } from '../components/sections/TravelInfo';
import { RsvpSection } from '../components/sections/RsvpSection';
import { Divider } from '../components/Divider';
import { EVENTS } from '../content/events';
import { PhotoBand } from '../components/PhotoBand';
import { PHOTOS } from '../assets/photos';

export default function HomePage() {
  const { t } = useTranslation();
  const georgia = EVENTS.find((e) => e.key === 'georgia')!;
  const rehearsal = EVENTS.find((e) => e.key === 'turkey_rehearsal')!;
  const wedding = EVENTS.find((e) => e.key === 'turkey_wedding')!;
  return (
    <div data-testid="page-home">
      <Hero />
      <h2 className="font-serif text-3xl sm:text-4xl text-gold-soft tracking-wide text-center pt-14 pb-1">
        {t('events.sectionTitle')}
      </h2>
      <EventSection event={georgia} id="georgia" />
      <EventSection event={rehearsal} id="rehearsal" />
      <div className="border-y-2 border-gold-soft">
        <PhotoBand
          photo={PHOTOS.kiss}
          alt="Negar and Matt sharing a kiss"
          heightClass="h-[24rem] md:h-[30rem]"
          objectPosition="center 30%"
          loading="lazy"
        />
      </div>
      <EventSection event={wedding} id="wedding">
        <TravelInfo />
      </EventSection>
      <Divider />
      <RsvpSection />
    </div>
  );
}
