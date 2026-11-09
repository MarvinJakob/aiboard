import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONSENT_KEY, CONSENT_VERSION, getConsent, resetConsentMemory, setConsent } from './lib/consent';
import { installFakeApi, renderApp } from './test/fakeApi';

const THEME = 'ki-perspektiven.theme';
const LANG = 'ki-perspektiven.lang';

beforeEach(() => {
  installFakeApi();
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function openSettings(user: ReturnType<typeof userEvent.setup>, name = 'Cookie-Einstellungen') {
  await user.click(await screen.findByRole('button', { name }));
  return screen.getByRole('dialog', { name });
}

describe('Anforderung 56: Cookie-Einstellungen', () => {
  it('zeigt ohne optionale Technologien kein automatisches Banner und keine wirkungslose Zustimmung zu allen', async () => {
    const user = userEvent.setup();
    renderApp('/de');
    await screen.findByRole('button', { name: 'Cookie-Einstellungen' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const dialog = await openSettings(user);
    expect(within(dialog).getByRole('button', { name: 'Keine Cookies speichern' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Nur notwendige Cookies' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Alle Cookies akzeptieren' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Mehr in der Datenschutzerklärung' })).toHaveAttribute(
      'href',
      '/de/datenschutz',
    );
    expect(within(dialog).getByText(/ki-perspektiven\.lang/)).toBeInTheDocument();
    expect(within(dialog).getByText(/ki_session/)).toBeInTheDocument();
  });

  it('wirkt auf jeder öffentlichen Seite', async () => {
    renderApp('/de/blog');
    expect(await screen.findByRole('button', { name: 'Cookie-Einstellungen' })).toBeInTheDocument();
  });

  it('„Keine Cookies“ legt nichts an, entfernt eigene Einträge und speichert Sprache und Darstellung nicht', async () => {
    const user = userEvent.setup();
    localStorage.setItem(THEME, 'dark');
    localStorage.setItem(LANG, 'de');
    sessionStorage.setItem('x', '1');
    renderApp('/de');
    const dialog = await openSettings(user);
    await user.click(within(dialog).getByRole('button', { name: 'Keine Cookies speichern' }));

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(within(dialog).getByRole('button', { name: 'Keine Cookies speichern' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(dialog).getByText(/vollständig neu geladen/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Schließen' }));
    await user.click(screen.getByRole('button', { name: 'Dunkle Darstellung' }));
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
    expect(localStorage.length).toBe(0);
    expect(document.cookie).toBe('');
  });

  it('„Keine Cookies“ beendet bestehende Anmeldungen nicht und weist darauf hin', async () => {
    const user = userEvent.setup();
    const fetchMock = installFakeApi();
    const base = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input) =>
      String(input).includes('/api/auth/me') ? new Response('{}', { status: 200 }) : base(input),
    );
    renderApp('/de');
    const dialog = await openSettings(user);
    await user.click(within(dialog).getByRole('button', { name: 'Keine Cookies speichern' }));
    expect(await within(dialog).findByText(/Anmeldung bleibt bestehen/)).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes('/api/auth/logout'))).toBe(false);
  });

  it('„Nur notwendige“ speichert Auswahl, Zeitpunkt und Version ohne Kennung und bleibt nach dem Neuladen', async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp('/de');
    const dialog = await openSettings(user);
    await user.click(within(dialog).getByRole('button', { name: 'Nur notwendige Cookies' }));

    const record = JSON.parse(localStorage.getItem(CONSENT_KEY)!);
    expect(Object.keys(record).sort()).toEqual(['at', 'mode', 'version']);
    expect(record.mode).toBe('necessary');
    expect(record.version).toBe(CONSENT_VERSION);
    expect(Number.isNaN(Date.parse(record.at))).toBe(false);

    await user.click(within(dialog).getByRole('button', { name: 'Schließen' }));
    await user.click(screen.getByRole('button', { name: 'Dunkle Darstellung' }));
    expect(localStorage.getItem(THEME)).toBe(document.documentElement.getAttribute('data-theme'));

    unmount();
    resetConsentMemory();
    renderApp('/de');
    const again = await openSettings(user);
    expect(within(again).getByRole('button', { name: 'Nur notwendige Cookies' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('widerruft über den Footer und entfernt eigene Einträge', async () => {
    const user = userEvent.setup();
    renderApp('/de');
    let dialog = await openSettings(user);
    await user.click(within(dialog).getByRole('button', { name: 'Nur notwendige Cookies' }));
    await user.click(within(dialog).getByRole('button', { name: 'Schließen' }));
    await user.click(screen.getByRole('button', { name: 'Dunkle Darstellung' }));
    expect(localStorage.length).toBeGreaterThan(0);

    dialog = await openSettings(user);
    await user.click(within(dialog).getByRole('button', { name: 'Keine Cookies speichern' }));
    expect(localStorage.length).toBe(0);
  });

  it('verwirft abgelaufene, ungültige und veraltete Entscheidungen', () => {
    const old = new Date(Date.now() - 181 * 24 * 60 * 60 * 1000).toISOString();
    const fresh = new Date(Date.now() - 179 * 24 * 60 * 60 * 1000).toISOString();

    localStorage.setItem(CONSENT_KEY, JSON.stringify({ mode: 'necessary', at: old, version: CONSENT_VERSION }));
    expect(getConsent()).toBeNull();
    expect(localStorage.getItem(CONSENT_KEY)).toBeNull();

    for (const bad of ['kaputt', JSON.stringify({ mode: 'x', at: fresh, version: CONSENT_VERSION }),
      JSON.stringify({ mode: 'necessary', at: fresh, version: CONSENT_VERSION + 1 }),
      JSON.stringify({ mode: 'all', at: fresh, version: CONSENT_VERSION })]) {
      resetConsentMemory();
      localStorage.setItem(CONSENT_KEY, bad);
      expect(getConsent()).toBeNull();
    }

    resetConsentMemory();
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ mode: 'necessary', at: fresh, version: CONSENT_VERSION }));
    expect(getConsent()?.mode).toBe('necessary');
  });

  it('bietet „Alle“ nicht an und fällt ohne optionale Zwecke auf „notwendig“ zurück', () => {
    setConsent('all');
    expect(getConsent()?.mode).toBe('necessary');
  });

  it('scrollen, Weitersurfen und Schließen gelten nicht als Einwilligung', async () => {
    const user = userEvent.setup();
    renderApp('/de');
    const dialog = await openSettings(user);
    await user.keyboard('{Escape}');
    expect(dialog).not.toBeInTheDocument();
    expect(getConsent()).toBeNull();
    expect(localStorage.getItem(CONSENT_KEY)).toBeNull();
  });

  it('funktioniert bei gesperrtem Browser-Speicher', async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blockiert');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blockiert');
    });
    renderApp('/de');
    const dialog = await openSettings(user);
    await user.click(within(dialog).getByRole('button', { name: 'Nur notwendige Cookies' }));
    expect(within(dialog).getByRole('button', { name: 'Nur notwendige Cookies' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('ist per Tastatur bedienbar, hält den Fokus im Dialog und gibt ihn beim Schließen zurück', async () => {
    const user = userEvent.setup();
    renderApp('/de');
    const opener = await screen.findByRole('button', { name: 'Cookie-Einstellungen' });
    opener.focus();
    await user.keyboard('{Enter}');
    const dialog = screen.getByRole('dialog', { name: 'Cookie-Einstellungen' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    for (let i = 0; i < 8; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    await user.keyboard('{Escape}');
    expect(opener).toHaveFocus();
  });

  it('funktioniert auf Englisch', async () => {
    const user = userEvent.setup();
    renderApp('/en');
    const dialog = await openSettings(user, 'Cookie settings');
    expect(within(dialog).getByRole('button', { name: 'Store no cookies' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Necessary cookies only' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Accept all cookies' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'More in the privacy policy' })).toHaveAttribute('href', '/en/datenschutz');
  });
});
