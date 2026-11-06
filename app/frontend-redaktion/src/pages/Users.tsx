import { Page } from '../components/Layout';

/** Benutzerverwaltung für Admin-Konten. Anlegen, Deaktivieren und Reaktivieren folgen mit Anforderung 11. */
export function UsersPage() {
  return (
    <Page title="Benutzerverwaltung">
      <p className="lead">Hier verwalten Sie die Konten der Redaktion.</p>
    </Page>
  );
}
