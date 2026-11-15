import { Link } from 'react-router-dom';
import { es } from '../i18n/es';

export function NotFoundPage() {
  return (
    <main id="contenido" className="page">
      <div className="status">
        <h1 className="page-title">{es.notFoundPage.title}</h1>
        <p>{es.notFoundPage.message}</p>
        <Link to="/" className="button button--primary">
          {es.person.goHome}
        </Link>
      </div>
    </main>
  );
}
