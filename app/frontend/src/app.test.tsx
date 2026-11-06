import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { switchLangPath } from './lib/lang';
import themeScript from '../public/theme.js?raw';
import { installFakeApi, renderApp } from './test/fakeApi';

beforeEach(() => {
  installFakeApi();
});

describe('Anforderung 1: Startseite', () => {
  it('zeigt den zuletzt veröffentlichten Beitrag an erster Stelle und wechselt über Positionspunkte', async () => {
    const user = userEvent.setup();
    renderApp('/de');
    const carousel = await screen.findByRole('region', { name: 'Aktuelle Beiträge' });
    const slides = within(carousel).getAllByRole('group');
    expect(slides).toHaveLength(2);
    expect(within(slides[0]).getByRole('heading', { name: 'Neuester Beitrag' })).toBeInTheDocument();
    expect(slides[1]).toHaveAttribute('inert');

    const dot2 = within(carousel).getByRole('button', { name: 'Beitrag 2 von 2' });
    await user.click(dot2);
    expect(dot2).toHaveAttribute('aria-current', 'true');
    expect(slides[0]).toHaveAttribute('inert');
    expect(slides[1]).not.toHaveAttribute('inert');
  });

  it('öffnet über eine Themenkarte die zugehörige Themenseite', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    const card = await screen.findByRole('link', { name: /AI Audit für Unternehmen.*Zum Thema/s });
    await user.click(card);
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit');
    expect(await screen.findByRole('heading', { level: 1, name: 'AI Audit für Unternehmen' })).toBeInTheDocument();
  });

  it('zeigt ohne veröffentlichte Beiträge weiterhin die Themenkarten', async () => {
    installFakeApi([]);
    renderApp('/de');
    expect(await screen.findByRole('heading', { name: 'Themen entdecken' })).toBeInTheDocument();
    expect(await screen.findAllByText('Beiträge folgen')).toHaveLength(3);
    expect(screen.queryByRole('region', { name: 'Aktuelle Beiträge' })).not.toBeInTheDocument();
  });
});

describe('Anforderung 2: Navigation', () => {
  it.each(['/de', '/de/themen/softwareentwicklung', '/de/blog', '/de/blog/neu'])(
    'öffnet und schließt das Themenmenü auf %s',
    async (path) => {
      const user = userEvent.setup();
      renderApp(path);
      const btn = await screen.findByRole('button', { name: 'Themen' });
      expect(btn).toHaveAttribute('aria-expanded', 'false');
      await user.click(btn);
      expect(btn).toHaveAttribute('aria-expanded', 'true');
      await user.keyboard('{Escape}');
      expect(btn).toHaveAttribute('aria-expanded', 'false');
      expect(btn).toHaveFocus();
      await user.click(btn);
      await user.click(document.body);
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    },
  );

  it.each([
    ['/de', 'Anmeldung für die Redaktion'],
    ['/en/blog', 'Sign in for editors'],
  ])('verlinkt auf %s den Kontoeinstieg zur Anmeldung der Redaktion', async (path, label) => {
    renderApp(path);
    const nav = await screen.findByRole('navigation', { name: /navigation/i });
    expect(within(nav).getByRole('link', { name: label })).toHaveAttribute('href', '/redaktion/anmelden');
  });

  it('öffnet über einen Menüeintrag die Themenseite und über den Bloglink die Blogübersicht', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/blog/neu');
    await user.click(await screen.findByRole('button', { name: 'Themen' }));
    const menu = document.querySelector('.popover') as HTMLElement;
    await user.click(await within(menu).findByRole('link', { name: /AI in Data Analytics/ }));
    expect(router.state.location.pathname).toBe('/de/themen/data-analytics');
    expect(screen.getByRole('button', { name: 'Themen' })).toHaveAttribute('aria-expanded', 'false');

    const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
    await user.click(within(nav).getByRole('link', { name: 'Blog' }));
    expect(router.state.location.pathname).toBe('/de/blog');
    expect(await screen.findByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument();
  });
});

