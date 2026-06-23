import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '../i18n';
import { LocaleProvider } from './LocaleProvider';
import { useLocale } from './useLocale';

function Probe() {
  const { locale, setLocale } = useLocale();
  return (
    <div>
      <span data-testid="loc">{locale}</span>
      <button onClick={() => setLocale('fa')}>fa</button>
    </div>
  );
}

describe('LocaleProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = '';
    document.documentElement.lang = '';
  });

  it('defaults to en and sets html dir', () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    expect(screen.getByTestId('loc').textContent).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('switches to fa and sets rtl', () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    act(() => { screen.getByText('fa').click(); });
    expect(screen.getByTestId('loc').textContent).toBe('fa');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('fa');
    expect(localStorage.getItem('nm-locale')).toBe('fa');
  });

  it('initializes locale from localStorage', () => {
    localStorage.setItem('nm-locale', 'fa');
    render(<LocaleProvider><Probe /></LocaleProvider>);
    expect(screen.getByTestId('loc').textContent).toBe('fa');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
