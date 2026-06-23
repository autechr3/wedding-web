import { LocaleProvider } from './locale/LocaleProvider';
import { PasscodeGate } from './components/PasscodeGate';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <LocaleProvider>
      <PasscodeGate>
        <Layout>
          <HomePage />
        </Layout>
      </PasscodeGate>
    </LocaleProvider>
  );
}
