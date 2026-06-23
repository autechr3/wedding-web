import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../../i18n';
import { LocaleProvider } from '../../locale/LocaleProvider';
import { EventSection } from './EventSection';
import { EVENTS } from '../../content/events';

const wedding = EVENTS.find((e) => e.key === 'turkey_wedding')!;
const georgia = EVENTS.find((e) => e.key === 'georgia')!;

describe('EventSection', () => {
  beforeEach(() => { localStorage.clear(); });

  it('renders an event title and formatted date', () => {
    render(<LocaleProvider><EventSection event={wedding} /></LocaleProvider>);
    expect(screen.getByText('Wedding & Reception')).toBeInTheDocument();
    expect(screen.getByText(/October 6, 2026/)).toBeInTheDocument();
  });

  it('shows a coming-soon date for a TBD event', () => {
    render(<LocaleProvider><EventSection event={georgia} /></LocaleProvider>);
    expect(screen.getByText('Date coming soon')).toBeInTheDocument();
  });

  it('renders extra content passed as children', () => {
    render(<LocaleProvider><EventSection event={wedding}><div data-testid="extra" /></EventSection></LocaleProvider>);
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });
});
