import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '../i18n';
import { LocaleProvider } from '../locale/LocaleProvider';
import { PasscodeGate, UNLOCK_KEY } from './PasscodeGate';

function setup() {
  return render(
    <LocaleProvider>
      <PasscodeGate><div data-testid="secret">welcome</div></PasscodeGate>
    </LocaleProvider>
  );
}

describe('PasscodeGate', () => {
  beforeEach(() => { localStorage.removeItem(UNLOCK_KEY); });

  it('hides content until correct passcode', () => {
    setup();
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
  });

  it('rejects a wrong passcode', () => {
    setup();
    fireEvent.change(screen.getByLabelText(/passcode/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /enter/i }));
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
  });

  it('unlocks on correct passcode', () => {
    setup();
    fireEvent.change(screen.getByLabelText(/passcode/i), { target: { value: import.meta.env.VITE_SITE_PASSCODE } });
    fireEvent.click(screen.getByRole('button', { name: /enter/i }));
    expect(screen.getByTestId('secret')).toBeInTheDocument();
  });
});
