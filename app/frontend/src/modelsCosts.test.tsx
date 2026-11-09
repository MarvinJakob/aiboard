import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import source from '../../../content/Modelle und Kosten.md?raw';
import published from './content/topics/modelle-und-kosten.de.md?raw';
import { topicStyle } from './lib/topicStyle';
import { installFakeApi, renderApp } from './test/fakeApi';

beforeEach(() => { installFakeApi(); });

const PATH = '/de/themen/modelle-und-kosten';
const meta = (key: string) => new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`).exec(source)![1].trim();
const body = source.slice(source.indexOf('\n---') + 4);

describe('Ticket #83: Themenseite Modelle und Kosten', () => {
  it('übernimmt Titel, Untertitel und Einführung wörtlich aus der Textvorlage', async () => {
    expect(published.trim()).toBe(source.trim());
    renderApp(PATH);
    const h1 = await screen.findByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(meta('Titel'));
    expect(screen.getByText(meta('Untertitel'))).toHaveClass('topic-subtitle');
    expect(screen.getByText(meta('Einführung'))).toHaveClass('lead');
    expect(document.title).toContain(meta('Titel'));
  });

  it('zeigt alle Abschnitte in der Reihenfolge der Vorlage mit hervorgehobenem Aufhänger', async () => {
    renderApp(PATH);
    await screen.findByRole('heading', { name: 'Quellen' });
    const article = screen.getByRole('article');
    const expected = [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
    expect(expected).toHaveLength(10);
    expect(within(article).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(expected);
    expect(article).not.toHaveTextContent('Metadaten der Themenseite');

    const hook = article.querySelector('.topic-hook') as HTMLElement;
    expect(hook).toBe(article.querySelector('.prose')!.firstElementChild);
    expect(within(hook).getByText('4,50 oder 450 US-Dollar?', { selector: 'strong' })).toBeInTheDocument();
    expect(hook).toHaveTextContent('Preisbeispiel, Stand 9. November 2026');
    expect(article.querySelector('hr')).toBeNull();

    expect(within(article).getAllByRole('table')).toHaveLength(2);
    expect(within(article).getAllByRole('region', { name: /^Tabelle/ })).toHaveLength(2);
    expect(article.querySelector('pre')).toHaveTextContent('Kosten je akzeptiertem Ergebnis = Gesamtkosten / akzeptierte Ergebnisse');
    const checks = within(article).getAllByRole('checkbox');
    expect(checks).toHaveLength(11);
    expect(checks.every((c) => (c as HTMLInputElement).disabled)).toBe(true);
    expect(within(article).getByRole('checkbox', { name: 'Gesamtkosten je akzeptiertem Ergebnis' })).toBeInTheDocument();
  });

  it('übernimmt Preise und Zahlen unverändert und nennt den Preisstand', async () => {
    renderApp(PATH);
    const article = await screen.findByRole('article');
    expect(article).toHaveTextContent('Preisstand: 9. November 2026');
    const [prices, example] = within(article).getAllByRole('table');
    const rows = within(prices).getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell').map((c) => c.textContent));
    expect(rows).toEqual([...body.matchAll(/^\| (OpenAI|Anthropic|Google) (.+)$/gm)].map((m) =>
      `${m[1]} ${m[2]}`.split('|').map((c) => c.trim().replace(/[`*]/g, '')).filter(Boolean)));
    expect(rows[0]).toEqual(['OpenAI gpt-6-luna', '0,10 $', '0,50 $', '4,50 $']);
    expect(rows.at(-1)).toEqual(['OpenAI gpt-6-astra', '10,00 $', '50,00 $', '450,00 $']);
    expect(example).toHaveTextContent('0,82 $');
    expect(example).toHaveTextContent('0,55 $');
    expect(article).toHaveTextContent('20.000 Aufgaben pro Monat');
  });

  it('verlinkt alle Quellen und führt die Belege per Tastatur zur passenden Quelle', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(PATH);
    await screen.findByRole('heading', { name: 'Quellen' });
    const article = screen.getByRole('article');
    const urls = [...body.split('## Quellen')[1].matchAll(/\]\((https:[^)]+)\)/g)].map((m) => m[1]);
    expect(urls).toHaveLength(12);
    for (let n = 1; n <= 12; n++) {
      const target = document.getElementById(`topic-source-${n}`)!;
      expect(within(target).getByRole('link')).toHaveAttribute('href', urls[n - 1]);
      const references = within(article).getAllByRole('link', { name: `[${n}]` });
      expect(references.every((a) => a.getAttribute('href') === `#${target.id}`)).toBe(true);
    }
    within(article).getAllByRole('link', { name: '[9]' })[0].focus();
    await user.keyboard('{Enter}');
    expect(document.getElementById('topic-source-9')).toHaveFocus();
    expect(router.state.location.pathname).toBe(PATH);
  });

  it('führt relative Verweise der Vorlage zur Datei im Repository', async () => {
    renderApp(PATH);
    const link = await screen.findByRole('link', { name: 'Kosten von KI aus Nutzersicht' });
    expect(link).toHaveAttribute('href',
      'https://github.com/MarvinJakob/aiboard/blob/main/research/2026-11-05%20Kosten%20von%20KI%20aus%20Nutzersicht.md');
  });

  it('zeigt englische Metadaten und den deutschen Seiteninhalt mit Übersetzungshinweis', async () => {
    renderApp('/en/themen/modelle-und-kosten');
    await screen.findByRole('heading', { level: 1, name: 'Models and Costs: How do I find the best price-performance ratio?' });
    expect(screen.getByText('How do I find the best price-performance ratio?')).toHaveClass('topic-subtitle');
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('lang', 'de');
    expect(within(article).getByText('This topic is not available in English. You are reading the German version.')).toBeInTheDocument();
    expect(within(article).getByRole('heading', { name: 'Checkliste für die Entscheidung' })).toBeInTheDocument();
  });

  it('zeigt veröffentlichte Beiträge zum Thema unter dem Text', async () => {
    installFakeApi([{
      slug: 'modellwahl', date: '2026-11-08T09:00:00Z', featured: false, topics: ['modelle-und-kosten'],
      text: { de: { title: 'Modellwahl in der Praxis', summary: 'Kurz', body: 'Text' } },
    }]);
    renderApp(PATH);
    expect(await screen.findByRole('link', { name: /Modellwahl in der Praxis/ })).toHaveAttribute('href', '/de/blog/modellwahl');
  });

  it('ist im Themenmenü verlinkt und hat eine eigene Farbe und ein eigenes Icon', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    await user.click(await screen.findByRole('button', { name: 'Themen' }));
    const menu = document.querySelector('.popover') as HTMLElement;
    await user.click(await within(menu).findByRole('link', { name: /Modelle und Kosten/ }));
    expect(router.state.location.pathname).toBe(PATH);
    expect(topicStyle('modelle-und-kosten')).toEqual({ palette: 'costs', icon: 'coins' });
  });
});