describe('Anforderung 3: Themenseiten', () => {
  it('zeigt Titel, Einführung und zugeordnete Beiträge; ein Klick öffnet den Beitrag', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit');
    expect(await screen.findByRole('heading', { level: 1, name: 'AI Audit für Unternehmen' })).toBeInTheDocument();
    expect(screen.getByText('Einführung Audit')).toBeInTheDocument();
    await user.click(await screen.findByRole('link', { name: /Älterer Beitrag/ }));
    expect(router.state.location.pathname).toBe('/de/blog/alt');
    expect(await screen.findByRole('heading', { level: 1, name: 'Älterer Beitrag' })).toBeInTheDocument();
  });

  it('bleibt ohne veröffentlichte Beiträge mit Einführung aufrufbar', async () => {
    renderApp('/de/themen/data-analytics');
    expect(await screen.findByRole('heading', { level: 1, name: 'AI in Data Analytics' })).toBeInTheDocument();
    expect(screen.getByText('Einführung Data Analytics')).toBeInTheDocument();
    expect(screen.getByText('Noch keine Beiträge')).toBeInTheDocument();
  });

  it('zeigt für unbekannte Themen die Fehlerseite', async () => {
    renderApp('/de/themen/gibt-es-nicht');
    expect(await screen.findByRole('heading', { level: 1, name: 'Seite nicht gefunden' })).toBeInTheDocument();
  });
});

describe('Anforderung 4: Öffentlicher Blog', () => {
  it('zeigt Titel, Kurztext und Datum, neuere Beiträge oben', async () => {
    renderApp('/de/blog');
    const list = (await screen.findByText('Kurztext neu')).closest('ul') as HTMLElement;
    const titles = within(list)
      .getAllByRole('heading', { level: 2 })
      .map((h: HTMLElement) => h.textContent);
    expect(titles).toEqual(['Neuester Beitrag', 'Nur auf Deutsch erschienen', 'Älterer Beitrag']);
    expect(within(list).getByText('Kurztext neu')).toBeInTheDocument();
    expect(within(list).getByText('3. November 2026')).toBeInTheDocument();
  });

  it('öffnet einen Beitrag mit Titel, Datum und vollständigem Inhalt', async () => {
    renderApp('/de/blog/neu');
    expect(await screen.findByRole('heading', { level: 1, name: 'Neuester Beitrag' })).toBeInTheDocument();
    expect(screen.getByText('3. November 2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Abschnitt eins' })).toBeInTheDocument();
    expect(document.title).toBe('Neuester Beitrag · KI Perspektiven');
  });

  it('zeigt für nicht öffentliche Beiträge die Fehlerseite', async () => {
    renderApp('/de/blog/entwurf');
    expect(await screen.findByRole('heading', { level: 1, name: 'Seite nicht gefunden' })).toBeInTheDocument();
  });
});

describe('Anforderung 7: Sprachwechsel', () => {
  it('wechselt auf jeder Seite die Sprache und bleibt beim selben Beitrag', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/blog/neu');
    await screen.findByRole('heading', { level: 1, name: 'Neuester Beitrag' });
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(router.state.location.pathname).toBe('/en/blog/neu');
    expect(await screen.findByRole('heading', { level: 1, name: 'Newest article' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Topics' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.lang).toBe('en');
  });

  it('zeigt die vorhandene Fassung mit Hinweis auf ihre Sprache, wenn die Übersetzung fehlt', async () => {
    renderApp('/en/blog/nur-deutsch');
    const h1 = await screen.findByRole('heading', { level: 1, name: 'Nur auf Deutsch erschienen' });
    expect(h1).toHaveAttribute('lang', 'de');
    expect(screen.getByText('This article is not available in English. You are reading the German version.')).toBeInTheDocument();
  });

  it('kennzeichnet nicht übersetzte Beiträge in Listen', async () => {
    renderApp('/en/blog');
    expect(await screen.findByText('German only')).toBeInTheDocument();
  });

  it('behält die gewählte Sprache beim Navigieren und speichert sie lokal', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit');
    await screen.findByRole('heading', { level: 1, name: 'AI Audit für Unternehmen' });
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'AI Audit for Companies' })).toBeInTheDocument();
    expect(localStorage.getItem('ki-perspektiven.lang')).toBe('en');

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    await user.click(within(nav).getByRole('link', { name: 'Blog' }));
    expect(router.state.location.pathname).toBe('/en/blog');
    await user.click(await screen.findByRole('link', { name: /Older article/ }));
    expect(router.state.location.pathname).toBe('/en/blog/alt');
  });

  it('leitet "/" auf die gespeicherte Sprache um', async () => {
    localStorage.setItem('ki-perspektiven.lang', 'en');
    const { router } = renderApp('/');
    await waitFor(() => expect(router.state.location.pathname).toBe('/en'));
  });

  it('tauscht nur das Sprachpräfix', () => {
    expect(switchLangPath('/de/blog/x', 'en')).toBe('/en/blog/x');
    expect(switchLangPath('/en/themen/ai-audit', 'de')).toBe('/de/themen/ai-audit');
    expect(switchLangPath('/irgendwo', 'en')).toBe('/en');
  });
});

