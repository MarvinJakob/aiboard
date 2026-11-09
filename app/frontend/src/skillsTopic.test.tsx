import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import source from '../../../content/KI Tipps und Tricks.md?raw';
import published from './content/topics/ki-tipps-und-tricks.de.md?raw';
import { getTopicContent } from './lib/topicContent';
import { topicStyle } from './lib/topicStyle';
import { installFakeApi, POSTS, renderApp } from './test/fakeApi';

const slug = 'ki-tipps-und-tricks';
const metadata = (key: string) => new RegExp(`\\*\\*${key}:\\*\\* (.+)`).exec(source)![1].trim();
beforeEach(() => { installFakeApi(); });

describe('Ticket #82: KI-Tipps und Tricks', () => {
  it('zeigt die vollständige Vorlage mit originalen Metadaten, Aufhänger und Skill-Tabelle', async () => {
    expect(published).toBe(source);
    renderApp(`/de/themen/${slug}`);
    await screen.findByRole('heading', { level: 1, name: metadata('Titel') });
    expect(screen.getByText(metadata('Untertitel'))).toHaveClass('topic-subtitle');
    expect(screen.getByText(metadata('Einführung'))).toHaveClass('lead');
    const article = screen.getByRole('article');
    const headings = [...source.split('\n---')[1].matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    expect(within(article).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(headings);
    expect(article.querySelector('.prose > p:first-child > strong')).toHaveTextContent('50,5 statt 33,9 Prozent.');
    const table = within(article).getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(8);
    expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['Skill', 'Wofür', 'Worauf achten']);
    expect(table.parentElement).toHaveAttribute('tabindex', '0');
    expect(article).toHaveTextContent('Herstellerangabe:');
    for (const figure of ['3 %', '82 gepaarte Aufgaben', '8,5 %', '20 %', '10 %', '2 %', '87 Aufgaben', '33,9 %', '50,5 %', '98 öffentlichen Entwicklungsskills', '76,6 %', '76,9 %']) {
      expect(article).toHaveTextContent(figure);
    }
    expect(article).not.toHaveTextContent('Metadaten der Themenseite');
    expect(topicStyle(slug)).toEqual({ palette: 'skills', icon: 'bulb' });
  });

  it('verlinkt alle 22 Quellen einschließlich der Bereiche und fokussiert das Ziel per Tastatur', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(`/de/themen/${slug}`);
    await screen.findByRole('heading', { name: 'Quellen' });
    const article = screen.getByRole('article');
    const urls = [...source.matchAll(/^\d+\. \[.+?\]\((https:\/\/[^)]+)\)/gm)].map((m) => m[1]);
    expect(urls).toHaveLength(22);
    const external = within(article).getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('https://'));
    expect(external.map((a) => a.getAttribute('href'))).toEqual(urls);
    for (let n = 1; n <= 22; n++) {
      const target = document.getElementById(`topic-source-${n}`)!;
      expect(target).toContainElement(external[n - 1]);
      const links = within(article).getAllByRole('link', { name: `[${n}]` });
      expect(links.every((a) => a.getAttribute('href') === `#${target.id}`)).toBe(true);
    }
    const link = within(article).getAllByRole('link', { name: '[10]' })[0];
    link.focus();
    await user.keyboard('{Enter}');
    expect(document.getElementById('topic-source-10')).toHaveFocus();
    expect(router.state.location.hash).toBe('');
    expect(router.state.location.pathname).toBe(`/de/themen/${slug}`);
  });

  it('zeigt englische Metadaten und den deutschen Inhalt mit vorhandenem Übersetzungshinweis', async () => {
    renderApp(`/en/themen/${slug}`);
    await screen.findByRole('heading', { level: 1, name: 'AI Tips and Tricks' });
    expect(screen.getByText('Skills you need to know')).toBeInTheDocument();
    expect(screen.getByText(/^Skills capture recurring workflows/)).toHaveClass('lead');
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('lang', 'de');
    expect(within(article).getByText('This topic is not available in English. You are reading the German version.')).toBeInTheDocument();
    expect(within(article).getByRole('heading', { name: 'Caveman: Was belegt ist und was nicht' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Articles on this topic' })).toBeInTheDocument();
  });

  it('zeigt nur die zugeordneten Beiträge und weiterhin den leeren Zustand', async () => {
    installFakeApi(POSTS.map((p, i) => ({ ...p, topics: i === 0 ? [slug] : p.topics })));
    renderApp(`/de/themen/${slug}`);
    expect(await screen.findByRole('link', { name: /Neuester Beitrag/ })).toHaveAttribute('href', '/de/blog/neu');
    expect(screen.queryByRole('link', { name: /Nur auf Deutsch erschienen/ })).not.toBeInTheDocument();
  });

  it('behält für andere Themen ohne Markdown den bisherigen Aufbau', () => {
    expect(getTopicContent('ai-audit', 'de')).toBeUndefined();
    expect(getTopicContent('unbekannt', 'en')).toBeUndefined();
  });
});
