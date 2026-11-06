import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { vi } from 'vitest';
import type { Post, PostSummary, Topic, TopicDetail } from '../api/client';
import { Providers, createQueryClient, routes } from '../App';

type L = 'de' | 'en';

const topicData: Record<string, Record<L, Omit<Topic, 'lang' | 'postCount' | 'slug'>>> = {
  softwareentwicklung: {
    de: { title: 'AI in der Softwareentwicklung', label: 'Softwareentwicklung', summary: 'Kurz SE', intro: 'Einführung Softwareentwicklung' },
    en: { title: 'AI in Software Development', label: 'Software Development', summary: 'Short SE', intro: 'Intro software development' },
  },
  'ai-audit': {
    de: { title: 'AI Audit für Unternehmen', label: 'AI Audit', summary: 'Kurz Audit', intro: 'Einführung Audit' },
    en: { title: 'AI Audit for Companies', label: 'AI Audit', summary: 'Short audit', intro: 'Intro audit' },
  },
  'data-analytics': {
    de: { title: 'AI in Data Analytics', label: 'Data Analytics', summary: 'Kurz Data', intro: 'Einführung Data Analytics' },
    en: { title: 'AI in Data Analytics', label: 'Data Analytics', summary: 'Short data', intro: 'Intro data analytics' },
  },
};

interface FakePost {
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
