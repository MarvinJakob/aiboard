import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client, unwrap } from './client';
import type { components } from './schema';

export type EditorPost = components['schemas']['EditorPost'];
export type EditorPostSummary = components['schemas']['EditorPostSummary'];
export type PostInput = components['schemas']['PostInput'];
export type PostText = components['schemas']['PostText'];
export type Lang = components['schemas']['Lang'];
export type Topic = components['schemas']['Topic'];

export const LANGS: Lang[] = ['de', 'en'];
export const LANG_NAMES: Record<Lang, string> = { de: 'Deutsch', en: 'Englisch' };

const POSTS_KEY = ['admin', 'posts'] as const;
const postKey = (id: number) => ['admin', 'post', id] as const;

/** Alle Beiträge inklusive Entwürfe (Anforderung 5). */
export const useEditorPosts = () =>
  useQuery({
    queryKey: POSTS_KEY,
    queryFn: () => unwrap(client.GET('/api/admin/posts')).then((d) => d.items),
  });

export const useEditorPost = (id: number | undefined) =>
  useQuery({
    queryKey: postKey(id ?? 0),
    queryFn: () => unwrap(client.GET('/api/admin/posts/{id}', { params: { path: { id: id! } } })),
    enabled: id !== undefined,
  });

/** Themen für die Zuordnung. Die drei Startthemen kommen aus der öffentlichen API. */
export const useTopics = () =>
  useQuery({
    queryKey: ['topics', 'de'],
    queryFn: () => unwrap(client.GET('/api/topics', { params: { query: { lang: 'de' } } })).then((d) => d.items),
    staleTime: 10 * 60_000,
  });

type Action =
  | { kind: 'create'; input: PostInput }
  | { kind: 'save'; id: number; input: PostInput }
  | { kind: 'publish' | 'unpublish' | 'unschedule'; id: number }
  | { kind: 'schedule'; id: number; publishAt: string };

/** Speichern, Veröffentlichen, Zurücknehmen und Planen (Ticket #23). Danach sind Liste und Beitrag aktuell. */
export const usePostAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: Action): Promise<EditorPost> => {
      switch (a.kind) {
        case 'create':
          return unwrap(client.POST('/api/admin/posts', { body: a.input }));
        case 'save':
          return unwrap(client.PUT('/api/admin/posts/{id}', { params: { path: { id: a.id } }, body: a.input }));
        case 'publish':
          return unwrap(client.POST('/api/admin/posts/{id}/publish', { params: { path: { id: a.id } } }));
        case 'unpublish':
          return unwrap(client.POST('/api/admin/posts/{id}/unpublish', { params: { path: { id: a.id } } }));
        case 'schedule':
          return unwrap(client.PUT('/api/admin/posts/{id}/schedule', { params: { path: { id: a.id } }, body: { publishAt: a.publishAt } }));
        case 'unschedule':
          return unwrap(client.DELETE('/api/admin/posts/{id}/schedule', { params: { path: { id: a.id } } }));
      }
    },
    onSuccess: (post) => {
      qc.setQueryData(postKey(post.id), post);
      void qc.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
};

/**
 * Löscht einen Beitrag endgültig (Ticket #24). Danach verschwindet er aus der Liste;
 * sein Eintrag im Cache wird verworfen, damit der Editor ihn nicht mehr anzeigt.
 */
export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unwrap(client.DELETE('/api/admin/posts/{id}', { params: { path: { id } } })),
    onSuccess: (_data, id) => {
      qc.setQueryData<EditorPostSummary[]>(POSTS_KEY, (list) => list?.filter((p) => p.id !== id));
      qc.removeQueries({ queryKey: postKey(id) });
      void qc.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
};
