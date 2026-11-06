import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client, unwrap } from './client';
import type { components } from './schema';

export type User = components['schemas']['User'];

const USERS_KEY = ['admin', 'users'] as const;

/** Redaktionskonten für Admin-Konten (Anforderung 11). */
export const useUsers = () =>
  useQuery({
    queryKey: USERS_KEY,
    queryFn: () => unwrap(client.GET('/api/admin/users')).then((d) => d.items),
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => unwrap(client.POST('/api/admin/users', { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

export const useSetUserActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      unwrap(client.PATCH('/api/admin/users/{id}', { params: { path: { id } }, body: { active } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};
