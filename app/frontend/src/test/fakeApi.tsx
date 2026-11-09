import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { vi } from 'vitest';
import type { AuditDimension, AuditOverview, AuditQuestion, Post, PostSummary, Topic, TopicDetail } from '../api/client';
import { Providers, createQueryClient, routes } from '../App';

type L = 'de' | 'en';

const topicData: Record<string, Record<L, Omit<Topic, 'lang' | 'postCount' | 'slug'>>> = {
  softwareentwicklung: {
    de: { title: 'KI in der Softwareentwicklung', label: 'Softwareentwicklung', summary: 'Wie Sie KI-Assistenten mit Markdown-Regeln, Zugriffsrechten, Tests und Reviews anleiten.', intro: 'Dateien wie `AGENTS.md` geben KI-Assistenten Ziele, Arbeitsabläufe und Grenzen mit. Das Modell kann solche Regeln aber missverstehen oder übergehen. Hier sehen Sie, wie Sie prüfbare Regeln schreiben, Freigaben an Aktionen binden und Grenzen technisch absichern.' },
    en: { title: 'AI in Software Development', label: 'Software Development', summary: 'How to guide AI assistants with Markdown rules, access permissions, tests and reviews.', intro: 'Files such as `AGENTS.md` give AI assistants goals, workflows and boundaries. However, the model can misunderstand or disregard these rules. Here you can learn how to write verifiable rules, tie approvals to actions and enforce boundaries through technical controls.' },
  },
  'ai-audit': {
    de: { title: 'AI Audit für Unternehmen', label: 'AI Audit', summary: 'Kurz Audit', intro: 'Einführung Audit' },
    en: { title: 'AI Audit for Companies', label: 'AI Audit', summary: 'Short audit', intro: 'Intro audit' },
  },
  'data-analytics': {
    de: { title: 'AI in Data Analytics', label: 'Data Analytics', summary: 'Kurz Data', intro: 'Einführung Data Analytics' },
    en: { title: 'AI in Data Analytics', label: 'Data Analytics', summary: 'Short data', intro: 'Intro data analytics' },
  },
  prozessautomatisierung: {
    de: { title: 'Prozessautomatisierung', label: 'Prozessautomatisierung', summary: 'Kurz Automatisierung', intro: 'Einführung Prozessautomatisierung' },
    en: { title: 'Process Automation', label: 'Process Automation', summary: 'Short automation', intro: 'Intro process automation' },
  },
  'modelle-und-kosten': {
    de: { title: 'Modelle und Kosten: Wie finde ich das beste Preis-/Leistungsverhältnis?', label: 'Modelle und Kosten', summary: 'Warum das günstigste Modell nicht automatisch die beste Wahl ist und wie Sie Preis und Leistung selbst vergleichen.', intro: 'Ein niedriger Preis je Token sagt wenig darüber aus, was ein brauchbares Ergebnis kostet. Diese Seite zeigt, welche Kosten in die Rechnung gehören, was öffentliche Vergleiche leisten und wie Sie mit eigenen Testaufgaben das passende Modell finden.' },
    en: { title: 'Models and Costs: How do I find the best price-performance ratio?', label: 'Models and Costs', summary: 'Why the cheapest model is not automatically the best choice and how to compare price and performance yourself.', intro: 'A low price per token says little about what a usable result costs. This page shows which costs belong in the calculation, what public comparisons can and cannot do, and how to find the right model with your own test tasks.' },
  },
};

export interface FakePost {
  slug: string;
  date: string;
  featured: boolean;
  topics: string[];
  text: Partial<Record<L, { title: string; summary: string; body: string }>>;
}

export const POSTS: FakePost[] = [
  {
    slug: 'neu',
    date: '2026-11-03T09:00:00Z',
    featured: true,
    topics: ['softwareentwicklung'],
    text: {
      de: { title: 'Neuester Beitrag', summary: 'Kurztext neu', body: 'Einleitung.\n\n## Abschnitt eins\n\nText.' },
      en: { title: 'Newest article', summary: 'Summary new', body: 'Intro.\n\n## Section one\n\nText.' },
    },
  },
  {
    slug: 'nur-deutsch',
    date: '2026-10-21T09:00:00Z',
    featured: true,
    topics: ['ai-audit', 'softwareentwicklung'],
    text: { de: { title: 'Nur auf Deutsch erschienen', summary: 'Kurztext deutsch', body: 'Deutscher Inhalt.' } },
  },
  {
    slug: 'alt',
    date: '2026-10-02T09:00:00Z',
    featured: false,
    topics: ['ai-audit'],
    text: {
      de: { title: 'Älterer Beitrag', summary: 'Kurztext alt', body: 'Alt.' },
      en: { title: 'Older article', summary: 'Summary old', body: 'Old.' },
    },
  },
];

function pick<T>(m: Partial<Record<L, T>>, want: L): [T, L] {
  for (const l of [want, 'de', 'en'] as L[]) if (m[l]) return [m[l]!, l];
  throw new Error('keine Übersetzung');
}

function topic(slug: string, lang: L, posts: FakePost[]): Topic {
  return { slug, lang, ...topicData[slug][lang], postCount: posts.filter((p) => p.topics.includes(slug)).length };
}

