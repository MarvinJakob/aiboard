import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { switchLangPath } from './lib/lang';
import themeScript from '../public/theme.js?raw';
import landingSource from '../../../content/Landingpage_v03.md?raw';
import { installFakeApi, renderApp } from './test/fakeApi';

beforeEach(() => {
  installFakeApi();
});

// Ticket #101: Verbindliche Textvorlage der Startseite, Stand 10. November 2026.
// Jede nicht leere Zeile eines Themas ist ein Absatz; „**…**“ ist die Leitfrage, „*…*“ eine Hervorhebung, „-> “ ein Link.
const TEMPLATE = landingSource.replace(/\r\n/g, '\n');
const templateSection = (title: string) => TEMPLATE.split(/^## /m).find((part) => part.startsWith(`${title}\n`))!.split('\n').slice(1).map((line) => line.trim()).filter(Boolean);
const TEMPLATE_TOPICS = [
  ['Data Analytics', 'data-analytics'],
  ['Softwareentwicklung', 'softwareentwicklung'],
  ['Modelle und Kosten', 'modelle-und-kosten'],
].map(([title, slug]) => {
  const lines = templateSection(title);
  return {
    title,
    slug,
    question: lines.find((l) => l.startsWith('**'))!.replace(/\*\*/g, ''),
    paragraphs: lines.filter((l) => !l.startsWith('**') && !l.startsWith('->')),
    link: lines.find((l) => l.startsWith('->'))!.replace(/^->\s*/, ''),
  };
});
const plain = (line: string) => line.replace(/\*/g, '');
const emphasis = (line: string) => [...line.matchAll(/\*([^*]+)\*/g)].map((m) => m[1]);

describe('Ticket #101: Startseite nach content/Landingpage_v03.md und mock/landing_v03', () => {
  it('zeigt den vollständigen Hero der Vorlage und alle vier Einstiege', async () => {
    const { router } = renderApp('/de');
    const [hook, display1, display2, lead] = templateSection('Titel').filter((l) => !l.startsWith('->'));
    const h1 = await screen.findByRole('heading', { level: 1, name: `${display1}${display2}` });
    const hero = h1.closest('section')!;
    expect(within(hero).getByText(hook)).toHaveClass('home-hook');
    expect(hero.querySelector('.home-lead')!.textContent!.replace(/\s+/g, ' ')).toBe(lead);
    expect(within(hero).getByRole('link', { name: 'Themen entdecken' })).toHaveAttribute('href', '#themen');
    expect(within(hero).getByRole('link', { name: 'News' })).toHaveAttribute('href', '/de/blog');
    expect(within(hero).getByRole('link', { name: 'KI Reifegrad einschätzen' })).toHaveAttribute('href', '/de/themen/ai-audit');
    expect(within(hero).getByRole('link', { name: 'Über mich' })).toHaveAttribute('href', '/de/profil');
    expect(document.title).toBe('KI verstehen. Sinnvoll einsetzen. · KI Perspektiven');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', lead);
    expect(router.state.location.pathname).toBe('/de');
  });

  it('übernimmt Leitfragen, alle Absätze, Hervorhebungen und Artikel-Links der Vorlage unverändert und vollständig sichtbar', async () => {
    renderApp('/de');
    await screen.findByRole('heading', { level: 1 });
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Gute Fragen.Neue Perspektiven.',
      ...TEMPLATE_TOPICS.map((tp) => tp.question),
      'KI-Reifegradeinschätzen.',
      'Marvin Jakob.',
    ]);
    TEMPLATE_TOPICS.forEach((tp, i) => {
      const section = screen.getByRole('region', { name: tp.question });
      expect(section.querySelector('.topic-eyebrow')).toHaveTextContent(`0${i + 1} ${tp.title}`);
      const paragraphs = [...section.querySelectorAll('.editorial-text p')];
      expect(paragraphs.map((p) => p.textContent)).toEqual(tp.paragraphs.map(plain));
      expect([...section.querySelectorAll('.editorial-text em')].map((em) => em.textContent)).toEqual(tp.paragraphs.flatMap(emphasis));
      expect(section.querySelector('details, [hidden], [aria-expanded]')).toBeNull();
      expect(within(section).getByRole('link', { name: tp.link })).toHaveAttribute('href', `/de/themen/${tp.slug}`);
    });
  });

  it('zeigt Themenindex, KI-Reifegrad-Banner und Profil-Teaser ohne Grafiken (Ticket #118)', async () => {
    renderApp('/de');
    await screen.findByRole('heading', { level: 1 });
    const index = screen.getByRole('navigation', { name: 'Direkt zu den Themen' });
    expect(within(index).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['01Data AnalyticsUnternehmenswissen nutzbar machen', '#data-analytics'],
      ['02SoftwareentwicklungMit Agenten zusammenarbeiten', '#softwareentwicklung'],
      ['03Modelle und KostenDen Aufwand als Ganzes verstehen', '#modelle-und-kosten'],
    ]);
    const audit = screen.getByRole('region', { name: 'KI-Reifegradeinschätzen.' });
    expect(within(audit).getByRole('link', { name: 'Zum KI-Audit' })).toHaveAttribute('href', '/de/themen/ai-audit');
    expect(within(within(audit).getByRole('list', { name: 'Drei Reifegrade' })).getAllByRole('listitem').map((li) => li.querySelector('strong')!.textContent)).toEqual(['Einfach', 'Strukturiert', 'Intelligent']);
    const profile = screen.getByRole('region', { name: 'Marvin Jakob.' });
    expect(within(profile).getByRole('link', { name: 'Über mich' })).toHaveAttribute('href', '/de/profil');

    const main = screen.getByRole('main');
    expect(within(main).queryByRole('heading', { name: 'Was KI gerade spannend macht.' })).not.toBeInTheDocument();
    expect(within(main).queryByRole('heading', { name: 'Was ist KI – und was kann man damit machen?' })).not.toBeInTheDocument();
    expect(main.querySelector('.topics, .basics, .limits')).toBeNull();
    const hrefs = [...main.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.filter((h) => /\.md$|mock\/|prozessautomatisierung|ki-tipps-und-tricks|^#$|^$/.test(h))).toEqual([]);
  });

  it.each([
    ['Themen entdecken', 'Gute Fragen.Neue Perspektiven.'],
    ['01Data AnalyticsUnternehmenswissen nutzbar machen', TEMPLATE_TOPICS[0].question],
    ['02SoftwareentwicklungMit Agenten zusammenarbeiten', TEMPLATE_TOPICS[1].question],
    ['03Modelle und KostenDen Aufwand als Ganzes verstehen', TEMPLATE_TOPICS[2].question],
  ])('springt mit „%s“ zum Abschnitt und setzt dort den Fokus, ohne die URL zu ändern', async (link, heading) => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('link', { name: link }));
    expect(screen.getByRole('heading', { level: 2, name: heading })).toHaveFocus();
    expect(router.state.location.pathname).toBe('/de');
    expect(router.state.location.hash).toBe('');
  });

  it.each(TEMPLATE_TOPICS.map((tp) => [tp.link, tp.slug]))('„%s“ öffnet die vorhandene Themenseite', async (link, slug) => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('link', { name: link }));
    expect(router.state.location.pathname).toBe(`/de/themen/${slug}`);
    expect(await screen.findByRole('heading', { level: 1 })).not.toHaveTextContent('Seite nicht gefunden');
  });

  it.each([
    ['News', '/de/blog', 'Blog'],
    ['KI Reifegrad einschätzen', '/de/themen/ai-audit', 'AI Audit für Unternehmen'],
    ['Über mich', '/de/profil', 'Marvin Jakob'],
  ])('„%s“ führt zu %s', async (link, path, heading) => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    const hero = (await screen.findByRole('heading', { level: 1 })).closest('section')!;
    await user.click(within(hero).getByRole('link', { name: link }));
    expect(router.state.location.pathname).toBe(path);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('ist vollständig auf Englisch verfügbar und behält die Sprache beim Wechsel und Navigieren', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(router.state.location.pathname).toBe('/en');
    expect(await screen.findByRole('heading', { level: 1, name: 'Understand AI.Use it wisely.' })).toBeInTheDocument();
    expect(screen.getByText('AI can do a lot. What matters is how we use it.')).toBeInTheDocument();
    expect(document.title).toBe('Understand AI. Use it wisely. · KI Perspektiven');
    const questions = [
      'What do you keep having to explain to AI so that it understands your work?',
      'If AI takes the boring work off our hands, will software development finally become more creative?',
      'What does a cheap AI model cost us if we have to rework every result?',
    ];
    questions.forEach((question, i) => {
      const section = screen.getByRole('region', { name: question });
      expect(section.querySelectorAll('.editorial-text p')).toHaveLength(TEMPLATE_TOPICS[i].paragraphs.length);
      expect(within(section).getByRole('link', { name: /^Read the article:/ })).toHaveAttribute('href', `/en/themen/${TEMPLATE_TOPICS[i].slug}`);
    });
    const hero = screen.getByRole('heading', { level: 1 }).closest('section')!;
    expect(within(hero).getByRole('link', { name: 'News' })).toHaveAttribute('href', '/en/blog');
    expect(within(hero).getByRole('link', { name: 'Assess your AI maturity' })).toHaveAttribute('href', '/en/themen/ai-audit');
    expect(within(hero).getByRole('link', { name: 'About me' })).toHaveAttribute('href', '/en/profil');
    await user.click(within(hero).getByRole('link', { name: 'News' }));
    expect(router.state.location.pathname).toBe('/en/blog');
  });

  it.each(['de', 'en'])('zeigt auf /%s keine Quellenverweise (#91) und keine Grafiken (#118)', async (lang) => {
    renderApp(`/${lang}`);
    await screen.findByRole('heading', { level: 1 });
    const main = screen.getByRole('main');
    expect(main.querySelector('sup, .fn, [id^="quelle-"]')).toBeNull();
    expect(main.querySelector('img, svg, picture, canvas, [role="img"], .editorial-art')).toBeNull();
    expect(within(main).queryByRole('heading', { name: /^(Quellen|Sources)$/ })).not.toBeInTheDocument();
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
    ['de', 'KI verstehen.Sinnvoll einsetzen.', 'Themen entdecken', 'KI Reifegrad einschätzen'],
    ['en', 'Understand AI.Use it wisely.', 'Explore topics', 'Assess your AI maturity'],
  ])('zeigt auf /%s den Hero ohne dekorative Grafik und behält beide Aktionen', async (lang, title, topics, audit) => {
    renderApp(`/${lang}`);
    const heading = await screen.findByRole('heading', { level: 1, name: title });
    const hero = heading.closest('section')!;
    expect(hero.querySelector('img, svg defs, .hero-visual')).toBeNull();
    expect(within(hero).getByRole('link', { name: topics })).toHaveAttribute('href', '#themen');
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

describe('Tickets #21 und #110: KI Readiness als eigener Navigationseintrag', () => {
  const mainNav = async (name = 'Hauptnavigation') => screen.findByRole('navigation', { name });
  // Ticket #110: Der frühere Eintrag „AI Audit“ heißt jetzt „KI Readiness“ (englisch „AI Readiness“).
  const readinessLabel = (path: string) => (path.startsWith('/en') ? 'AI Readiness' : 'KI Readiness');

  it.each(['/de', '/de/blog', '/de/blog/neu', '/de/themen/softwareentwicklung', '/de/impressum', '/de/gibt-es-nicht'])(
    'zeigt auf %s den Eintrag „KI Readiness“ neben Themen und Blog',
    async (path) => {
      renderApp(path);
      const nav = await mainNav();
      const audit = within(nav).getByRole('link', { name: 'KI Readiness' });
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
    await user.click(within(await mainNav(navName)).getByRole('link', { name: readinessLabel(path) }));
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
      '/de/themen/modelle-und-kosten',
    ]);
    expect(within(menu).queryByRole('link', { name: /AI Audit|Readiness/ })).not.toBeInTheDocument();
    await user.click(within(menu).getByRole('link', { name: /KI in Data Analytics/ }));
    expect(router.state.location.pathname).toBe('/de/themen/data-analytics');
  });

  // Übersicht: Wurzelpfad. Selbsteinschätzung und Auswertung liegen auf den Dimensionsseiten darunter.
  it.each([
    ['/de/themen/ai-audit', 'page'],
    ['/de/themen/ai-audit/strategie-und-wirtschaftlichkeit', 'true'],
    ['/en/themen/ai-audit/betrieb', 'true'],
  ])('markiert auf %s „KI Readiness“ als aktiv und „Themen“ nicht', async (path, current) => {
    renderApp(path);
    const nav = await mainNav(path.startsWith('/en') ? 'Main navigation' : 'Hauptnavigation');
    const audit = within(nav).getByRole('link', { name: readinessLabel(path) });
    expect(audit).toHaveAttribute('aria-current', current);
    expect(audit).toHaveClass('is-active');
    expect(within(nav).getByRole('button', { name: path.startsWith('/en') ? 'Topics' : 'Themen' })).not.toHaveClass('is-active');
  });

  it('markiert auf anderen Themenseiten weiterhin „Themen“ und nicht „KI Readiness“', async () => {
    renderApp('/de/themen/softwareentwicklung');
    const nav = await mainNav();
    expect(within(nav).getByRole('button', { name: 'Themen' })).toHaveClass('is-active');
    expect(within(nav).getByRole('link', { name: 'KI Readiness' })).not.toHaveAttribute('aria-current');
  });

  it('erhält direkte Links und den Weg zu Dimensionen und Quiz', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await user.click(within(await mainNav()).getByRole('link', { name: 'KI Readiness' }));
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
    expect(within(nav).getByRole('link', { name: 'KI Readiness' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit');
  });

  it.each([
    ['/de/blog', 'Menü', '/de/themen/ai-audit', 'AI Audit für Unternehmen'],
    ['/en/blog', 'Menu', '/en/themen/ai-audit', 'AI Audit for Companies'],
  ])('öffnet im mobilen Menü auf %s die Übersicht und schließt das Menü danach', async (path, menuLabel, target, heading) => {
    const user = userEvent.setup();
    const { router } = renderApp(path);
    const toggle = await screen.findByRole('button', { name: menuLabel });
    const menu = document.getElementById(toggle.getAttribute('aria-controls')!)!;
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(within(menu).getByRole('link', { name: readinessLabel(path) }));
    expect(router.state.location.pathname).toBe(target);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(menu).not.toHaveClass('is-open');
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('führt den Startseitenlink exakt wie in der Vorlage und öffnet ihn per Tastatur', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    const label = templateSection('Titel').find((l) => l.includes('Reifegrad'))!.replace(/^->\s*/, '');
    expect(label).toBe('KI Reifegrad einschätzen');
    const hero = (await screen.findByRole('heading', { level: 1 })).closest('section')!;
    within(hero).getByRole('link', { name: label }).focus();
    await user.keyboard('{Enter}');
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit');
    expect(within(await mainNav()).getByRole('link', { name: 'KI Readiness' })).toHaveAttribute('aria-current', 'page');
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

describe('Ticket #102: Prozessautomatisierung und KI-Tipps und Tricks entfernt', () => {
  const REMOVED = ['prozessautomatisierung', 'ki-tipps-und-tricks'];
  const REMOVED_NAMES = /Prozessautomatisierung|Process Automation|KI-Tipps und Tricks|AI Tips and Tricks/;

  it.each(['de', 'en'])('verlinkt die Themen in %s weder in Themenmenü, Startseite noch Footer', async (lang) => {
    const user = userEvent.setup();
    renderApp(`/${lang}`);
    await user.click(await screen.findByRole('button', { name: lang === 'de' ? 'Themen' : 'Topics' }));
    const menu = document.querySelector('.popover') as HTMLElement;
    await within(menu).findAllByRole('link');
    const footer = screen.getByRole('contentinfo');
    await within(footer).findByRole('link', { name: lang === 'de' ? 'KI in Data Analytics' : 'AI in Data Analytics' });
    const hrefs = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
    for (const slug of REMOVED) expect(hrefs.filter((h) => h.includes(slug))).toEqual([]);
    expect(document.body).not.toHaveTextContent(REMOVED_NAMES);
  });

  it.each(REMOVED.flatMap((slug) => ['de', 'en'].map((lang) => `/${lang}/themen/${slug}`)))('zeigt für %s die Nicht-gefunden-Seite', async (path) => {
    renderApp(path);
    const name = path.startsWith('/de') ? 'Seite nicht gefunden' : 'Page not found';
    expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/n8n|Skills, die Sie kennen sollten/);
  });
});
