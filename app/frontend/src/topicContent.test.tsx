import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import source from '../../../content/KI in der Softwareentwicklung.md?raw';
import published from './content/topics/softwareentwicklung.de.md?raw';
import { getTopicContent } from './lib/topicContent';
import { installFakeApi, renderApp } from './test/fakeApi';

beforeEach(() => { installFakeApi(); });

describe('Ticket #80: Themenseite Softwareentwicklung', () => {
  it('übernimmt die verbindliche Vorlage vollständig und hält die Abschnittsreihenfolge ein', async () => {
    expect(published.trim()).toBe(source.trim());
    renderApp('/de/themen/softwareentwicklung');
    await screen.findByRole('heading', { level: 1, name: 'KI in der Softwareentwicklung' });
    const article = screen.getByRole('article');
    const expected = [...source.split('\n---')[1].matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
    expect(within(article).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(expected);
    expect(screen.getByText('KI-Assistenten mit Guardrails anleiten')).toHaveClass('topic-subtitle');
    expect(within(article).getByText('Ein Verbot im Prompt verhindert noch keinen Zugriff.', { selector: 'strong' })).toBeInTheDocument();
    expect(within(article).getAllByRole('table')).toHaveLength(2);
    expect(within(article).getAllByRole('checkbox')).toHaveLength(7);
    expect(within(article).getByRole('checkbox', { name: 'Rechte, Netzwerkzugriff und Secrets technisch begrenzt.' })).toBeDisabled();
    expect(article).toHaveTextContent('mehr als 20 Prozent');
    expect(article).not.toHaveTextContent('Metadaten der Themenseite');
    expect(screen.getByRole('link', { name: /Neuester Beitrag/ })).toHaveAttribute('href', '/de/blog/neu');
    expect(screen.getByRole('link', { name: /Nur auf Deutsch erschienen/ })).toHaveAttribute('href', '/de/blog/nur-deutsch');
  });

  it('verknüpft alle Belege und setzt den Tastaturfokus auf die passende Quelle', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/softwareentwicklung');
    await screen.findByRole('heading', { name: 'Quellen' });
    const article = screen.getByRole('article');
    const external = within(article).getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('https://'));
    expect(external).toHaveLength(11);
    for (let n = 1; n <= 11; n++) {
      const references = within(article).getAllByRole('link', { name: `[${n}]` });
      const target = document.getElementById(`topic-source-${n}`)!;
      expect(target).toContainElement(external[n - 1]);
      expect(references.every((a) => a.getAttribute('href') === `#${target.id}`)).toBe(true);
    }
    within(article).getAllByRole('link', { name: '[11]' })[0].focus();
    await user.keyboard('{Enter}');
    expect(document.getElementById('topic-source-11')).toHaveFocus();
    expect(router.state.location.pathname).toBe('/de/themen/softwareentwicklung');
    expect(router.state.location.hash).toBe('');
  });

  it('zeigt englische Metadaten und kennzeichnet den deutschen Seiteninhalt', async () => {
    renderApp('/en/themen/softwareentwicklung');
    await screen.findByRole('heading', { level: 1, name: 'AI in Software Development' });
    expect(screen.getByText('Guide AI assistants with guardrails')).toBeInTheDocument();
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('lang', 'de');
    expect(within(article).getByText('This topic is not available in English. You are reading the German version.')).toBeInTheDocument();
    expect(within(article).getByRole('heading', { name: 'Was Guardrails leisten' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Articles on this topic' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Newest article/ })).toHaveAttribute('href', '/en/blog/neu');
  });

  it('lässt Themen ohne statischen Inhalt unverändert', () => {
    expect(getTopicContent('ai-audit', 'de')).toBeUndefined();
    expect(getTopicContent('data-analytics', 'en')).toBeUndefined();
  });
});
