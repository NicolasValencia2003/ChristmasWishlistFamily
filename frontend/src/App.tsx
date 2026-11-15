import { Route, Routes } from 'react-router-dom';
import { Lights } from './components/Lights';
import { Snow } from './components/Snow';
import { es } from './i18n/es';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PersonPage } from './pages/PersonPage';
import { ToastProvider } from './lib/useToast';

export function App() {
  return (
    <ToastProvider>
      <a href="#contenido" className="skip-link">
        {es.common.skipToContent}
      </a>
      <Lights />
      <Snow />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/persona/:id" element={<PersonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ToastProvider>
  );
}
