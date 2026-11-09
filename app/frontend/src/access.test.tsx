import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { session } from './api/client';
import { installFakeApi, renderApp } from './test/fakeApi';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Ticket #49: Zugangsschutz vor dem Livegang', () => {
  it('führt zur Anmeldung, wenn die Sitzung abgelaufen ist', async () => {
    const expired = vi.spyOn(session, 'expired').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ message: 'Anmeldung erforderlich.' }), { status: 401 })),
    );
    renderApp('/de/blog');
    await waitFor(() => expect(expired).toHaveBeenCalled());
  });

  it('bleibt mit gültiger Sitzung auf der Seite', async () => {
    const expired = vi.spyOn(session, 'expired').mockImplementation(() => {});
    installFakeApi();
    renderApp('/de/blog');
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(expired).not.toHaveBeenCalled();
  });
});
