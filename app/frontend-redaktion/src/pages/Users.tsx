import { useId, useState } from 'react';
import { ApiError, useMe } from '../api/client';
import { useCreateUser, useSetUserActive, useUsers, type User } from '../api/users';
import { Loading, Page } from '../components/Layout';
import { formatDate } from '../components/PostParts';

const MIN_PASSWORD = 10;

/** Benutzerverwaltung für Admin-Konten (Anforderung 11): Konten anzeigen, anlegen, deaktivieren und reaktivieren. */
export function UsersPage() {
  const { data: users, isPending, isError, refetch } = useUsers();
  const [notice, setNotice] = useState('');

  return (
    <Page title="Benutzerverwaltung">
      <p className="lead">
        Konten der Redaktion. Neue Konten erhalten die Rolle Redaktion und melden sich mit dem Startpasswort an.
        Deaktivierte Konten können sich nicht mehr anmelden, offene Sitzungen enden sofort.
      </p>
      <p className="form-ok" role="status">
        {notice}
      </p>
      {isPending && <Loading />}
      {isError && (
        <p className="form-error" role="alert">
          Die Konten konnten nicht geladen werden.{' '}
          <button className="btn btn-secondary btn-small press" type="button" onClick={() => refetch()}>
            Erneut versuchen
          </button>
        </p>
      )}
      {users && <UserTable users={users} onNotice={setNotice} />}
      <NewUserForm onNotice={setNotice} />
    </Page>
  );
}

function UserTable({ users, onNotice }: { users: User[]; onNotice: (s: string) => void }) {
  const { data: me } = useMe();
  const setActive = useSetUserActive();
  const [error, setError] = useState('');

  const toggle = (u: User) => {
    setError('');
    onNotice('');
    setActive.mutate(
      { id: u.id, active: !u.active },
      {
        onSuccess: (r) =>
          onNotice(
            r.active
              ? `${r.email} ist wieder aktiv und kann sich anmelden.`
              : `${r.email} ist deaktiviert. Offene Sitzungen wurden beendet.`,
          ),
        onError: (e) => setError(e instanceof ApiError && e.status < 500 ? e.message : 'Ändern ist gerade nicht möglich.'),
      },
    );
  };

  return (
    <>
      <p className="form-error" role="alert">
        {error}
      </p>
      <div className="table-wrap">
        <table className="table">
          <caption className="visually-hidden">Redaktionskonten</caption>
          <thead>
            <tr>
              <th scope="col">E-Mail-Adresse</th>
              <th scope="col">Rolle</th>
              <th scope="col">Status</th>
              <th scope="col">Angelegt</th>
              <th scope="col" className="actions">
                <span className="visually-hidden">Aktion</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u.id === me?.id;
              return (
                <tr key={u.id}>
                  <td>
                    {u.email}
                    {self && <span className="row-meta"> Sie</span>}
                  </td>
                  <td>{u.role === 'admin' ? 'Admin' : 'Redaktion'}</td>
                  <td>
                    {u.active ? (
                      <span className="badge badge-published">Aktiv</span>
                    ) : (
                      <span className="badge badge-inactive">Deaktiviert</span>
                    )}
                  </td>
                  <td className="num">{formatDate(u.createdAt)}</td>
                  <td className="actions">
                    {!self && (
                      <button
                        type="button"
                        className={`btn btn-small press ${u.active ? 'btn-danger' : 'btn-secondary'}`}
                        disabled={setActive.isPending}
                        onClick={() => toggle(u)}
                        aria-label={`${u.email} ${u.active ? 'deaktivieren' : 'reaktivieren'}`}
                      >
                        {u.active ? 'Deaktivieren' : 'Reaktivieren'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function NewUserForm({ onNotice }: { onNotice: (s: string) => void }) {
  const create = useCreateUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const ids = { email: useId(), password: useId(), hint: useId(), error: useId(), heading: useId() };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onNotice('');
    if (!email.trim() || password.length < MIN_PASSWORD) {
      setError(
        !email.trim()
          ? 'Bitte eine E-Mail-Adresse angeben.'
          : `Das Startpasswort muss mindestens ${MIN_PASSWORD} Zeichen lang sein.`,
      );
      return;
    }
    setError('');
    create.mutate(
      { email, password },
      {
        onSuccess: (u) => {
          setEmail('');
          setPassword('');
          onNotice(`Konto ${u.email} angelegt. Teilen Sie das Startpasswort auf einem sicheren Weg mit.`);
        },
        onError: (e) => setError(e instanceof ApiError && e.status < 500 ? e.message : 'Anlegen ist gerade nicht möglich.'),
      },
    );
  };

  return (
    <section className="card" aria-labelledby={ids.heading}>
      <h2 id={ids.heading} className="card-title">
        Neues Konto
      </h2>
      <form onSubmit={submit} noValidate className="inline-form">
        <div className="field">
          <label htmlFor={ids.email}>E-Mail-Adresse</label>
          <input
            id={ids.email}
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={error ? ids.error : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor={ids.password}>Startpasswort</label>
          <input
            id={ids.password}
            type="text"
            autoComplete="new-password"
            spellCheck={false}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={`${ids.hint}${error ? ` ${ids.error}` : ''}`}
          />
          <span className="field-hint" id={ids.hint}>
            Mindestens {MIN_PASSWORD} Zeichen.
          </span>
        </div>
        <div className="inline-form-actions">
          <button type="submit" className="btn btn-primary press" disabled={create.isPending}>
            Konto anlegen
          </button>
        </div>
      </form>
      <p className="form-error" id={ids.error} role="alert">
        {error}
      </p>
    </section>
  );
}
