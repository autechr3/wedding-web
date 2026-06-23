import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocaleProvider } from '../locale/LocaleProvider';
import '../i18n';
import Rsvp from './Rsvp';

describe('Rsvp', () => {
  beforeEach(() => { localStorage.clear(); });
  it('shows validation errors on empty submit', () => {
    render(<LocaleProvider><Rsvp /></LocaleProvider>);
    fireEvent.click(screen.getByText(/Send RSVP/i));
    expect(screen.getByText(/Name is required/)).toBeInTheDocument();
    expect(screen.getByText(/RSVP to at least one event/)).toBeInTheDocument();
  });

  it('requires a main course for each guest when attending the Georgia dinner', () => {
    render(<LocaleProvider><Rsvp /></LocaleProvider>);
    fireEvent.change(screen.getByRole('textbox', { name: /Full name/i }), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Email/i }), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Georgia/i }));
    // Leave the guest's main course empty, then submit.
    fireEvent.click(screen.getByRole('button', { name: /Send RSVP/i }));
    expect(
      screen.getByText(/choose a main course for each guest/i),
    ).toBeInTheDocument();
  });
});
