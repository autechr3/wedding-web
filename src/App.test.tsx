import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import './i18n';
import App from './App';

describe('App', () => {
  it('renders nav and home by default', () => {
    render(<App />);
    expect(screen.getByText('N · M')).toBeInTheDocument();
    expect(screen.getByTestId('page-home')).toBeInTheDocument();
  });
});