describe('Anforderung 8: KI-Audit-Übersicht', () => {
  it('zeigt auf der Themenseite AI Audit die Einführung und alle Dimensionen mit Link', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit');
    expect(await screen.findByRole('heading', { level: 2, name: 'Die Dimensionen des KI-Audits' })).toBeInTheDocument();
    expect(screen.getByText('Das KI-Audit zeigt, welche Fähigkeiten vorhanden sind.')).toBeInTheDocument();
    expect(screen.getByText('Leitsatz 2')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Betrieb/ })).toHaveAttribute('href', '/de/themen/ai-audit/betrieb');
    await user.click(screen.getByRole('link', { name: /Strategie und Wirtschaftlichkeit/ }));
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(await screen.findByRole('heading', { level: 1, name: 'Strategie und Wirtschaftlichkeit' })).toBeInTheDocument();
  });

  it('erscheint nur beim Thema AI Audit', async () => {
    renderApp('/de/themen/softwareentwicklung');
    await screen.findByRole('heading', { level: 1, name: 'AI in der Softwareentwicklung' });
    expect(screen.queryByRole('heading', { name: 'Die Dimensionen des KI-Audits' })).not.toBeInTheDocument();
  });
});

describe('Anforderung 9: Seiten für die Audit-Dimensionen', () => {
  it('zeigt Überschrift, Einführung, hervorgehobene Vorteile und die drei Reifegrade', async () => {
    renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(await screen.findByRole('heading', { level: 1, name: 'Strategie und Wirtschaftlichkeit' })).toBeInTheDocument();
    expect(screen.getByText('Einführung Strategie')).toBeInTheDocument();
    const benefits = screen.getByRole('region', { name: 'Ihr Nutzen' });
    expect(within(benefits).getAllByRole('listitem')).toHaveLength(2);
    for (const name of ['Einfach', 'Strukturiert', 'Intelligent']) {
      expect(screen.getByRole('heading', { level: 3, name })).toBeInTheDocument();
    }
    expect(screen.getByText('Beschreibung Strategie 2')).toBeInTheDocument();
  });

  it('zeigt für unbekannte Dimensionen die Fehlerseite', async () => {
    renderApp('/de/themen/ai-audit/gibt-es-nicht');
    expect(await screen.findByRole('heading', { level: 1, name: 'Seite nicht gefunden' })).toBeInTheDocument();
  });

  it('zeigt auf Englisch die deutsche Fassung mit Hinweis', async () => {
    renderApp('/en/themen/ai-audit/betrieb');
    expect(await screen.findByRole('heading', { level: 1, name: 'Betrieb' })).toBeInTheDocument();
    expect(screen.getByText('The AI audit is not available in English. You are reading the German version.')).toBeInTheDocument();
    expect(screen.getAllByRole('radio', { name: 'Yes' })).toHaveLength(3);
  });
});

describe('Anforderung 10: Quiz zur Selbsteinschätzung', () => {
  const answer = async (user: ReturnType<typeof userEvent.setup>, id: string, option: string) =>
    user.click(within(screen.getByRole('group', { name: `${id} Frage ${id}?` })).getByRole('radio', { name: option }));

  it('zeigt erst nach allen Pflichtfragen den Reifegrad und aktualisiert ihn bei Änderungen', async () => {
    const user = userEvent.setup();
    renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    await screen.findByRole('heading', { level: 2, name: 'Selbsteinschätzung' });
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Noch 5 Fragen offen.');

    await answer(user, '1.1', 'Ja');
    await answer(user, '1.2', 'Ja');
    await answer(user, '2.1', 'Nein');
    await answer(user, '2.2', 'Trifft nicht zu');
    expect(status).toHaveTextContent('Noch 1 Frage offen.');
    expect(status).not.toHaveTextContent('Reifegrad:');

    await answer(user, '3.1', 'Ja');
    expect(status).toHaveTextContent('Reifegrad: Einfach');
    const next = screen.getByRole('heading', { level: 4, name: 'Nächster Schritt: Strukturiert' }).parentElement!;
    expect(next).toHaveTextContent('Frage 2.1?');

    await answer(user, '2.1', 'Ja');
    expect(status).toHaveTextContent('Reifegrad: Intelligent');

    await answer(user, '1.2', 'Nein');
    expect(status).toHaveTextContent('Reifegrad: Nicht angewendet');

    await user.click(screen.getByRole('button', { name: 'Antworten zurücksetzen' }));
    expect(status).toHaveTextContent('Noch 5 Fragen offen.');
  });

  it('bietet „Trifft nicht zu“ nur für bedingte Fragen an', async () => {
    renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    await screen.findByRole('heading', { level: 2, name: 'Selbsteinschätzung' });
    expect(screen.getAllByRole('radio', { name: 'Trifft nicht zu' })).toHaveLength(1);
  });

  it('springt zur ersten offenen Frage', async () => {
    const user = userEvent.setup();
    renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    await screen.findByRole('heading', { level: 2, name: 'Selbsteinschätzung' });
    await answer(user, '1.1', 'Ja');
    await user.click(screen.getByRole('button', { name: 'Zur ersten offenen Frage' }));
    expect(within(screen.getByRole('group', { name: '1.2 Frage 1.2?' })).getByRole('radio', { name: 'Ja' })).toHaveFocus();
  });

  it('wirkt nur auf die Dimension, auf deren Seite geantwortet wurde', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit/betrieb');
    await screen.findByRole('heading', { level: 1, name: 'Betrieb' });
    for (const id of ['1.1', '2.1', '3.1']) await answer(user, id, 'Ja');
    expect(screen.getByRole('status')).toHaveTextContent('Reifegrad: Intelligent');

    await router.navigate('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    await screen.findByRole('heading', { level: 1, name: 'Strategie und Wirtschaftlichkeit' });
    expect(screen.getByRole('status')).toHaveTextContent('Noch 5 Fragen offen.');
    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument();
  });
});

