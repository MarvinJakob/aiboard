import createClient from 'openapi-fetch';
import { useQuery } from '@tanstack/react-query';
import type { components, paths } from './schema';
import type { Lang } from '../lib/lang';

export type Topic = components['schemas']['Topic'];
export type TopicRef = components['schemas']['TopicRef'];
export type TopicDetail = components['schemas']['TopicDetail'];
export type PostSummary = components['schemas']['PostSummary'];
export type Post = components['schemas']['Post'];
export type Image = components['schemas']['Image'];
export type AuditOverview = components['schemas']['AuditOverview'];
export type AuditDimensionSummary = components['schemas']['AuditDimensionSummary'];
export type AuditDimension = components['schemas']['AuditDimension'];
export type AuditLevel = components['schemas']['AuditLevel'];
export type AuditQuestion = components['schemas']['AuditQuestion'];
export type AuditCategory = components['schemas']['AuditCategory'];
export type AuditLevelInfo = components['schemas']['AuditLevelInfo'];

/** Fehler mit HTTP-Status, z. B. 404 für unbekannte oder nicht öffentliche Inhalte. */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export const isNotFound = (e: unknown) => e instanceof ApiError && e.status === 404;

// Typsicherer Client aus openapi.yaml. fetch wird erst beim Aufruf aufgelöst, damit Tests es ersetzen können.
const client = createClient<paths>({
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  fetch: (req) => globalThis.fetch(req),
});

/**
 * Führt zur Anmeldung, wenn die Sitzung bei aktivem Zugangsschutz (Ticket #49) abläuft, während die
 * Seite offen ist. Danach geht es zur aktuellen Seite zurück. Als Objekt, damit Tests es ersetzen können.
 */
export const session = {
  expired() {
    const here = window.location.pathname + window.location.search;
    window.location.assign('/redaktion/anmelden?weiter=' + encodeURIComponent(here));
  },
};

async function unwrap<T>(p: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  const { data, error, response } = await p;
  if (response.status === 401 && typeof window !== 'undefined') session.expired();
  if (error !== undefined || data === undefined) {
    const msg = (error as { message?: string } | undefined)?.message ?? response.statusText;
    throw new ApiError(response.status, msg);
  }
  return data;
}

export const useTopics = (lang: Lang) =>
  useQuery({
    queryKey: ['topics', lang],
    queryFn: () => unwrap(client.GET('/api/topics', { params: { query: { lang } } })).then((d) => d.items),
  });

export const useTopic = (slug: string, lang: Lang) =>
  useQuery({
    queryKey: ['topic', slug, lang],
    queryFn: () => unwrap(client.GET('/api/topics/{slug}', { params: { path: { slug }, query: { lang } } })),
  });

export const usePosts = (lang: Lang, featured = false) =>
  useQuery({
    queryKey: ['posts', lang, featured],
    queryFn: () =>
      unwrap(client.GET('/api/posts', { params: { query: { lang, featured } } })).then((d) => d.items),
  });

export const usePost = (slug: string, lang: Lang) =>
  useQuery({
    queryKey: ['post', slug, lang],
    queryFn: () => unwrap(client.GET('/api/posts/{slug}', { params: { path: { slug }, query: { lang } } })),
  });

export const useAudit = (lang: Lang) =>
  useQuery({
    queryKey: ['audit', lang],
    queryFn: () => unwrap(client.GET('/api/audit', { params: { query: { lang } } })),
  });

export const useAuditDimension = (slug: string, lang: Lang) =>
  useQuery({
    queryKey: ['auditDimension', slug, lang],
    queryFn: () =>
      unwrap(client.GET('/api/audit/dimensions/{slug}', { params: { path: { slug }, query: { lang } } })),
  });
