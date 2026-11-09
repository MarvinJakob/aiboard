import { useEffect, useId, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { ApiError, homeFor, useLogin, useMe } from '../api/client';
import { ThemeToggle } from '../components/ThemeToggle';
import { page, safeTarget } from '../lib/target';

/**
 * Anmeldung der Redaktion (Anforderung 6). Es gibt bewusst keine Selbstregistrierung:
 * Konten richtet ein Admin-Konto in der Benutzerverwaltung ein.
 *
 * Bei aktivem Zugangsschutz (Ticket #49) kommen auch Testpersonen hierher. Der Parameter `weiter`
 * nennt dann die aufgerufene Seite der Webseite, zu der es nach der Anmeldung zurückgeht.
 */
export function LoginPage() {
  const { data: me } = useMe();
  const login = useLogin();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const target = safeTarget(params.get('weiter'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [missing, setMissing] = useState(false);
  const errorId = useId();

  useEffect(() => {
    document.title = 'Anmelden – Redaktion – KI Perspektiven';
  }, []);

  // Bereits angemeldet: zum gemerkten Ziel der Webseite.
  useEffect(() => {
    if (me && target && !login.isPending) page.open(target);
  }, [me, target, login.isPending]);

  // Bereits angemeldet: direkt zur passenden Startseite.
  if (me && !login.isPending && !target) return <Navigate to={homeFor(me.role)} replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setMissing(true);
      return;
    }
    setMissing(false);
    login.mutate(
      { email, password },
      {
        onSuccess: (m) => (target ? page.open(target) : navigate(homeFor(m.role), { replace: true })),
      },
    );
  };

  const error = missing ? 'Bitte E-Mail-Adresse und Passwort eingeben.' : login.error ? message(login.error) : '';

  return (
    <main className="login" id="inhalt">
      <ThemeToggle className="login-theme" />
      <div className="login-card glass glass--strong">
        <a className="brand press" href="/" aria-label="KI Perspektiven – zur öffentlichen Webseite">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">KI Perspektiven</span>
        </a>
        <h1>Anmelden</h1>
        <p className="sheet-sub">
          {target
            ? 'Die Webseite ist noch nicht öffentlich. Bitte mit deinem Testzugang anmelden.'
            : 'Der Zugang ist Mitgliedern der Redaktion vorbehalten.'}{' '}
          Konten richtet die Administration ein.
        </p>
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="login-email">E-Mail-Adresse</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Passwort</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
          </div>
          <p className="form-error" id={errorId} role="alert">
            {error}
          </p>
          <div className="sheet-actions">
            {!target && (
              <a className="btn btn-secondary press" href="/">
                Zur Webseite
              </a>
            )}
            <button className="btn btn-primary press" type="submit" disabled={login.isPending}>
              {login.isPending ? 'Wird angemeldet …' : 'Anmelden'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function message(err: Error): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'E-Mail-Adresse oder Passwort ist falsch, oder das Konto ist deaktiviert. Bitte Eingaben prüfen oder an die Administration wenden.';
    }
    if (err.status === 429) return 'Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.';
    if (err.status < 500) return err.message;
  }
  return 'Die Anmeldung ist gerade nicht möglich. Bitte später erneut versuchen.';
}
