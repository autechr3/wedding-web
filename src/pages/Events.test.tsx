import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../i18n';
import { LocaleProvider } from '../locale/LocaleProvider';
import Events from './Events';

describe('Events', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all events and a coming-soon for TBD', () => {
    render(
      <LocaleProvider>
        <Events />
      </LocaleProvider>,
    );
    expect(screen.getByText('Wedding & Reception')).toBeInTheDocument();
    expect(screen.getAllByText('More details to come').length).toBeGreaterThan(0);
    expect(screen.getByText('Date coming soon')).toBeInTheDocument();
  });
});
