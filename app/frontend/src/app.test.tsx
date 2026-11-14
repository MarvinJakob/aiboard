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
    ['KI Reifegrad einschätzen', '/de/themen/ai-audit', 'KI Readiness'],
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
    expect(await screen.findByRole('heading', { level: 1, name: 'KI Readiness' })).toBeInTheDocument();
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
    await screen.findByRole('heading', { level: 1, name: 'KI Readiness' });
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'AI Readiness' })).toBeInTheDocument();
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

describe('Anforderung 8 und Ticket #112: KI-Readiness-Übersicht mit aufklappbaren Dimensionen', () => {
  const toggles = () => screen.getAllByRole('button', { expanded: false }).filter((b) => b.classList.contains('dim-acc-toggle'));
  const toggle = (name: RegExp) => screen.getByRole('button', { name });
  const panelOf = (button: HTMLElement) => document.getElementById(button.getAttribute('aria-controls')!)!;

  it('zeigt die Einführung und alle Dimensionen in fester Reihenfolge, anfangs geschlossen', async () => {
    renderApp('/de/themen/ai-audit');
    expect(await screen.findByRole('heading', { level: 2, name: 'Warum eine Selbsteinschätzung?' })).toBeInTheDocument();
    expect(screen.getByText('Das KI-Audit zeigt, welche Fähigkeiten vorhanden sind.')).toBeInTheDocument();
    expect(screen.getByText('Leitsatz 2')).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Die Dimensionen im Überblick' });
    const items = within(list).getAllByRole('listitem');
    // Die Nummer ist dekorativ (aria-hidden); die Reihenfolge trägt die nummerierte Liste.
    expect(items.map((li) => within(li).getByRole('heading', { level: 4 }).querySelector('button')!.textContent)).toEqual([
      '1Strategie und Wirtschaftlichkeit Kurz Strategie',
      '2Betrieb Kurz Betrieb',
    ]);
    expect(within(items[1]).getByRole('button', { name: 'Betrieb Kurz Betrieb' })).toBeInTheDocument();
    expect(toggles()).toHaveLength(2);
    for (const b of toggles()) expect(panelOf(b)).not.toBeVisible();
    expect(screen.queryByText('Einführung Strategie')).not.toBeVisible();
  });

  it('öffnet und schließt die Erklärung auf derselben Seite, ohne den Ablauf zu starten', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit');
    const strategy = await screen.findByRole('button', { name: /Strategie und Wirtschaftlichkeit/ });
    await user.click(strategy);
    expect(strategy).toHaveAttribute('aria-expanded', 'true');
    expect(within(panelOf(strategy)).getByText('Einführung Strategie')).toBeVisible();
    expect(within(panelOf(strategy)).getByText('Organisatorisch')).toBeVisible();
    expect(toggle(/Betrieb/)).toHaveAttribute('aria-expanded', 'false');
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit');
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();

    await user.click(strategy);
    expect(strategy).toHaveAttribute('aria-expanded', 'false');
    expect(panelOf(strategy)).not.toBeVisible();
  });

  it('lässt sich per Tastatur öffnen und schließen', async () => {
    const user = userEvent.setup();
    renderApp('/de/themen/ai-audit');
    const operation = await screen.findByRole('button', { name: /Betrieb/ });
    operation.focus();
    await user.keyboard('{Enter}');
    expect(operation).toHaveAttribute('aria-expanded', 'true');
    expect(panelOf(operation)).toHaveAttribute('id', 'dimension-betrieb-erklaerung');
    expect(within(panelOf(operation)).getByText('Einführung Betrieb')).toBeVisible();
    await user.keyboard(' ');
    expect(operation).toHaveAttribute('aria-expanded', 'false');
  });

  it('startet die Selbsteinschätzung bei der ersten Dimension und erhält die Dimensions-URLs', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit');
    await user.click(await screen.findByRole('button', { name: /Betrieb/ }));
    expect(screen.getByRole('link', { name: 'Reifegrade und Prüffragen: Betrieb' })).toHaveAttribute('href', '/de/themen/ai-audit/betrieb');
    const starts = screen.getAllByRole('link', { name: 'Selbsteinschätzung starten' });
    expect(starts).toHaveLength(2);
    for (const s of starts) expect(s).toHaveAttribute('href', '/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    await user.click(starts[0]);
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(await screen.findByRole('heading', { level: 1, name: 'Strategie und Wirtschaftlichkeit' })).toBeInTheDocument();
  });

  it('erscheint nur beim Thema AI Audit', async () => {
    renderApp('/de/themen/softwareentwicklung');
    await screen.findByRole('heading', { level: 1, name: 'KI in der Softwareentwicklung' });
    expect(screen.queryByRole('heading', { name: 'Warum eine Selbsteinschätzung?' })).not.toBeInTheDocument();
  });
});

