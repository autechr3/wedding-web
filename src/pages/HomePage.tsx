import { Hero } from '../components/Hero';
import { EventSection } from '../components/sections/EventSection';
import { TravelInfo } from '../components/sections/TravelInfo';
import { RsvpSection } from '../components/sections/RsvpSection';
import { EVENTS } from '../content/events';
import { PhotoBand } from '../components/PhotoBand';
import { PHOTOS } from '../assets/photos';

export default function HomePage() {
  const georgia = EVENTS.find((e) => e.key === 'georgia')!;
  const rehearsal = EVENTS.find((e) => e.key === 'turkey_rehearsal')!;
  const wedding = EVENTS.find((e) => e.key === 'turkey_wedding')!;
  return (
    <div data-testid="page-home">
      <Hero />
      <EventSection event={georgia} id="georgia" />
      <EventSection event={rehearsal} id="rehearsal" />
      <PhotoBand photo={PHOTOS.courtyard} alt="Negar and Matt" heightClass="h-[26rem] md:h-[34rem]" objectPosition="center 35%" loading="lazy" />
      <EventSection event={wedding} id="wedding">
        <TravelInfo />
      </EventSection>
      <RsvpSection />
    </div>
  );
}