describe('Ticket #21: AI Audit als eigener Navigationseintrag', () => {
  const mainNav = async (name = 'Hauptnavigation') => screen.findByRole('navigation', { name });

  it.each(['/de', '/de/blog', '/de/blog/neu', '/de/themen/softwareentwicklung', '/de/impressum', '/de/gibt-es-nicht'])(
    'zeigt auf %s den Eintrag „AI Audit“ neben Themen und Blog',
    async (path) => {
      renderApp(path);
      const nav = await mainNav();
      const audit = within(nav).getByRole('link', { name: 'AI Audit' });
      expect(audit).toHaveAttribute('href', '/de/themen/ai-audit');
      expect(within(nav).getByRole('button', { name: 'Themen' })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: 'Blog' })).toBeInTheDocument();
    },
  );

  it.each([
    ['/de/blog', 'Hauptnavigation', '/de/themen/ai-audit', 'AI Audit für Unternehmen'],
    ['/en/blog', 'Main navigation', '/en/themen/ai-audit', 'AI Audit for Companies'],
  ])('öffnet von %s die Audit-Übersicht in der gewählten Sprache', async (path, navName, target, heading) => {
    const user = userEvent.setup();
    const { router } = renderApp(path);
    await user.click(within(await mainNav(navName)).getByRole('link', { name: 'AI Audit' }));
    expect(router.state.location.pathname).toBe(target);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    const dimension = await screen.findByRole('link', { name: /Strategie und Wirtschaftlichkeit/ });
    expect(dimension).toHaveAttribute('href', `${target}/strategie-und-wirtschaftlichkeit`);
  });

  it('führt im Themenmenü keinen Audit-Eintrag mehr, die übrigen Themen bleiben erreichbar', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await user.click(await screen.findByRole('button', { name: 'Themen' }));
    const menu = document.querySelector('.popover') as HTMLElement;
    const links = await within(menu).findAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/de/themen/softwareentwicklung', '/de/themen/data-analytics']);
    expect(within(menu).queryByRole('link', { name: /AI Audit/ })).not.toBeInTheDocument();
    await user.click(within(menu).getByRole('link', { name: /AI in Data Analytics/ }));
    expect(router.state.location.pathname).toBe('/de/themen/data-analytics');
  });

  it.each([
    ['/de/themen/ai-audit', 'page'],
    ['/de/themen/ai-audit/strategie-und-wirtschaftlichkeit', 'true'],
    ['/en/themen/ai-audit/betrieb', 'true'],
  ])('markiert auf %s „AI Audit“ als aktiv und „Themen“ nicht', async (path, current) => {
    renderApp(path);
    const nav = await mainNav(path.startsWith('/en') ? 'Main navigation' : 'Hauptnavigation');
    const audit = within(nav).getByRole('link', { name: 'AI Audit' });
    expect(audit).toHaveAttribute('aria-current', current);
    expect(audit).toHaveClass('is-active');
    expect(within(nav).getByRole('button', { name: path.startsWith('/en') ? 'Topics' : 'Themen' })).not.toHaveClass('is-active');
  });

  it('markiert auf anderen Themenseiten weiterhin „Themen“ und nicht „AI Audit“', async () => {
    renderApp('/de/themen/softwareentwicklung');
    const nav = await mainNav();
    expect(within(nav).getByRole('button', { name: 'Themen' })).toHaveClass('is-active');
    expect(within(nav).getByRole('link', { name: 'AI Audit' })).not.toHaveAttribute('aria-current');
  });

  it('erhält direkte Links und den Weg zu Dimensionen und Quiz', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await user.click(within(await mainNav()).getByRole('link', { name: 'AI Audit' }));
    await user.click(await screen.findByRole('link', { name: /Strategie und Wirtschaftlichkeit/ }));
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(await screen.findByRole('heading', { name: /Selbsteinschätzung|Quiz/ })).toBeInTheDocument();
  });

  it('ist per Tastatur erreichbar und bedienbar', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/blog');
    const nav = await mainNav();
    within(nav).getByRole('link', { name: 'Blog' }).focus();
    await user.tab();
    expect(within(nav).getByRole('link', { name: 'AI Audit' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit');
  });
});

