import { Link } from 'react-router';
import { Page } from '../components/Layout';

export function NotFound() {
  return (
    <Page title="Seite nicht gefunden">
      <p className="lead">Diese Seite gibt es in der Redaktion nicht.</p>
      <p className="page-links">
        <Link to="/">Zur Beitragsliste</Link>
      </p>
    </Page>
  );
}
