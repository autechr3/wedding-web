import { Hero } from '../components/Hero';
import { StorySection } from '../components/sections/StorySection';
import { EventSection } from '../components/sections/EventSection';
import { TravelInfo } from '../components/sections/TravelInfo';
import { RsvpSection } from '../components/sections/RsvpSection';
import { EVENTS } from '../content/events';

export default function HomePage() {
  const georgia = EVENTS.find((e) => e.key === 'georgia')!;
  const rehearsal = EVENTS.find((e) => e.key === 'turkey_rehearsal')!;
  const wedding = EVENTS.find((e) => e.key === 'turkey_wedding')!;
  return (
    <div data-testid="page-home">
      <Hero />
      <StorySection />
      <EventSection event={georgia} id="georgia" />
      <EventSection event={rehearsal} id="rehearsal" />
      <EventSection event={wedding} id="wedding">
        <TravelInfo />
      </EventSection>
      <RsvpSection />
    </div>
  );
}
