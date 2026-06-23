import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';

export function Layout() {
  return (
    <div className="min-h-screen bg-cobalt text-cream">
      <Nav />
      <main><Outlet /></main>
    </div>
  );
}
