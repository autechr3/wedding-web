import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './locale/LocaleProvider';
import { PasscodeGate } from './components/PasscodeGate';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import Travel from './pages/Travel';
import Rsvp from './pages/Rsvp';

export default function App() {
  return (
    <LocaleProvider>
      <PasscodeGate>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="events" element={<Events />} />
              <Route path="travel" element={<Travel />} />
              <Route path="rsvp" element={<Rsvp />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PasscodeGate>
    </LocaleProvider>
  );
}
