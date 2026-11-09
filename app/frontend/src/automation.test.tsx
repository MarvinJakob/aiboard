import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { automation } from './i18n/automation';
import { POSTS, installFakeApi, renderApp, type FakePost } from './test/fakeApi';

beforeEach(() => {
  installFakeApi();
});

const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean).length;

describe('Ticket #77: Themenseite Prozessautomatisierung mit Vorteilen von n8n', () => {
  it('ist über das Themenmenü der Kopfzeile erreichbar', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/blog');
    await user.click(await screen.findByRole('button', { name: 'Themen' }));
    const menu = document.querySelector('.popover') as HTMLElement;
    await user.click(await within(menu).findByRole('link', { name: /Prozessautomatisierung/ }));
    expect(router.state.location.pathname).toBe('/de/themen/prozessautomatisierung');
    expect(await screen.findByRole('heading', { level: 1, name: 'Prozessautomatisierung' })).toBeInTheDocument();
  });

  it('ist über eine Themenkarte auf der Startseite erreichbar', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de');
    const card = await screen.findByRole('link', { name: /Prozessautomatisierung.*Zum Thema/s });
    expect(card).toHaveAttribute('href', '/de/themen/prozessautomatisierung');
    await user.click(card);
    expect(router.state.location.pathname).toBe('/de/themen/prozessautomatisierung');
    expect(await screen.findByRole('heading', { level: 1, name: 'Prozessautomatisierung' })).toBeInTheDocument();
  });

  it.each([
    ['de', 'Prozessautomatisierung', 'Einführung Prozessautomatisierung', 'Was für n8n spricht', 'Noch keine Beiträge'],
    ['en', 'Process Automation', 'Intro process automation', 'Why n8n', 'No articles yet'],
  ] as const)('zeigt auf %s Titel, Einführung, mindestens fünf Vorteile mit Quellen und den leeren Zustand', async (lang, title, intro, benefitsTitle, empty) => {
    renderApp(`/${lang}/themen/prozessautomatisierung`);
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText(intro)).toBeInTheDocument();

    const section = screen.getByRole('region', { name: benefitsTitle });
    const items = within(section).getAllByRole('listitem').filter((li) => li.classList.contains('advantage-item'));
    expect(items.length).toBeGreaterThanOrEqual(5);
    for (const item of items) {
      expect(within(item).getByRole('heading', { level: 3 }).textContent).not.toBe('');
      const text = item.querySelector('p')!.firstChild!.textContent!;
      expect(sentences(text)).toBeGreaterThanOrEqual(1);
      expect(sentences(text)).toBeLessThanOrEqual(2);
      expect(within(item).getAllByRole('link', { name: lang === 'de' ? /^Quelle \d+$/ : /^Source \d+$/ }).length).toBeGreaterThan(0);
    }

    const sources = within(section).getAllByRole('link', { name: /^n8n – / });
    expect(sources).toHaveLength(automation[lang].sources.length);
    for (const s of sources) expect(s.getAttribute('href')).toMatch(/^https:\/\/(docs\.)?n8n\.io\//);
    expect(screen.getByText(empty)).toBeInTheDocument();
  });

  it('springt von einem Quellenverweis zur Quelle, ohne die Seite zu wechseln', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/prozessautomatisierung');
    await screen.findByRole('heading', { level: 1, name: 'Prozessautomatisierung' });
    await user.click(screen.getAllByRole('link', { name: 'Quelle 6' })[0]);
    const source = screen.getByRole('link', { name: 'n8n – Code node' }).closest('li');
    expect(source).toHaveFocus();
    expect(router.state.location.pathname).toBe('/de/themen/prozessautomatisierung');
  });

  it('zeigt veröffentlichte Beiträge zum Thema', async () => {
    const post: FakePost = {
      slug: 'erster-n8n-workflow',
      date: '2026-11-08T09:00:00Z',
      featured: false,
      topics: ['prozessautomatisierung'],
      text: { de: { title: 'Der erste n8n-Workflow', summary: 'Kurztext n8n', body: 'Text.' } },
    };
    installFakeApi([post, ...POSTS]);
    renderApp('/de/themen/prozessautomatisierung');
    expect(await screen.findByRole('link', { name: /Der erste n8n-Workflow/ })).toHaveAttribute('href', '/de/blog/erster-n8n-workflow');
    expect(screen.queryByText('Noch keine Beiträge')).not.toBeInTheDocument();
  });

  it('zeigt die Vorteile von n8n nur auf dieser Themenseite', async () => {
    renderApp('/de/themen/data-analytics');
    await screen.findByRole('heading', { level: 1, name: 'AI in Data Analytics' });
    expect(screen.queryByRole('region', { name: 'Was für n8n spricht' })).not.toBeInTheDocument();
  });
});
