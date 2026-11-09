import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import source from '../../../content/KI in Data Analytics.md?raw';
import published from './content/topics/data-analytics.de.md?raw';
import { POSTS, installFakeApi, renderApp } from './test/fakeApi';

const PATH = '/de/themen/data-analytics';
const metadata = (name: string) => new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+)`).exec(source)![1].trim();

beforeEach(() => { installFakeApi(); });

describe('Ticket #81: Themenseite Data Analytics', () => {
  it('zeigt die Metadaten der Vorlage wörtlich unter unveränderter Adresse', async () => {
    const { router } = renderApp(PATH);
    expect(await screen.findByRole('heading', { level: 1, name: metadata('Titel') })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(PATH);
    expect(metadata('Slug')).toBe('`data-analytics`');
    expect(screen.getByText(metadata('Untertitel'))).toHaveClass('topic-subtitle');
    expect(screen.getByText(metadata('Einführung'))).toHaveClass('lead');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Themen' }));
    const menu = document.querySelector('.popover') as HTMLElement;
    expect(within(menu).getByRole('link', { name: new RegExp(metadata('Titel')) })).toHaveTextContent(metadata('Kurzbeschreibung'));
  });

  it('übernimmt die verbindliche Vorlage vollständig, in derselben Reihenfolge und mit hervorgehobenem Aufhänger', async () => {
    expect(published.trim()).toBe(source.trim());
    renderApp(PATH);
    await screen.findByRole('heading', { level: 1, name: 'KI in Data Analytics' });
    const article = screen.getByRole('article');
    const expected = [...source.split('\n---')[1].matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
    expect(expected).toEqual(['Was sich ändert', 'Wo KI heute eingesetzt wird', 'Warum Kennzahlendefinitionen entscheidend sind',
      'Wie verlässlich sind die Ergebnisse?', 'Ein sinnvoller Pilot', 'Was das für Analystinnen und Analysten bedeutet', 'Quellen']);
    expect(within(article).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(expected);
    const hook = within(article).getByText('Was genau ist eigentlich „der Umsatz im letzten Monat“?', { selector: 'strong' });
    expect(hook.parentElement).toBe(article.querySelector('.prose--topic > p:first-child'));
    expect(article).not.toHaveTextContent('Metadaten der Themenseite');
  });

  it('übernimmt Benchmark-Zahlen unverändert mit ihren Aussagegrenzen', async () => {
    renderApp(PATH);
    const table = within(await screen.findByRole('region', { name: /Tabelle im Themeninhalt/ })).getByRole('table');
    const rows = within(table).getAllByRole('row').map((row) => row.textContent);
    expect(rows).toHaveLength(3);
    expect(rows[1]).toContain('Spider 2.0, Version vom 12. November 2024');
    expect(rows[1]).toContain('löste 17,0 % der Aufgaben; auf Spider 1.0 erreichte es 91,2 %');
    expect(rows[2]).toContain('DABstep, Version vom 30. Juni 2025');
    expect(rows[2]).toContain('14,55 % Genauigkeit');
    const article = screen.getByRole('article');
    expect(article).toHaveTextContent('Das sind historische Versuchsergebnisse und keine Leistungsgrenze für November 2026.');
    expect(article).toHaveTextContent('die Werte sind nicht direkt vergleichbar');
    expect(article).toHaveTextContent('keine allgemeine Überlegenheit im eigenen Unternehmen');
  });

  it('verknüpft alle Belege mit anklickbaren Quellen und setzt den Tastaturfokus auf die passende Quelle', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(PATH);
    await screen.findByRole('heading', { name: 'Quellen' });
    const article = screen.getByRole('article');
    const external = within(article).getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('https://'));
    expect(external).toHaveLength(14);
    for (let n = 1; n <= 14; n++) {
      const references = within(article).getAllByRole('link', { name: `[${n}]` });
      const target = document.getElementById(`topic-source-${n}`)!;
      expect(target).toContainElement(external[n - 1]);
      expect(references.length).toBeGreaterThan(0);
      expect(references.every((a) => a.getAttribute('href') === `#${target.id}`)).toBe(true);
    }
    expect(external[6]).toHaveAttribute('href', 'https://arxiv.org/abs/2411.07763v1');
    within(article).getAllByRole('link', { name: '[14]' })[0].focus();
    await user.keyboard('{Enter}');
    expect(document.getElementById('topic-source-14')).toHaveFocus();
    expect(router.state.location.pathname).toBe(PATH);
  });

  it('zeigt englische Metadaten und kennzeichnet den deutschen Seiteninhalt', async () => {
    renderApp('/en/themen/data-analytics');
    await screen.findByRole('heading', { level: 1, name: 'AI in Data Analytics' });
    expect(screen.getByText('Understanding and analysing data')).toHaveClass('topic-subtitle');
    expect(screen.getByText(/^AI answers data questions in everyday language/)).toHaveClass('lead');
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('lang', 'de');
    expect(within(article).getByText('This topic is not available in English. You are reading the German version.')).toBeInTheDocument();
    expect(within(article).getByRole('heading', { name: 'Wie verlässlich sind die Ergebnisse?' })).toBeInTheDocument();
  });

  it('zeigt bereits zugeordnete veröffentlichte Beiträge weiterhin unter dem Inhalt', async () => {
    installFakeApi([...POSTS, { ...POSTS[0], slug: 'daten', topics: ['data-analytics'],
      text: { de: { title: 'Datenbeitrag', summary: 'Kurz', body: 'Text.' } } }]);
    renderApp(PATH);
    const link = await screen.findByRole('link', { name: /Datenbeitrag/ });
    expect(link).toHaveAttribute('href', '/de/blog/daten');
    expect(screen.getByRole('article').compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
