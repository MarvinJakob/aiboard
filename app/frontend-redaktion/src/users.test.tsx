import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { User } from './api/users';
import { ADMIN, EDITOR, fakeBackend, json, renderAt, type FakeRequest, type Handler } from './test/fakeApi';

afterEach(() => vi.unstubAllGlobals());

/** Konten-Backend im Speicher mit denselben Regeln wie der Server. */
function usersBackend() {
  const users: User[] = [
    { id: ADMIN.id, email: ADMIN.email, role: 'admin', active: true, createdAt: '2026-11-01T09:00:00Z' },
    { id: EDITOR.id === ADMIN.id ? 99 : EDITOR.id, email: EDITOR.email, role: 'editor', active: true, createdAt: '2026-11-02T09:00:00Z' },
  ];
  const handler: Handler = (r: FakeRequest, _url, state) => {
    if (!r.path.startsWith('/api/admin/users')) return undefined;
    if (state.me?.role !== 'admin') return json(403, { message: 'Keine Berechtigung für diesen Bereich.' });
    if (r.method !== 'GET' && r.csrf !== state.me.csrfToken) return json(403, { message: 'CSRF-Token fehlt.' });
    if (r.path === '/api/admin/users' && r.method === 'GET') return json(200, { items: users });
    if (r.path === '/api/admin/users' && r.method === 'POST') {
      const { email, password } = r.body as { email: string; password: string };
      const normalized = email.trim().toLowerCase();
      if (users.some((u) => u.email === normalized)) {
        return json(409, { message: 'Für diese E-Mail-Adresse gibt es bereits ein Konto.' });
      }
      if (password.length < 10) return json(422, { message: 'Das Passwort muss mindestens 10 Zeichen lang sein.' });
      const u: User = { id: users.length + 10, email: normalized, role: 'editor', active: true, createdAt: '2026-11-06T10:00:00Z' };
      users.push(u);
      return json(201, u);
    }
    const m = r.path.match(/^\/api\/admin\/users\/(\d+)$/);
    const u = m && users.find((x) => x.id === Number(m[1]));
    if (u && r.method === 'PATCH') {
      const { active } = r.body as { active: boolean };
      if (!active && u.id === state.me.id) return json(422, { message: 'Das eigene Konto lässt sich nicht deaktivieren.' });
      u.active = active;
      return json(200, u);
    }
    return json(404, { message: 'Konto nicht gefunden.' });
  };
  return { users, handler };
}

const rowOf = async (email: string) => {
  const table = await screen.findByRole('table', { name: 'Redaktionskonten' });
  return within(table).getByText(email).closest('tr') as HTMLElement;
};

describe('Anforderung 11: Benutzerverwaltung', () => {
  it('zeigt Admin-Konten alle Redaktionskonten mit Rolle und Status', async () => {
    const { handler } = usersBackend();
    fakeBackend(ADMIN, handler);
    renderAt('/benutzer');
    const admin = await rowOf(ADMIN.email);
    expect(within(admin).getByText('Admin')).toBeInTheDocument();
    expect(within(admin).queryByRole('button')).not.toBeInTheDocument(); // eigenes Konto
    const editor = await rowOf(EDITOR.email);
    expect(within(editor).getByText('Redaktion')).toBeInTheDocument();
    expect(within(editor).getByText('Aktiv')).toBeInTheDocument();
  });

  it('legt ein Konto mit E-Mail-Adresse und Startpasswort an', async () => {
    const { users, handler } = usersBackend();
    const state = fakeBackend(ADMIN, handler);
    renderAt('/benutzer');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('E-Mail-Adresse'), 'Neu@Example.test');
    await user.type(screen.getByLabelText('Startpasswort'), 'startpasswort-1');
    await user.click(screen.getByRole('button', { name: 'Konto anlegen' }));

    expect(await screen.findByText(/Konto neu@example.test angelegt/)).toBeInTheDocument();
    expect(await rowOf('neu@example.test')).toBeInTheDocument();
    expect(users.find((u) => u.email === 'neu@example.test')?.role).toBe('editor');
    expect(screen.getByLabelText('E-Mail-Adresse')).toHaveValue('');
    expect(state.requests.find((r) => r.method === 'POST' && r.path === '/api/admin/users')?.csrf).toBe(ADMIN.csrfToken);
  });

  it('meldet doppelte E-Mail-Adressen und zu kurze Startpasswörter', async () => {
    const { users, handler } = usersBackend();
    const state = fakeBackend(ADMIN, handler);
    renderAt('/benutzer');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('E-Mail-Adresse'), 'neu@example.test');
    await user.type(screen.getByLabelText('Startpasswort'), 'kurz');
    await user.click(screen.getByRole('button', { name: 'Konto anlegen' }));
    expect(screen.getByText('Das Startpasswort muss mindestens 10 Zeichen lang sein.')).toBeInTheDocument();
    expect(state.requests.some((r) => r.method === 'POST')).toBe(false);

    await user.clear(screen.getByLabelText('E-Mail-Adresse'));
    await user.type(screen.getByLabelText('E-Mail-Adresse'), EDITOR.email.toUpperCase());
    await user.clear(screen.getByLabelText('Startpasswort'));
    await user.type(screen.getByLabelText('Startpasswort'), 'startpasswort-1');
    await user.click(screen.getByRole('button', { name: 'Konto anlegen' }));
    expect(await screen.findByText(/gibt es bereits ein Konto/)).toBeInTheDocument();
    expect(users).toHaveLength(2);
  });

  it('deaktiviert und reaktiviert ein Konto', async () => {
    const { users, handler } = usersBackend();
    fakeBackend(ADMIN, handler);
    renderAt('/benutzer');
    const user = userEvent.setup();
    const row = await rowOf(EDITOR.email);
    await user.click(within(row).getByRole('button', { name: `${EDITOR.email} deaktivieren` }));
    expect(await screen.findByText(/ist deaktiviert\. Offene Sitzungen wurden beendet/)).toBeInTheDocument();
    expect(users.find((u) => u.email === EDITOR.email)?.active).toBe(false);
    expect(await within(await rowOf(EDITOR.email)).findByText('Deaktiviert')).toBeInTheDocument();

    await user.click(within(await rowOf(EDITOR.email)).getByRole('button', { name: `${EDITOR.email} reaktivieren` }));
    expect(await screen.findByText(/ist wieder aktiv/)).toBeInTheDocument();
    expect(users.find((u) => u.email === EDITOR.email)?.active).toBe(true);
  });

  it('ist für Konten ohne Admin-Rolle nicht nutzbar', async () => {
    const { handler } = usersBackend();
    const state = fakeBackend(EDITOR, handler);
    renderAt('/benutzer');
    expect(await screen.findByRole('heading', { level: 1, name: 'Keine Berechtigung' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Konto anlegen' })).not.toBeInTheDocument();
    expect(state.requests.some((r) => r.path.startsWith('/api/admin/users'))).toBe(false);
  });
});
