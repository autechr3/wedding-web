import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import './i18n';
import App from './App';
import { UNLOCK_KEY } from './components/PasscodeGate';

describe('App', () => {
  beforeEach(() => {
    localStorage.setItem(UNLOCK_KEY, '1');
  });

  afterEach(() => localStorage.removeItem(UNLOCK_KEY));

  it('renders nav and home by default', () => {
    render(<App />);
    expect(screen.getByText('N · M')).toBeInTheDocument();
    expect(screen.getByTestId('page-home')).toBeInTheDocument();
  });
});
