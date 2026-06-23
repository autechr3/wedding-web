import type { ReactNode } from 'react';
import { Nav } from './Nav';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cobalt text-cream">
      <Nav />
      <main>{children}</main>
    </div>
  );
}
