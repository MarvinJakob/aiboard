import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { switchLangPath } from './lib/lang';
import themeScript from '../public/theme.js?raw';
import { installFakeApi, renderApp } from './test/fakeApi';

beforeEach(() => {
  installFakeApi();
});

// Wortlaut aus content/Landingpage.md, Stand 9. November 2026: Titel, Aufhänger, Linktext und Ziel je Themenkarte.
const FOCUS_CARDS = [
  ['AI Audit', 'Acht Dimensionen. Drei Reifegrade. Wo steht Ihr Unternehmen?', 'Selbsteinschätzung starten', '/de/themen/ai-audit'],
  ['Prozessautomatisierung', 'Welche Aufgabe würden Sie nie wieder von Hand erledigen?', 'Humans in the Loop mit n8n', '/de/themen/prozessautomatisierung'],
  ['Softwareentwicklung', 'Ein Verbot im Prompt verhindert noch keinen Zugriff.', 'KI-Assistenten mit Guardrails anleiten', '/de/themen/softwareentwicklung'],
  ['Data Analytics', 'Was genau ist eigentlich „der Umsatz im letzten Monat“?', 'Daten verstehen und auswerten', '/de/themen/data-analytics'],
  ['KI-Tipps und Tricks', '50,5 statt 33,9 Prozent.', 'Skills, die Sie kennen sollten', '/de/themen/ki-tipps-und-tricks'],
  ['Modelle und Kosten', '4,50 oder 450 US-Dollar?', 'Das beste Preis-Leistungs-Verhältnis finden', '/de/themen/modelle-und-kosten'],
] as const;