describe('Ticket #20: Helle und dunkle Darstellung', () => {
  const theme = () => document.documentElement.getAttribute('data-theme');
  const realMatchMedia = window.matchMedia;
  const systemDark = (dark: boolean) => {
    window.matchMedia = ((query: string) => ({
      ...realMatchMedia(query),
      matches: dark && query === '(prefers-color-scheme: dark)',
    })) as typeof window.matchMedia;
  };

  beforeEach(() => document.documentElement.removeAttribute('data-theme'));
  afterEach(() => {
    window.matchMedia = realMatchMedia;
    document.documentElement.removeAttribute('data-theme');
  });

  it.each(['/de', '/de/blog/neu', '/de/themen/ai-audit', '/de/themen/ai-audit/strategie-und-wirtschaftlichkeit', '/de/impressum'])(
    'schaltet auf %s sofort um, ohne die Seite zu verlassen',
    async (path) => {
      const user = userEvent.setup();
      const { router } = renderApp(path);
      const toggle = await screen.findByRole('button', { name: 'Dunkle Darstellung' });
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
      expect(theme()).toBe('dark');
      expect(router.state.location.pathname).toBe(path);
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expect(theme()).toBe('light');
    },
  );

  it('behält die Wahl beim Seiten- und Sprachwechsel und speichert sie lokal', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await user.click(await screen.findByRole('button', { name: 'Dunkle Darstellung' }));
    expect(localStorage.getItem('ki-perspektiven.theme')).toBe('dark');

    const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
    await user.click(within(nav).getByRole('link', { name: 'Blog' }));
    expect(router.state.location.pathname).toBe('/de/blog');
    expect(theme()).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(router.state.location.pathname).toBe('/en/blog');
    const toggle = await screen.findByRole('button', { name: 'Dark mode' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(theme()).toBe('dark');
  });

  it('übernimmt beim erneuten Öffnen die gespeicherte Wahl, auch gegen die Systemeinstellung', async () => {
    systemDark(true);
    localStorage.setItem('ki-perspektiven.theme', 'light');
    renderApp('/de');
    expect(await screen.findByRole('button', { name: 'Dunkle Darstellung' })).toHaveAttribute('aria-pressed', 'false');
    expect(theme()).toBe('light');
  });

  it('folgt ohne gespeicherte Wahl der Systemeinstellung', async () => {
    systemDark(true);
    renderApp('/de');
    expect(await screen.findByRole('button', { name: 'Dunkle Darstellung' })).toHaveAttribute('aria-pressed', 'true');
    expect(theme()).toBe('dark');
  });

  it('ist per Tastatur bedienbar', async () => {
    const user = userEvent.setup();
    renderApp('/de');
    const toggle = await screen.findByRole('button', { name: 'Dunkle Darstellung' });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(theme()).toBe('dark');
    await user.keyboard(' ');
    expect(theme()).toBe('light');
  });

  describe('Startskript public/theme.js', () => {
    const run = () => new Function(themeScript)();

    it('setzt die gespeicherte Wahl', () => {
      systemDark(true);
      localStorage.setItem('ki-perspektiven.theme', 'light');
      run();
      expect(theme()).toBe('light');
    });

    it('übernimmt ohne gespeicherte Wahl die Systemeinstellung', () => {
      systemDark(true);
      run();
      expect(theme()).toBe('dark');
    });

    it('verwendet hell, wenn die Systemeinstellung nicht ermittelbar ist', () => {
      // @ts-expect-error: Browser ohne matchMedia
      window.matchMedia = undefined;
      run();
      expect(theme()).toBe('light');
    });
  });
});
