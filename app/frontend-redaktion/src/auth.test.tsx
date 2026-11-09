import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ADMIN, EDITOR, PASSWORD, fakeBackend, renderAt } from './test/fakeApi';

afterEach(() => vi.unstubAllGlobals());

async function login(email: string, password = PASSWORD) {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('E-Mail-Adresse'), email);
  await user.type(screen.getByLabelText('Passwort'), password);
  await user.click(screen.getByRole('button', { name: 'Anmelden' }));
  return user;
}

describe('Anforderung 6: Zugang zur Redaktion', () => {
  it('zeigt ein Anmeldeformular ohne Selbstregistrierung', async () => {
    fakeBackend();
    renderAt('/anmelden');
    expect(await screen.findByRole('heading', { level: 1, name: 'Anmelden' })).toBeInTheDocument();
    expect(screen.getByLabelText('E-Mail-Adresse')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Passwort')).toHaveAttribute('type', 'password');
    expect(screen.getByText(/Mitgliedern der Redaktion vorbehalten/)).toBeInTheDocument();
    expect(screen.queryByText(/registrier|konto erstellen|konto anlegen/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /registr/i })).not.toBeInTheDocument();
  });

  it('führt die Redaktion nach der Anmeldung zur Beitragsliste', async () => {
    fakeBackend();
    const { router } = renderAt('/anmelden');
    await login('redaktion@example.test');
    expect(await screen.findByRole('heading', { level: 1, name: 'Beiträge' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/redaktion');
    expect(screen.queryByRole('link', { name: 'Benutzer' })).not.toBeInTheDocument();
  });

  it('führt Admin-Konten nach der Anmeldung zur Benutzerverwaltung', async () => {
    fakeBackend();
    const { router } = renderAt('/anmelden');
    await login('admin@example.test');
    expect(await screen.findByRole('heading', { level: 1, name: 'Benutzerverwaltung' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/redaktion/benutzer');
  });

  it('nennt bei falschen Daten den Fehler und einen nächsten Schritt', async () => {
    fakeBackend();
    renderAt('/anmelden');
    await login('redaktion@example.test', 'falsch');
    expect(await screen.findByText(/falsch.*Administration/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Anmelden' })).toBeInTheDocument();
  });

  it('verlangt E-Mail-Adresse und Passwort, bevor etwas gesendet wird', async () => {
    const state = fakeBackend();
    renderAt('/anmelden');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Anmelden' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Bitte E-Mail-Adresse und Passwort eingeben.');
    expect(state.requests.some((r) => r.path === '/api/auth/login')).toBe(false);
  });

  it('öffnet geschützte Seiten ohne Anmeldung nicht', async () => {
    fakeBackend();
    for (const path of ['/', '/benutzer']) {
      const { router, unmount } = renderAt(path);
      expect(await screen.findByRole('heading', { level: 1, name: 'Anmelden' })).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/redaktion/anmelden');
      unmount();
    }
  });

  it('zeigt der Redaktion die Benutzerverwaltung nicht', async () => {
    fakeBackend(EDITOR);
    renderAt('/benutzer');
    expect(await screen.findByRole('heading', { level: 1, name: 'Keine Berechtigung' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Benutzerverwaltung' })).not.toBeInTheDocument();
  });

  it('leitet angemeldete Personen von der Anmeldung zur Startseite ihrer Rolle', async () => {
    fakeBackend(ADMIN);
    const { router } = renderAt('/anmelden');
    expect(await screen.findByRole('heading', { level: 1, name: 'Benutzerverwaltung' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/redaktion/benutzer');
  });

  it('meldet mit CSRF-Token ab und verlangt danach eine neue Anmeldung', async () => {
    const state = fakeBackend(EDITOR);
    const { router } = renderAt('/');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Abmelden' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Anmelden' })).toBeInTheDocument();
    const logout = state.requests.find((r) => r.path === '/api/auth/logout');
    expect(logout?.csrf).toBe(EDITOR.csrfToken);
    await router.navigate('/');
    await waitFor(() => expect(router.state.location.pathname).toBe('/redaktion/anmelden'));
  });
});
