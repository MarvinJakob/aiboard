import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { vi } from 'vitest';
import type { Me } from '../api/client';
import { BASENAME, Providers, createQueryClient, routes } from '../App';

export const EDITOR: Me = { id: 1, email: 'redaktion@example.test', role: 'editor', csrfToken: 'csrf-editor' };
export const ADMIN: Me = { id: 2, email: 'admin@example.test', role: 'admin', csrfToken: 'csrf-admin' };
export const PASSWORD = 'richtiges-passwort';

const ACCOUNTS: Record<string, Me> = { [EDITOR.email]: EDITOR, [ADMIN.email]: ADMIN };

export const json = (status: number, body?: unknown) =>
  body === undefined
    ? new Response(null, { status })
    : new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export interface FakeRequest {
  method: string;
  path: string;
  csrf: string | null;
  body?: unknown;
}

export interface FakeState {
  me: Me | null;
  requests: FakeRequest[];
}

export type Handler = (req: FakeRequest, url: URL, state: FakeState) => Response | undefined;

/** Ersetzt fetch durch ein kleines Backend mit Anmeldung. Weitere Endpunkte kommen über handlers dazu. */
export function fakeBackend(me: Me | null = null, ...handlers: Handler[]) {
  const state: FakeState = { me, requests: [] };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (req: Request) => {
      const url = new URL(req.url);
      // Uploads: siehe TestRequest in setup.ts
      const form = (req as Request & { formBody?: FormData }).formBody;
      const text = req.method === 'GET' || form ? '' : await req.clone().text();
      const r: FakeRequest = {
        method: req.method,
        path: url.pathname,
        csrf: req.headers.get('X-CSRF-Token'),
        body: form ?? (text ? JSON.parse(text) : undefined),
      };
      state.requests.push(r);
      if (r.path === '/api/auth/me') {
        return state.me ? json(200, state.me) : json(401, { message: 'Anmeldung erforderlich.' });
      }
      if (r.path === '/api/auth/login' && r.method === 'POST') {
        const { email, password } = r.body as { email: string; password: string };
        const acct = ACCOUNTS[email.trim().toLowerCase()];
        if (acct && password === PASSWORD) {
          state.me = acct;
          return json(200, acct);
        }
        return json(401, { message: 'E-Mail-Adresse oder Passwort ist falsch.' });
      }
      if (r.path === '/api/auth/logout' && r.method === 'POST') {
        if (!state.me) return json(401, { message: 'Anmeldung erforderlich.' });
        if (r.csrf !== state.me.csrfToken) return json(403, { message: 'CSRF-Token fehlt.' });
        state.me = null;
        return json(204);
      }
      if (r.path.startsWith('/api/admin') && !state.me) return json(401, { message: 'Anmeldung erforderlich.' });
      for (const h of handlers) {
        const res = h(r, url, state);
        if (res) return res;
      }
      return json(404, { message: 'Unbekannter Endpunkt.' });
    }),
  );
  return state;
}

/** Rendert das Redaktionsfrontend unter einem Pfad relativ zu /redaktion. */
export function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [BASENAME + path], basename: BASENAME });
  const utils = render(
    <Providers client={createQueryClient()}>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { router, ...utils };
}
