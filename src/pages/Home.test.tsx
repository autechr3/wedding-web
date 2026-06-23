import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../i18n';
import Home from './Home';

describe('Home', () => {
  it('renders the hero names and RSVP CTA', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByText('Negar')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /rsvp/i })).toHaveAttribute('href', '/rsvp');
  });
});
