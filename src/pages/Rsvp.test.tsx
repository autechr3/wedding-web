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
});