function summary(p: FakePost, lang: L): PostSummary {
  const [tx, l] = pick(p.text, lang);
  return {
    slug: p.slug,
    lang: l,
    title: tx.title,
    summary: tx.summary,
    publishedAt: p.date,
    featured: p.featured,
    topics: p.topics.map((s) => ({ slug: s, lang, title: topicData[s][lang].title, label: topicData[s][lang].label })),
    translations: Object.keys(p.text) as L[],
  };
}

// Audit-Inhalte liegen nur auf Deutsch vor (wie im Backend).
const LEVEL_NAMES = ['Nicht angewendet', 'Einfach', 'Strukturiert', 'Intelligent'];

const question = (id: string, conditional = false): AuditQuestion => ({ id, text: `Frage ${id}?`, conditional });

export const AUDIT_DIMENSIONS: AuditDimension[] = [
  {
    slug: 'strategie-und-wirtschaftlichkeit',
    lang: 'de',
    title: 'Strategie und Wirtschaftlichkeit',
    summary: 'Kurz Strategie',
    category: 'organizational',
    translations: ['de'],
    intro: ['Einführung Strategie'],
    benefits: ['Vorteil Budget', 'Vorteil Priorisierung'],
    notApplied: { level: 0, name: LEVEL_NAMES[0], description: 'Beschreibung Strategie 0', questions: [] },
    levels: [
      { level: 1, name: LEVEL_NAMES[1], description: 'Beschreibung Strategie 1', questions: [question('1.1'), question('1.2')] },
      { level: 2, name: LEVEL_NAMES[2], description: 'Beschreibung Strategie 2', questions: [question('2.1'), question('2.2', true)] },
      { level: 3, name: LEVEL_NAMES[3], description: 'Beschreibung Strategie 3', questions: [question('3.1')] },
    ],
  },
  {
    slug: 'betrieb',
    lang: 'de',
    title: 'Betrieb',
    summary: 'Kurz Betrieb',
    category: 'organizational',
    translations: ['de'],
    intro: ['Einführung Betrieb'],
    benefits: ['Vorteil Verfügbarkeit', 'Vorteil Kosten'],
    notApplied: { level: 0, name: LEVEL_NAMES[0], description: 'Beschreibung Betrieb 0', questions: [] },
    levels: [
      { level: 1, name: LEVEL_NAMES[1], description: 'Beschreibung Betrieb 1', questions: [question('1.1')] },
      { level: 2, name: LEVEL_NAMES[2], description: 'Beschreibung Betrieb 2', questions: [question('2.1')] },
      { level: 3, name: LEVEL_NAMES[3], description: 'Beschreibung Betrieb 3', questions: [question('3.1')] },
    ],
  },
];

function auditOverview(): AuditOverview {
  return {
    lang: 'de',
    translations: ['de'],
    intro: ['Das KI-Audit zeigt, welche Fähigkeiten vorhanden sind.'],
    levels: [1, 2, 3].map((level) => ({ level, name: LEVEL_NAMES[level], motto: `Leitsatz ${level}` })),
    dimensions: AUDIT_DIMENSIONS.map(({ slug, lang, title, summary, category }) => ({ slug, lang, title, summary, category })),
  };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Ersetzt fetch durch eine kleine Nachbildung der öffentlichen API. */
export function installFakeApi(posts: FakePost[] = POSTS) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const lang = (url.searchParams.get('lang') ?? 'de') as L;
    const parts = url.pathname.split('/').filter(Boolean); // api, posts|topics, slug?
    if (parts[1] === 'topics' && parts.length === 2) {
      return json(200, { items: Object.keys(topicData).map((s) => topic(s, lang, posts)) });
    }
    if (parts[1] === 'topics' && parts.length === 3) {
      if (!topicData[parts[2]]) return json(404, { message: 'Thema nicht gefunden.' });
      const detail: TopicDetail = {
        ...topic(parts[2], lang, posts),
        translations: ['de', 'en'],
        posts: posts.filter((p) => p.topics.includes(parts[2])).map((p) => summary(p, lang)),
      };
      return json(200, detail);
    }
    if (parts[1] === 'posts' && parts.length === 2) {
      let items = posts.map((p) => summary(p, lang));
      if (url.searchParams.get('featured') === 'true') {
        items = items.filter((p, i) => i === 0 || p.featured).slice(0, 3);
      }
      return json(200, { items });
    }
    if (parts[1] === 'posts' && parts.length === 3) {
      const p = posts.find((x) => x.slug === parts[2]);
      if (!p) return json(404, { message: 'Beitrag nicht gefunden.' });
      const [tx] = pick(p.text, lang);
      const post: Post = { ...summary(p, lang), bodyMarkdown: tx.body, readingMinutes: 1, updatedAt: p.date };
      return json(200, post);
    }
    if (parts[1] === 'audit' && parts.length === 2) return json(200, auditOverview());
    if (parts[1] === 'audit' && parts[2] === 'dimensions' && parts.length === 4) {
      const d = AUDIT_DIMENSIONS.find((x) => x.slug === parts[3]);
      return d ? json(200, d) : json(404, { message: 'Dimension nicht gefunden.' });
    }
    return json(404, { message: 'Unbekannter Endpunkt.' });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Rendert die Anwendung mit einem Router im Speicher. */
export function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const client = createQueryClient();
  client.setDefaultOptions({ queries: { retry: false, staleTime: Infinity } });
  const view = render(
    <Providers client={client}>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { router, ...view };
}
