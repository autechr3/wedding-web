import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../i18n';
import { LocaleProvider } from '../locale/LocaleProvider';
import Travel from './Travel';

describe('Travel', () => {
  beforeEach(() => { localStorage.clear(); });
  it('lists hotels', () => {
    render(<LocaleProvider><Travel /></LocaleProvider>);
    expect(screen.getByText(/Liberty Lykia – Adults Only/)).toBeInTheDocument();
    expect(screen.getByText(/Sundia by Liberty/)).toBeInTheDocument();
  });
});
