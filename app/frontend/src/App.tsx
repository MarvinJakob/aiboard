import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate, type RouteObject } from 'react-router';
import { ApiError } from './api/client';
import { LangLayout, Shell } from './components/Layout';
import { DEFAULT_LANG, preferredLang } from './lib/lang';
import { Blog } from './pages/Blog';
import { Home } from './pages/Home';
import { Legal } from './pages/Legal';
import { NotFound } from './pages/NotFound';
import { PostPage } from './pages/Post';
import { TopicPage } from './pages/Topic';

/** Routen der öffentlichen Webseite (ARCHITECTURE.md, Abschnitt 3). Jede Ansicht hat eine echte URL. */
export const routes: RouteObject[] = [
  { path: '/', element: <RootRedirect /> },
  {
    path: '/:lang',
    element: <LangLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'themen/:slug', element: <TopicPage /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <PostPage /> },
      { path: 'impressum', element: <Legal page="imprint" /> },
      { path: 'datenschutz', element: <Legal page="privacy" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '*',
    element: (
      <Shell lang={DEFAULT_LANG}>
        <NotFound />
      </Shell>
    ),
  },
];

/** "/" führt zur gespeicherten Sprache, sonst zur Browsersprache, sonst zu Deutsch. */
function RootRedirect() {
  return <Navigate to={`/${preferredLang()}`} replace />;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        // 404 ist eine Antwort, kein Fehler – nicht wiederholen
        retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
      },
    },
  });
}

export function Providers({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