describe('Anforderung 9: Seiten für die Audit-Dimensionen', () => {
  it('zeigt Überschrift, Einführung, hervorgehobene Vorteile und die drei Reifegrade', async () => {
    renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(await screen.findByRole('heading', { level: 1, name: 'Strategie und Wirtschaftlichkeit' })).toBeInTheDocument();
    expect(screen.getByText('Einführung Strategie')).toBeInTheDocument();
    const benefits = screen.getByRole('region', { name: 'Ihr Nutzen' });
    expect(within(benefits).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getAllByRole('radio').map((r) => r.closest('label')!.querySelector('strong')!.textContent)).toEqual(['Einfach', 'Strukturiert', 'Intelligent']);
    expect(screen.getByText('Beschreibung Strategie 2')).toBeInTheDocument();
  });

  it('zeigt für unbekannte Dimensionen die Fehlerseite', async () => {
    renderApp('/de/themen/ai-audit/gibt-es-nicht');
    expect(await screen.findByRole('heading', { level: 1, name: 'Seite nicht gefunden' })).toBeInTheDocument();
  });

  it('zeigt auf Englisch die deutsche Fassung mit Hinweis', async () => {
    renderApp('/en/themen/ai-audit/betrieb');
    expect(await screen.findByRole('heading', { level: 1, name: 'Betrieb' })).toBeInTheDocument();
    expect(screen.getByText('The AI Readiness content is not available in English. You are reading the German version.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Level 2 Strukturiert' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show results' })).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('Ticket #113: geführte Selbsteinschätzung mit einem Reifegrad je Dimension', () => {
  const steps = () => within(screen.getByRole('navigation', { name: 'Ablauf der Selbsteinschätzung' })).getAllByRole('listitem');
  const radio = (name: string) => screen.getByRole('radio', { name: new RegExp(`^Stufe \\d ${name}$`) });

  it('startet bei der ersten Dimension, zeigt Fortschritt und keine Vorauswahl', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit');
    await user.click((await screen.findAllByRole('link', { name: 'Selbsteinschätzung starten' }))[0]);
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(await screen.findByText('Selbsteinschätzung · Dimension 1 von 2')).toBeInTheDocument();
    expect(steps().map((li) => li.textContent)).toEqual(['11. Strategie und WirtschaftlichkeitAktuell', '22. BetriebOffen']);
    expect(steps()[0].querySelector('[aria-current="step"]')).not.toBeNull();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument();
    expect(screen.getByText('0 von 2 bewertet')).toBeInTheDocument();
  });

  it('zeigt die Prüffragen je Reifegrad nur als Lesehilfe ohne Antwortfelder', async () => {
    renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    const questions = await screen.findByRole('list', { name: 'Prüffragen zu „Strukturiert“' });
    expect(within(questions).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['2.1 Frage 2.1?', '2.2 Frage 2.2?']);
    expect(screen.getAllByRole('list', { name: /^Prüffragen zu/ })).toHaveLength(3);
    // Nur die drei Reifegrade sind auswählbar; keine Ja/Nein-Felder, kein „Nicht angewendet“.
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/Nicht angewendet|Trifft nicht zu|mit Ja oder Nein/);
  });

  it('erlaubt ohne Auswahl kein Weiter, nennt den Grund und wechselt bei der Auswahl allein nicht', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    const next = await screen.findByRole('button', { name: 'Weiter' });
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveAccessibleDescription('Wählen Sie einen Reifegrad, um fortzufahren.');
    await user.click(next);
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(radio('Einfach')).toHaveFocus();

    await user.click(radio('Strukturiert'));
    expect(radio('Strukturiert')).toBeChecked();
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(next).toHaveAttribute('aria-disabled', 'false');
    expect(next).toHaveAccessibleDescription('Gewählt: Strukturiert');
  });

  it('führt mit Weiter und Zurück durch den Ablauf und erhält Bewertungen für Korrekturen', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    await user.click(await screen.findByRole('radio', { name: 'Stufe 2 Strukturiert' }));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/betrieb');
    expect(await screen.findByText('Selbsteinschätzung · Dimension 2 von 2')).toBeInTheDocument();
    expect(steps().map((li) => li.textContent)).toEqual(['1. Strategie und WirtschaftlichkeitBewertet: Strukturiert', '22. BetriebAktuell']);
    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Zurück' }));
    expect(await screen.findByText('Selbsteinschätzung · Dimension 1 von 2')).toBeInTheDocument();
    expect(radio('Strukturiert')).toBeChecked();
    await user.click(radio('Intelligent'));

    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    await user.click(await screen.findByRole('radio', { name: 'Stufe 1 Einfach' }));
    // Rücksprung über die Schrittliste und wieder vorwärts: Beide Bewertungen bleiben erhalten.
    await user.click(within(screen.getByRole('navigation', { name: 'Ablauf der Selbsteinschätzung' })).getByRole('link', { name: /Strategie und Wirtschaftlichkeit/ }));
    expect(await screen.findByText('Selbsteinschätzung · Dimension 1 von 2')).toBeInTheDocument();
    expect(radio('Intelligent')).toBeChecked();
    expect(screen.getByText('2 von 2 bewertet')).toBeInTheDocument();
  });

  it('verlinkt in der Schrittliste nur bewertete Dimensionen und die nächste offene', async () => {
    renderApp('/de/themen/ai-audit/betrieb');
    const [first, second] = await waitFor(() => steps());
    expect(within(first).getByRole('link', { name: /Strategie und Wirtschaftlichkeit/ })).toHaveAttribute('href', '/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(within(second).queryByRole('link')).not.toBeInTheDocument();
    expect(first).toHaveTextContent('Offen');
  });

  it('zeigt die Auswertung erst, wenn alle Dimensionen bewertet sind', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit/betrieb');
    await user.click(await screen.findByRole('radio', { name: 'Stufe 3 Intelligent' }));
    const show = screen.getByRole('button', { name: 'Auswertung anzeigen' });
    expect(show).toHaveAttribute('aria-disabled', 'true');
    expect(show).toHaveAccessibleDescription('Für die Auswertung fehlen noch: Strategie und Wirtschaftlichkeit. Zur nächsten offenen Dimension');
    await user.click(show);
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/betrieb');

    // Auch direkt aufgerufen zeigt die Auswertung ohne alle Bewertungen kein Ergebnis.
    await router.navigate('/de/themen/ai-audit/auswertung');
    expect(await screen.findByRole('heading', { level: 1, name: 'Auswertung der Selbsteinschätzung' })).toBeInTheDocument();
    expect(screen.getByText(/Bisher bewertet: 1 von 2/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Selbsteinschätzung fortsetzen' }));
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');

    await user.click(await screen.findByRole('radio', { name: 'Stufe 1 Einfach' }));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    await screen.findByText('Selbsteinschätzung · Dimension 2 von 2');
    expect(radio('Intelligent')).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Auswertung anzeigen' }));
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/auswertung');
    const rows = within(await screen.findByRole('table')).getAllByRole('row').slice(1);
    expect(rows.map((r) => [within(r).getByRole('rowheader').textContent, within(r).getByRole('cell').firstElementChild!.firstElementChild!.textContent])).toEqual([
      ['1. Strategie und Wirtschaftlichkeit', '1 – Einfach'],
      ['2. Betrieb', '3 – Intelligent'],
    ]);
    // Nach vollständiger Bewertung führt auch die Schrittliste zur Auswertung (hier die aktuelle Seite).
    expect(within(screen.getByRole('navigation', { name: 'Ablauf der Selbsteinschätzung' })).getByRole('link', { name: 'Auswertung anzeigen' })).toHaveAttribute('aria-current', 'page');
  });

  it('ist per Tastatur bedienbar: Reifegrad mit Pfeiltasten wählen, mit Weiter fortfahren', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    (await screen.findByRole('radio', { name: 'Stufe 1 Einfach' })).focus();
    await user.keyboard(' ');
    expect(radio('Einfach')).toBeChecked();
    await user.keyboard('{ArrowDown}');
    expect(radio('Strukturiert')).toBeChecked();
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    screen.getByRole('button', { name: 'Weiter' }).focus();
    await user.keyboard('{Enter}');
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/betrieb');
  });
});

describe('Ticket #114: Gesamtauswertung als Netzdiagramm', () => {
  const rateAll = async (user: ReturnType<typeof userEvent.setup>, levels: [string, string]) => {
    const { router } = renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    await user.click(await screen.findByRole('radio', { name: levels[0] }));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    await user.click(await screen.findByRole('radio', { name: levels[1] }));
    await user.click(screen.getByRole('button', { name: 'Auswertung anzeigen' }));
    await screen.findByRole('heading', { level: 1, name: 'Auswertung der Selbsteinschätzung' });
    return router;
  };
  const chart = () => screen.getByRole('img', { name: 'Netzdiagramm Ihrer selbst eingeschätzten Reifegrade' });
  const dots = () => [...chart().querySelectorAll('.radar-dot')].map((d) => d.getAttribute('data-level'));
  const axisLabels = () => [...chart().querySelectorAll('.radar-labels text')].map((t) => t.textContent);

  it('zeigt je Dimension eine beschriftete Achse in Ablaufreihenfolge und beschreibt alle Werte', async () => {
    await rateAll(userEvent.setup(), ['Stufe 2 Strukturiert', 'Stufe 3 Intelligent']);
    expect(axisLabels()).toEqual(['1Strategie undWirtschaftlichkeit', '2Betrieb']);
    expect(dots()).toEqual(['2', '3']);
    expect(chart()).toHaveAccessibleDescription('1. Strategie und Wirtschaftlichkeit: 2 – Strukturiert; 2. Betrieb: 3 – Intelligent');
    // Gemeinsame, beschriftete Skala 1 bis 3; kein Reifegrad 0
    expect([...chart().querySelectorAll('.radar-scale text')].map((t) => t.textContent)).toEqual(['1 Einfach', '2 Strukturiert', '3 Intelligent']);
    expect(chart().querySelectorAll('.radar-grid polygon')).toHaveLength(3);
    // Textfassung, Kennzeichnung als Selbsteinschätzung und fachliche Einordnung aus #111
    expect(screen.getByRole('table')).toHaveTextContent('2 – Strukturiert');
    expect(screen.getByText(/Das ist Ihre Selbsteinschätzung/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Nicht überall auf der höchsten Stufe' })).toBeInTheDocument();
    expect(screen.getByText('Unterschiedliche Reifegrade sind normal.')).toBeInTheDocument();
  });

  it.each([
    ['alle Einfach', 'Stufe 1 Einfach', ['1', '1']],
    ['alle Intelligent', 'Stufe 3 Intelligent', ['3', '3']],
  ] as const)('stellt „%s“ exakt dar', async (_, level, expected) => {
    await rateAll(userEvent.setup(), [level, level]);
    expect(dots()).toEqual(expected);
  });

  it('zeigt nach einer Änderung die aktualisierten Werte', async () => {
    const user = userEvent.setup();
    const router = await rateAll(user, ['Stufe 1 Einfach', 'Stufe 2 Strukturiert']);
    expect(dots()).toEqual(['1', '2']);
    await user.click(screen.getByRole('link', { name: 'Ändern: Betrieb' }));
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/betrieb');
    await user.click(await screen.findByRole('radio', { name: 'Stufe 3 Intelligent' }));
    await user.click(screen.getByRole('button', { name: 'Auswertung anzeigen' }));
    await screen.findByRole('heading', { level: 1, name: 'Auswertung der Selbsteinschätzung' });
    expect(dots()).toEqual(['1', '3']);
    expect(chart()).toHaveAccessibleDescription(/2\. Betrieb: 3 – Intelligent/);
  });

  it('zeigt ohne vollständige Bewertung kein Diagramm', async () => {
    renderApp('/de/themen/ai-audit/auswertung');
    await screen.findByText(/Bisher bewertet: 0 von 2/);
    expect(screen.queryByRole('img', { name: /Netzdiagramm/ })).not.toBeInTheDocument();
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
    ['/de/blog', 'Hauptnavigation', '/de/themen/ai-audit', 'KI Readiness'],
    ['/en/blog', 'Main navigation', '/en/themen/ai-audit', 'AI Readiness'],
  ])('öffnet von %s die Audit-Übersicht in der gewählten Sprache', async (path, navName, target, heading) => {
    const user = userEvent.setup();
    const { router } = renderApp(path);
    await user.click(within(await mainNav(navName)).getByRole('link', { name: readinessLabel(path) }));
    expect(router.state.location.pathname).toBe(target);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    const [start] = await screen.findAllByRole('link', { name: path.startsWith('/en') ? 'Start self-assessment' : 'Selbsteinschätzung starten' });
    expect(start).toHaveAttribute('href', `${target}/strategie-und-wirtschaftlichkeit`);
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

  it('erhält direkte Links und den Weg in die Selbsteinschätzung', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await user.click(within(await mainNav()).getByRole('link', { name: 'KI Readiness' }));
    await user.click((await screen.findAllByRole('link', { name: 'Selbsteinschätzung starten' }))[0]);
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(await screen.findByRole('heading', { level: 2, name: 'Reifegrad wählen' })).toBeInTheDocument();
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
    ['/de/blog', 'Menü', '/de/themen/ai-audit', 'KI Readiness'],
    ['/en/blog', 'Menu', '/en/themen/ai-audit', 'AI Readiness'],
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
