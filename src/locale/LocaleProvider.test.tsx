import { describe, it, expect } from 'vitest';
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
  it('defaults to en and sets html dir', () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    expect(screen.getByTestId('loc').textContent).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('switches to fa and sets rtl', () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    act(() => { screen.getByText('fa').click(); });
    expect(screen.getByTestId('loc').textContent).toBe('fa');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
