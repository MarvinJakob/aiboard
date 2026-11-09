import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN, EDITOR, fakeBackend, renderAt } from './test/fakeApi';

const theme = () => document.documentElement.getAttribute('data-theme');

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});
afterEach(() => vi.unstubAllGlobals());

describe('Ticket #20: Helle und dunkle Darstellung in der Redaktion', () => {
  it.each([
    ['Anmeldung', null, '/anmelden'],
    ['Beitragsliste', EDITOR, '/'],
    ['Benutzerverwaltung', ADMIN, '/benutzer'],
  ])('startet die %s trotz dunkler Systemeinstellung hell', async (_name, me, path) => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    fakeBackend(me, (r) => (r.path.startsWith('/api/admin') ? Response.json({ items: [] }) : undefined));
    renderAt(path);
    expect(await screen.findByRole('button', { name: 'Dunkle Darstellung' })).toHaveAttribute('aria-pressed', 'false');
    expect(theme()).toBe('light');
  });

  it('bietet den Schalter schon auf der Anmeldeseite an', async () => {
    fakeBackend();
    const user = userEvent.setup();
    renderAt('/anmelden');
    const toggle = await screen.findByRole('button', { name: 'Dunkle Darstellung' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(theme()).toBe('dark');
    expect(localStorage.getItem('ki-perspektiven.theme')).toBe('dark');
  });

  it.each([
    ['Beitragsliste', EDITOR, '/'],
    ['Benutzerverwaltung', ADMIN, '/benutzer'],
  ])('schaltet in der %s um und behält die Wahl beim Seitenwechsel', async (_name, me, path) => {
    fakeBackend(me, (r) => (r.path.startsWith('/api/admin') ? Response.json({ items: [] }) : undefined));
    const user = userEvent.setup();
    const { router } = renderAt(path);
    const toggle = await screen.findByRole('button', { name: 'Dunkle Darstellung' });
    await user.click(toggle);
    expect(theme()).toBe('dark');
    expect(router.state.location.pathname).toBe('/redaktion' + path);

    await router.navigate('/redaktion/gibt-es-nicht');
    expect(await screen.findByRole('button', { name: 'Dunkle Darstellung' })).toHaveAttribute('aria-pressed', 'true');
    expect(theme()).toBe('dark');
  });

  it('übernimmt die auf der öffentlichen Webseite gespeicherte Wahl', async () => {
    localStorage.setItem('ki-perspektiven.theme', 'dark');
    fakeBackend();
    renderAt('/anmelden');
    expect(await screen.findByRole('button', { name: 'Dunkle Darstellung' })).toHaveAttribute('aria-pressed', 'true');
    expect(theme()).toBe('dark');
  });
});
