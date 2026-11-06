import createClient from 'openapi-fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components, paths } from './schema';

export type Me = components['schemas']['Me'];
export type Role = components['schemas']['Role'];

/** Fehler mit HTTP-Status und der Meldung des Backends. */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export const isStatus = (e: unknown, status: number) => e instanceof ApiError && e.status === status;

// CSRF-Token der aktuellen Sitzung. Es kommt aus /api/auth/me bzw. der Anmeldung und geht bei jedem
// schreibenden Aufruf im Header X-CSRF-Token mit (ARCHITECTURE.md, Abschnitt 4).
let csrfToken = '';
export const setCsrfToken = (t: string) => {
  csrfToken = t;
};

// Typsicherer Client aus openapi.yaml. fetch wird erst beim Aufruf aufgelöst, damit Tests es ersetzen können.
export const client = createClient<paths>({
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  fetch: (req) => globalThis.fetch(req),
  credentials: 'same-origin',
});

client.use({
  onRequest({ request }) {
    if (request.method !== 'GET' && csrfToken) request.headers.set('X-CSRF-Token', csrfToken);
    return request;
  },
});

export async function unwrap<T>(p: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  const { data, error, response } = await p;
  if (!response.ok) {
    const msg = (error as { message?: string } | undefined)?.message ?? response.statusText;
    throw new ApiError(response.status, msg);
  }
  return data as T;
}

export const ME_KEY = ['me'] as const;

/** Angemeldete Person. `null` bedeutet: nicht angemeldet oder Sitzung abgelaufen. */
export const useMe = () =>
  useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<Me | null> => {
      try {
        const me = await unwrap(client.GET('/api/auth/me'));
        setCsrfToken(me.csrfToken);
        return me;
      } catch (e) {
        if (isStatus(e, 401)) {
          setCsrfToken('');
          return null;
        }
        throw e;
      }
    },
    staleTime: 5 * 60_000,
  });

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => unwrap(client.POST('/api/auth/login', { body })),
    onSuccess: (me) => {
      setCsrfToken(me.csrfToken);
      qc.clear();
      qc.setQueryData(ME_KEY, me);
    },
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(client.POST('/api/auth/logout')),
    onSettled: () => {
      setCsrfToken('');
      qc.clear();
      qc.setQueryData(ME_KEY, null);
    },
  });
};

/** Startseite nach der Anmeldung (Anforderung 6): Beitragsliste für die Redaktion, Benutzerverwaltung für Admins. */
export const homeFor = (role: Role) => (role === 'admin' ? '/benutzer' : '/');

export const canEdit = (role: Role) => role === 'editor' || role === 'admin';
export const canManageUsers = (role: Role) => role === 'admin';
