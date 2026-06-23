import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocaleProvider } from '../locale/LocaleProvider';
import '../i18n';
import Faq from './Faq';

describe('Faq', () => {
  beforeEach(() => { localStorage.clear(); });
  it('renders questions', () => {
    render(<LocaleProvider><Faq /></LocaleProvider>);
    expect(screen.getByText(/When should I RSVP by/)).toBeInTheDocument();
  });
});
