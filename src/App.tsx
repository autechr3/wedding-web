import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './locale/LocaleProvider';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import Travel from './pages/Travel';
import Faq from './pages/Faq';
import Rsvp from './pages/Rsvp';

export default function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="travel" element={<Travel />} />
            <Route path="faq" element={<Faq />} />
            <Route path="rsvp" element={<Rsvp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  );
}
