import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import source from '../../../content/KI Readiness.md?raw';
import raw from '../../backend/internal/audit/content.json?raw';
import type { AuditCategory, AuditOverview } from './api/client';
import { installFakeApi, renderApp } from './test/fakeApi';

// Use the shipped catalog so these checks cover the source-to-page boundary, not placeholder copy.
const content = JSON.parse(raw) as {
  overview: { de: { intro: string[]; guidance: string[]; levels: { name: string; motto: string }[] } };
  dimensions: { slug: string; category: AuditCategory; released: boolean; texts: { de: { title: string; summary: string; intro: string[] } } }[];
};
const copy = content.overview.de;
const template = source.replace(/\r\n/g, '\n');
const section = (heading: string) => template.split(`## ${heading}\n\n`)[1].split(/^## /m)[0].trim();
const overview: AuditOverview = {
  lang: 'de', translations: ['de'], intro: copy.intro, guidance: copy.guidance.join('\n\n'),
  levels: copy.levels.slice(1).map((level, i) => ({ ...level, level: i + 1 })),
  dimensions: content.dimensions.filter(d => d.released).map(d => ({ slug: d.slug, category: d.category, lang: 'de', title: d.texts.de.title, summary: d.texts.de.summary, intro: d.texts.de.intro })),
};

beforeEach(() => {
  installFakeApi();
  const fallbackFetch = globalThis.fetch;
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (url.pathname === '/api/audit') return new Response(JSON.stringify(overview), { headers: { 'Content-Type': 'application/json' } });
    return fallbackFetch(input, init);
  });
});

describe('Ticket #111: verbindliche Readiness-Inhalte', () => {
  it('übernimmt Ziel, acht Dimensionen und die drei Reifegradtexte aus der Vorlage', () => {
    expect(copy.intro.join('\n\n')).toBe(section('Warum eine Selbsteinschätzung?'));
    const dimensions = section('Die Dimensionen').split(/^### /m).slice(1);
    expect(dimensions).toHaveLength(8);
    dimensions.forEach((block, i) => {
      const [title, ...rest] = block.trim().split('\n');
      const [question, ...intro] = rest.join('\n').trim().split(/\n\n/);
      expect(content.dimensions[i].texts.de).toMatchObject({ title, summary: question.replace(/^\*\*|\*\*$/g, ''), intro });
    });
    for (const level of copy.levels.slice(1)) expect(section('Die Reifegrade')).toContain(level.motto);
  });

  it.each(['de', 'en'])('zeigt auf %s Einleitung vor Dimensionen, direkte Auswahl und Gesamtauswertung', async lang => {
    renderApp(`/${lang}/themen/ai-audit`);
    const region = await screen.findByRole('region', { name: lang === 'de' ? 'Warum eine Selbsteinschätzung?' : 'Why assess your readiness?' });
    expect(within(region).getByText(copy.intro[0])).toBeInTheDocument();
    expect(region).toHaveTextContent('je Dimension genau einen Reifegrad: Einfach, Strukturiert oder Intelligent');
    expect(region).toHaveTextContent('Entscheidungshilfe');
    expect(region).toHaveTextContent('Gesamtauswertung');
    expect(region).not.toHaveTextContent(/Ja\/Nein|alle Fragen.*beantwort|Nicht angewendet/);
    const tables = within(region).getAllByRole('table');
    expect(tables).toHaveLength(2);
    // Bug #117: gleicher Tabellencontainer wie auf Themenseiten, damit Zellen nicht mitten im Wort umbrechen und breite Tabellen per Tastatur scrollbar sind.
    for (const table of tables) {
      expect(table.parentElement).toHaveClass('topic-table');
      expect(table.parentElement).toHaveAttribute('tabindex', '0');
      expect(table.parentElement).toHaveAttribute('aria-label', lang === 'de' ? 'Tabelle im Themeninhalt, horizontal scrollbar' : 'Topic content table, scroll horizontally');
    }
    const toggles = within(region).getAllByRole('button', { expanded: false });
    expect(toggles).toHaveLength(8);
    const intro = within(region).getByText(copy.intro[0]);
    const [start] = within(region).getAllByRole('link', { name: lang === 'de' ? 'Selbsteinschätzung starten' : 'Start self-assessment' });
    expect(intro.compareDocumentPosition(start) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(intro.compareDocumentPosition(toggles[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(start).toHaveAttribute('href', `/${lang}/themen/ai-audit/strategie-und-wirtschaftlichkeit`);
    if (lang === 'en') {
      expect(within(region).getByText('The AI Readiness content is not available in English. You are reading the German version.')).toBeInTheDocument();
      expect(intro.closest('[lang]')).toHaveAttribute('lang', 'de');
      expect(within(region).getByRole('heading', { name: 'So ist die Selbsteinschätzung aufgebaut' }).closest('[lang]')).toHaveAttribute('lang', 'de');
      expect(toggles[0].querySelector('[lang]')).toHaveAttribute('lang', 'de');
    }
  });

  // Ticket #112: Die aufklappbaren Erklärungen zeigen die Dimensionstexte der Vorlage in deren Reihenfolge.
  it('zeigt in der Übersicht je Dimension die Erklärung aus der Vorlage', async () => {
    const user = userEvent.setup();
    renderApp('/de/themen/ai-audit');
    const region = await screen.findByRole('region', { name: 'Warum eine Selbsteinschätzung?' });
    const released = content.dimensions.filter(d => d.released);
    const toggles = within(region).getAllByRole('button', { expanded: false });
    expect(toggles.map(b => b.querySelector('.dim-acc-title')!.textContent)).toEqual(released.map(d => d.texts.de.title));
    for (const [i, button] of toggles.entries()) {
      await user.click(button);
      const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
      for (const p of released[i].texts.de.intro) expect(within(panel).getByText(p)).toBeVisible();
    }
  });
});