describe('Ticket #78: Startseite nach content/Landingpage.md', () => {
  it('zeigt Hook, Aktuell im Fokus und Grundlagen in dieser Reihenfolge', async () => {
    renderApp('/de');
    const main = screen.getByRole('main');
    await within(main).findByRole('heading', { level: 1 });
    const headings = within(main)
      .getAllByRole('heading')
      .map((h) => `${h.tagName} ${h.textContent}`);
    expect(headings).toEqual([
      'H1 KI verstehen.Sinnvoll einsetzen.',
      'H2 Was KI gerade spannend macht.',
      ...FOCUS_CARDS.map(([title]) => `H3 ${title}`),
      'H2 Was ist KI – und was kann man damit machen?',
      'H3 KI hilft dort, wo sich Ergebnisse prüfen lassen.',
      'H3 Wer versteht, wie KI funktioniert, erkennt ihre Grenzen.',
    ]);
    expect(screen.getByText(/^Jedes vierte Unternehmen in Deutschland nutzt bereits KI\./)).toHaveTextContent(
      'Jedes vierte Unternehmen in Deutschland nutzt bereits KI. Die spannende Frage ist: wofür – und wie gut?',
    );
    expect(
      screen.getByText('Einordnungen und Erfahrungen für Unternehmen, die künstliche Intelligenz verantwortungsvoll nutzen wollen. Ohne Hype, mit Substanz.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Sechs Themen, die uns gerade beschäftigen. Jedes beginnt mit einer Frage, die sich lohnt. Die Auswahl wechselt.')).toBeInTheDocument();
    for (const name of ['KI in Deutschland in Zahlen', 'Neu im Blog.', 'Wie bereit ist Ihr Unternehmen für KI?', 'Hinter KI Perspektiven']) {
      expect(screen.queryByRole('heading', { name })).not.toBeInTheDocument();
    }
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('zeigt genau sechs Themenkarten mit Titel, fettem Aufhänger, Kurztext und Link', async () => {
    renderApp('/de');
    const focus = await screen.findByRole('region', { name: 'Was KI gerade spannend macht.' });
    const cards = within(focus).getAllByRole('listitem');
    expect(cards).toHaveLength(6);
    cards.forEach((card, i) => {
      const [title, hook, link, path] = FOCUS_CARDS[i];
      expect(within(card).getByRole('heading', { level: 3 })).toHaveTextContent(title);
      expect(card.querySelector('strong')!.textContent).toBe(hook);
      expect(card.querySelectorAll('p')).toHaveLength(2);
      expect(card.querySelectorAll('p')[1].textContent!.length).toBeGreaterThan(100);
      expect(within(card).getByRole('link', { name: link })).toHaveAttribute('href', path);
    });
    expect(within(cards[2]).getByText('AGENTS.md', { selector: 'code' })).toBeInTheDocument();
  });

  it('führt über eine Themenkarte zur Themenseite in der aktuellen Sprache', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await user.click(await screen.findByRole('link', { name: 'Daten verstehen und auswerten' }));
    expect(router.state.location.pathname).toBe('/de/themen/data-analytics');
    expect(await screen.findByRole('heading', { level: 1, name: 'KI in Data Analytics' })).toBeInTheDocument();
  });

  it.each(FOCUS_CARDS.map(([title, , link, path]) => [title, link, path]))('Karte „%s“ führt auf eine existierende Seite', async (_, link, path) => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await user.click(await screen.findByRole('link', { name: link }));
    expect(router.state.location.pathname).toBe(path);
    expect(await screen.findByRole('heading', { level: 1 })).not.toHaveTextContent('Seite nicht gefunden');
  });

  it('springt mit „Themen entdecken“ zum Fokus und führt zu KI-Audit und Einordnung', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('link', { name: 'Themen entdecken' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Was KI gerade spannend macht.' })).toHaveFocus();
    expect(router.state.location.pathname).toBe('/de');
    expect(router.state.location.hash).toBe('');

    expect(screen.getByRole('link', { name: 'KI-Reifegrad einschätzen' })).toHaveAttribute('href', '/de/themen/ai-audit');

    expect(screen.getByText('Sie möchten wissen, wofür KI heute schon eingesetzt wird?', { exact: false })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Zur ausführlichen Einordnung' }));
    expect(router.state.location.pathname).toBe('/de/ki-einsatzfelder');
    expect(await screen.findByRole('heading', { level: 1, name: 'Wofür KI heute eingesetzt wird' })).toHaveFocus();
  });

  it('zeigt die Grundlagen mit Prüfbarkeit und drei Grenzen', async () => {
    renderApp('/de');
    const basics = await screen.findByRole('region', { name: 'Was ist KI – und was kann man damit machen?' });
    expect(basics).toHaveTextContent(
      'In einer randomisierten Studie brauchten erfahrene Entwicklerinnen und Entwickler mit KI-Werkzeugen aus dem Frühjahr 2025 sogar 19 Prozent länger.',
    );
    const limits = within(basics).getAllByRole('listitem');
    expect(limits.map((l) => l.querySelector('strong')!.textContent)).toEqual([
      'Glaubwürdig heißt nicht richtig.',
      'Wissen hat ein Ablaufdatum.',
      'Nicht jede Aufgabe braucht ein Sprachmodell.',
    ]);
  });

  it.each([
    ['de', 'Quellen'],
    ['en', 'Sources'],
  ])('Ticket #91: zeigt auf /%s keine Quellenverweise und keine Quellenliste', async (lang, title) => {
    renderApp(`/${lang}`);
    await screen.findByRole('heading', { level: 1 });
    const main = screen.getByRole('main');
    expect(main.querySelector('sup, .fn, [id^="quelle-"]')).toBeNull();
    expect(within(main).queryByRole('link', { name: /^(Quelle|Source) \d+$/ })).not.toBeInTheDocument();
    expect(within(main).queryByRole('heading', { name: title })).not.toBeInTheDocument();
  });

  it('ist vollständig auf Englisch verfügbar', async () => {
    renderApp('/en');
    expect(await screen.findByRole('heading', { level: 1, name: 'Understand AI.Use it wisely.' })).toBeInTheDocument();
    expect(screen.getByText(/^One in four companies in Germany already uses AI\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore topics' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Assess your AI maturity' })).toHaveAttribute('href', '/en/themen/ai-audit');
    const focus = screen.getByRole('region', { name: 'What makes AI exciting right now.' });
    expect(within(focus).getAllByRole('listitem')).toHaveLength(6);
    expect(within(focus).getByRole('link', { name: 'Find the best value for money' })).toHaveAttribute('href', '/en/themen/modelle-und-kosten');
    expect(screen.getByRole('heading', { level: 2, name: 'What is AI – and what can you do with it?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read the detailed overview' })).toHaveAttribute('href', '/en/ki-einsatzfelder');
    expect(document.title).toBe('KI Perspektiven');
  });
});

describe('Ticket #78: Ausführliche Einordnung zu KI-Einsatzfeldern', () => {
  it('zeigt Kennzahlen, Definition und Quellen und führt zurück zur Startseite', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/ki-einsatzfelder');
    expect(await screen.findByRole('heading', { level: 1, name: 'Wofür KI heute eingesetzt wird' })).toBeInTheDocument();
    expect(screen.getByText('26 %', { selector: '.sr-only' })).toBeInTheDocument();
    expect(screen.getByText('32,3 %', { selector: '.sr-only' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Quellen' })).toBeInTheDocument();
    expect(document.title).toBe('Wofür KI heute eingesetzt wird · KI Perspektiven');

    await user.click(screen.getByRole('link', { name: 'Zur Startseite' }));
    expect(router.state.location.pathname).toBe('/de');
  });

  it('bedient die sieben Aufgaben-Tabs mit Maus und Tastatur', async () => {
    const user = userEvent.setup();
    renderApp('/de/ki-einsatzfelder');
    const tablist = await screen.findByRole('tablist', { name: 'Sieben typische Aufgaben von KI' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(7);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: /Erkennen/ })).toHaveTextContent('MASAI-Studie');

    await user.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Aufgabe 3 von 7');

    await user.keyboard('{ArrowRight}');
    expect(tabs[3]).toHaveFocus();
    expect(tabs[3]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('tabindex', '-1');
    await user.keyboard('{End}');
    expect(tabs[6]).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tabs[0]).toHaveFocus();
    await user.keyboard('{ArrowLeft}{Home}');
    expect(screen.getByRole('tabpanel', { name: /Erkennen/ })).toBeInTheDocument();
  });

  it('ist auf Englisch verfügbar', async () => {
    renderApp('/en/ki-einsatzfelder');
    expect(await screen.findByRole('heading', { level: 1, name: 'What AI is used for today' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Seven typical tasks of AI' })).toBeInTheDocument();
    expect(screen.getByText('32.3%', { selector: '.sr-only' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home page' })).toHaveAttribute('href', '/en');
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
    await user.click(await within(menu).findByRole('link', { name: /KI in Data Analytics/ }));
    expect(router.state.location.pathname).toBe('/de/themen/data-analytics');
    expect(screen.getByRole('button', { name: 'Themen' })).toHaveAttribute('aria-expanded', 'false');

    const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' });
    await user.click(within(nav).getByRole('link', { name: 'Blog' }));
    expect(router.state.location.pathname).toBe('/de/blog');
    expect(await screen.findByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument();
  });
});

describe('Ticket #93: cimt × Apple-Design', () => {
  it.each([
    ['de', 'KI verstehen.Sinnvoll einsetzen.', 'Themen entdecken', 'KI-Reifegrad einschätzen'],
    ['en', 'Understand AI.Use it wisely.', 'Explore topics', 'Assess your AI maturity'],
  ])('zeigt auf /%s den Hero ohne dekorative Grafik und behält beide Aktionen', async (lang, title, topics, audit) => {
    renderApp(`/${lang}`);
    const heading = await screen.findByRole('heading', { level: 1, name: title });
    const hero = heading.closest('section')!;
    expect(hero.querySelector('img, svg defs, .hero-visual')).toBeNull();
    expect(within(hero).getByRole('link', { name: topics })).toHaveAttribute('href', '#fokus-title');
    expect(within(hero).getByRole('link', { name: audit })).toHaveAttribute('href', `/${lang}/themen/ai-audit`);
  });

  it.each([
    ['/de', 'Menü'],
    ['/en/blog', 'Menu'],
  ])('klappt auf %s das mobile Menü auf und schließt es mit Esc, Linkwahl und Klick daneben', async (path, label) => {
    const user = userEvent.setup();
    const { router } = renderApp(path);
    const toggle = await screen.findByRole('button', { name: label });
    const menu = document.getElementById(toggle.getAttribute('aria-controls')!)!;
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(menu).not.toHaveClass('is-open');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toHaveClass('is-open');
    expect(within(menu).getByRole('button', { name: /^(Deutsch|English)$/, pressed: true })).toBeInTheDocument();

    // Ein offenes Themenmenü schließt zuerst, das mobile Menü erst mit dem zweiten Esc.
    const topics = within(menu).getByRole('button', { name: path.startsWith('/en') ? 'Topics' : 'Themen' });
    await user.click(topics);
    await user.keyboard('{Escape}');
    expect(topics).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();

    await user.click(toggle);
    await user.click(document.body);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    await user.click(within(menu).getByRole('link', { name: path.startsWith('/en') ? 'Profile' : 'Profil' }));
    expect(router.state.location.pathname).toBe(path.startsWith('/en') ? '/en/profil' : '/de/profil');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('zeigt weder die frühere obere Textleiste noch einen Liquid-Glass-Schalter, aber den Darstellungsschalter', async () => {
    renderApp('/de');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByText(/Perspektiven für die digitale Zukunft/)).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /glass|glas/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dunkle Darstellung' })).toBeInTheDocument();
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
    expect(await screen.findByRole('heading', { level: 1, name: 'KI in Data Analytics' })).toBeInTheDocument();
    expect(screen.getByText(/^KI beantwortet Datenfragen in Alltagssprache/)).toBeInTheDocument();
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
    await screen.findByRole('heading', { level: 1, name: 'KI in der Softwareentwicklung' });
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
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/de/themen/softwareentwicklung',
      '/de/themen/data-analytics',
      '/de/themen/prozessautomatisierung',
      '/de/themen/ki-tipps-und-tricks',
      '/de/themen/modelle-und-kosten',
    ]);
    expect(within(menu).queryByRole('link', { name: /AI Audit/ })).not.toBeInTheDocument();
    await user.click(within(menu).getByRole('link', { name: /KI in Data Analytics/ }));
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

  it('startet ohne gespeicherte Wahl auch bei dunkler Systemeinstellung hell', async () => {
    systemDark(true);
    renderApp('/de');
    expect(await screen.findByRole('button', { name: 'Dunkle Darstellung' })).toHaveAttribute('aria-pressed', 'false');
    expect(theme()).toBe('light');
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

    it('startet ohne gespeicherte Wahl auch bei dunkler Systemeinstellung hell', () => {
      systemDark(true);
      run();
      expect(theme()).toBe('light');
    });

    it('verwendet hell, wenn die Systemeinstellung nicht ermittelbar ist', () => {
      // @ts-expect-error: Browser ohne matchMedia
      window.matchMedia = undefined;
      run();
      expect(theme()).toBe('light');
    });
  });
});
