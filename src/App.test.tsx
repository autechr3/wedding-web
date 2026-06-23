import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import './i18n';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.setItem('nm-unlocked', '1');
  });

  it('renders nav and home by default', () => {
    render(<App />);
    expect(screen.getByText('N · M')).toBeInTheDocument();
    expect(screen.getByTestId('page-home')).toBeInTheDocument();
  });
});
