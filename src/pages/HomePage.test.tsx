import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../i18n';
import { LocaleProvider } from '../locale/LocaleProvider';
import HomePage from './HomePage';

describe('HomePage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('renders hero, all three events, hotels, and the rsvp form', () => {
    render(<MemoryRouter><LocaleProvider><HomePage /></LocaleProvider></MemoryRouter>);
    expect(screen.getAllByText('Negar').length).toBeGreaterThan(0);  // hero name
    // titles appear in both the EventSection headings and the RSVP event checkboxes
    expect(screen.getAllByText('Georgia Celebration').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rehearsal Dinner').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Wedding & Reception').length).toBeGreaterThan(0);
    // Liberty Lykia is the host hotel + the venue of two events, so it appears multiple times
    expect(screen.getAllByText(/Liberty Lykia Resort/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Morina Deluxe Hotel/)).toBeInTheDocument();
    expect(screen.getByText(/Hotel Karbel Sun/)).toBeInTheDocument();
    expect(screen.getByTestId('page-rsvp')).toBeInTheDocument();
  });
});
