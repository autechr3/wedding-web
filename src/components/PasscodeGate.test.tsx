import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '../i18n';
import { STORAGE_KEY } from '../i18n';
import { LocaleProvider } from '../locale/LocaleProvider';
import { PasscodeGate } from './PasscodeGate';

function setup() {
  return render(
    <LocaleProvider>
      <PasscodeGate><div data-testid="secret">welcome</div></PasscodeGate>
    </LocaleProvider>,
  );
}

describe('PasscodeGate', () => {
  beforeEach(() => { localStorage.clear(); });

  it('asks for a language before the passcode when none is chosen', () => {
    setup();
    expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument();
    // The passcode prompt is not shown until a language is picked.
    expect(screen.queryByLabelText(/passcode/i)).not.toBeInTheDocument();
  });

  it('shows the passcode prompt after a language is chosen', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    expect(screen.getByLabelText(/passcode/i)).toBeInTheDocument();
  });

  it('skips language selection when one is already stored', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    setup();
    expect(screen.getByLabelText(/passcode/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /english/i })).not.toBeInTheDocument();
  });

  it('keeps the gate closed on a wrong passcode', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    setup();
    fireEvent.change(screen.getByLabelText(/passcode/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /enter/i }));
    expect(screen.getByLabelText(/passcode/i)).toBeInTheDocument();
  });

  it('lifts the gate on the correct passcode', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    setup();
    fireEvent.change(screen.getByLabelText(/passcode/i), {
      target: { value: import.meta.env.VITE_SITE_PASSCODE },
    });
    fireEvent.click(screen.getByRole('button', { name: /enter/i }));
    // The gate (and its passcode field) is gone; the content is revealed.
    expect(screen.queryByLabelText(/passcode/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('secret')).toBeInTheDocument();
  });

  it('matches the passcode case-insensitively', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    setup();
    fireEvent.change(screen.getByLabelText(/passcode/i), {
      target: { value: import.meta.env.VITE_SITE_PASSCODE.toUpperCase() },
    });
    fireEvent.click(screen.getByRole('button', { name: /enter/i }));
    expect(screen.queryByLabelText(/passcode/i)).not.toBeInTheDocument();
  });
});
