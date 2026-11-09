import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, safeTarget } from './lib/target';
import { EDITOR, PASSWORD, fakeBackend, renderAt } from './test/fakeApi';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function login(email: string) {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('E-Mail-Adresse'), email);
  await user.type(screen.getByLabelText('Passwort'), PASSWORD);
  await user.click(screen.getByRole('button', { name: 'Anmelden' }));
}

describe('Ticket #49: Zugangsschutz vor dem Livegang', () => {
  it('erklärt Testpersonen, warum sie sich anmelden sollen', async () => {
    fakeBackend();
    renderAt('/anmelden?weiter=%2Fde%2Fblog');
    expect(await screen.findByText(/Webseite ist noch nicht öffentlich/)).toBeInTheDocument();
    // Der Link zur Webseite würde nur wieder zur Anmeldung führen.
    expect(screen.queryByRole('link', { name: 'Zur Webseite' })).not.toBeInTheDocument();
  });

  it('führt nach der Anmeldung zur ursprünglich aufgerufenen Seite', async () => {
    const open = vi.spyOn(page, 'open').mockImplementation(() => {});
    fakeBackend();
    renderAt('/anmelden?weiter=%2Fde%2Fthemen%2Fai-audit%3Fquiz%3D1');
    await login(EDITOR.email);
    await waitFor(() => expect(open).toHaveBeenCalledWith('/de/themen/ai-audit?quiz=1'));
  });

  it('führt bereits angemeldete Personen direkt zur gemerkten Seite', async () => {
    const open = vi.spyOn(page, 'open').mockImplementation(() => {});
    fakeBackend(EDITOR);
    renderAt('/anmelden?weiter=%2Fde');
    await waitFor(() => expect(open).toHaveBeenCalledWith('/de'));
  });

  it('ignoriert Ziele außerhalb der Webseite', async () => {
    const open = vi.spyOn(page, 'open').mockImplementation(() => {});
    fakeBackend();
    const { router } = renderAt('/anmelden?weiter=%2F%2Fboese.example');
    await login(EDITOR.email);
    expect(await screen.findByRole('heading', { level: 1, name: 'Beiträge' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/redaktion');
    expect(open).not.toHaveBeenCalled();
  });

  it('akzeptiert nur Pfade derselben Webseite', () => {
    expect(safeTarget('/de/blog?x=1')).toBe('/de/blog?x=1');
    for (const bad of [null, '', 'de', '//boese.example', '/\\boese.example', 'https://boese.example', '/a\nb']) {
      expect(safeTarget(bad)).toBeNull();
    }
  });
});
