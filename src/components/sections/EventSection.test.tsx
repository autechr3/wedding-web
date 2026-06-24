import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../../i18n';
import { LocaleProvider } from '../../locale/LocaleProvider';
import { EventSection } from './EventSection';
import { EVENTS, type EventInfo } from '../../content/events';

const wedding = EVENTS.find((e) => e.key === 'turkey_wedding')!;

describe('EventSection', () => {
  beforeEach(() => { localStorage.clear(); });

  it('renders an event title and formatted date', () => {
    render(<LocaleProvider><EventSection event={wedding} /></LocaleProvider>);
    expect(screen.getByText(wedding.titleEn)).toBeInTheDocument();
    expect(screen.getByText(/October 6, 2026/)).toBeInTheDocument();
  });

  it('shows a coming-soon date when an event has no date', () => {
    const tbdEvent: EventInfo = { ...wedding, date: null, scheduleEn: undefined, scheduleFa: undefined };
    render(<LocaleProvider><EventSection event={tbdEvent} /></LocaleProvider>);
    expect(screen.getByText('Date coming soon')).toBeInTheDocument();
  });

  it('renders extra content passed as children', () => {
    render(<LocaleProvider><EventSection event={wedding}><div data-testid="extra" /></EventSection></LocaleProvider>);
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });

  it('renders dress code, kids-welcome, rsvp-by, and a wedding timeline', () => {
    render(<LocaleProvider><EventSection event={wedding} /></LocaleProvider>);
    expect(screen.getByText(/Beach Formal/)).toBeInTheDocument();
    expect(screen.getByText(/Children are welcome/)).toBeInTheDocument();
    expect(screen.getByText(/Kindly RSVP by August 1, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Ceremony begins/)).toBeInTheDocument();
    expect(screen.getByText(/your presence is our gift/)).toBeInTheDocument();
  });
});
