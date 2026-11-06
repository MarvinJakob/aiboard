import { useEffect, useRef } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router';
import { canEdit, canManageUsers, useLogout, useMe, type Me } from '../api/client';

/**
 * Gemeinsames Layout aller geschützten Redaktionsseiten. Ohne gültige Sitzung führt es zur Anmeldung.
 * Die eigentliche Prüfung macht das Backend bei jedem Seiten- und API-Aufruf (Anforderung 6).
 */
export function Layout() {
  const { data: me, isPending, isError, refetch } = useMe();

  if (isPending) return <Loading />;
  if (isError) {
    return (
      <main className="page container" id="inhalt">
        <h1>Verbindung fehlgeschlagen</h1>
        <p className="lead">Die Anmeldung konnte nicht geprüft werden.</p>
        <button className="btn btn-secondary press" type="button" onClick={() => refetch()}>
          Erneut versuchen
        </button>
      </main>
    );
  }
  if (!me) return <Navigate to="/anmelden" replace />;

  return (
    <>
      <a className="skip-link" href="#inhalt">
        Zum Inhalt springen
      </a>
      <Header me={me} />
      <main className="page container" id="inhalt" tabIndex={-1}>
        <Outlet context={me} />
      </main>
    </>
  );
}

function Header({ me }: { me: Me }) {
  const logout = useLogout();
  const navigate = useNavigate();
  const onLogout = () => logout.mutate(undefined, { onSettled: () => navigate('/anmelden', { replace: true }) });

  return (
    <header className="ed-header">
      <nav className="ed-bar glass" aria-label="Redaktion">
        <a className="brand press" href="/" aria-label="KI Perspektiven – zur öffentlichen Webseite">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Redaktion</span>
        </a>
        <div className="nav-main">
          {canEdit(me.role) && (
            <NavLink className="nav-btn press" to="/" end>
              Beiträge
            </NavLink>
          )}
          {canManageUsers(me.role) && (
            <NavLink className="nav-btn press" to="/benutzer">
              Benutzer
            </NavLink>
          )}
        </div>
        <div className="nav-actions">
          <span className="ed-user" title={me.email}>
            {me.email}
            <span className="ed-role">{me.role === 'admin' ? 'Admin' : 'Redaktion'}</span>
          </span>
          <button className="btn btn-secondary press" type="button" onClick={onLogout} disabled={logout.isPending}>
            Abmelden
          </button>
        </div>
      </nav>
    </header>
  );
}

type Permission = 'edit' | 'manageUsers';

/** Zeigt den Inhalt nur mit passender Rolle. Sonst erscheint ein Hinweis statt der Seite. */
export function RequireRole({ can, children }: { can: Permission; children: React.ReactNode }) {
  const { data: me } = useMe();
  if (!me) return null;
  const ok = can === 'edit' ? canEdit(me.role) : canManageUsers(me.role);
  if (!ok) return <Forbidden can={can} />;
  return <>{children}</>;
}

function Forbidden({ can }: { can: Permission }) {
  return (
    <Page title="Keine Berechtigung">
      <p className="lead">
        {can === 'manageUsers'
          ? 'Die Benutzerverwaltung ist Admin-Konten vorbehalten.'
          : 'Ihr Konto hat keinen Zugriff auf diesen Bereich.'}{' '}
        Wenden Sie sich bei Bedarf an die Administration.
      </p>
    </Page>
  );
}

/** Seitenrahmen: setzt den Titel und setzt den Fokus nach einem Seitenwechsel auf die Überschrift. */
export function Page({ title, actions, children }: { title: string; actions?: React.ReactNode; children?: React.ReactNode }) {
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    document.title = `${title} – Redaktion – KI Perspektiven`;
    h1.current?.focus();
  }, [title]);
  return (
    <>
      <div className="page-head">
        <h1 ref={h1} tabIndex={-1}>
          {title}
        </h1>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
      {children}
    </>
  );
}

export function Loading() {
  return (
    <p className="loading" role="status">
      Wird geladen …
    </p>
  );
}
