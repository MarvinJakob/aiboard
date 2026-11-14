import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { installFakeApi, renderApp } from './test/fakeApi';

describe('Seitenfokus bei verzögert geladenen Readiness-Dimensionen (#122)', () => {
  beforeEach(() => {
    const fetchMock = installFakeApi();
    const original = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.includes('/api/audit/dimensions/')) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return original(input);
    });
  });

  it('setzt den Fokus nach Start mit Enter auf die geladene Dimensionsüberschrift', async () => {
    const user = userEvent.setup();
    renderApp('/de/themen/ai-audit');
    const start = (await screen.findAllByRole('link', { name: 'Selbsteinschätzung starten' }))[0];
    start.focus();
    await user.keyboard('{Enter}');
    const heading = await screen.findByRole('heading', { level: 1, name: 'Strategie und Wirtschaftlichkeit' });
    await waitFor(() => expect(heading).toHaveFocus());
  });

  it('fokussiert nach Weiter und gecachtem Zurück die H1 und erhält die Auswahl', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    const selection = await screen.findByRole('radio', { name: 'Stufe 2 Strukturiert' });
    await user.click(selection);
    expect(selection).toHaveFocus();
    expect(selection).toBeChecked();
    expect(router.state.location.pathname).toBe('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    screen.getByRole('button', { name: 'Weiter' }).focus();
    await user.keyboard('{Enter}');
    const heading = await screen.findByRole('heading', { level: 1, name: 'Betrieb' });
    await waitFor(() => expect(heading).toHaveFocus());

    screen.getByRole('link', { name: 'Zurück' }).focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Strategie und Wirtschaftlichkeit' })).toHaveFocus());
    expect(screen.getByRole('radio', { name: 'Stufe 2 Strukturiert' })).toBeChecked();
  });

  it('übernimmt beim ersten Direktaufruf nach dem Laden keinen Fokus', async () => {
    renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    const language = screen.getByRole('button', { name: 'English' });
    language.focus();
    await screen.findByRole('heading', { level: 1, name: 'Strategie und Wirtschaftlichkeit' });
    expect(language).toHaveFocus();
  });

  it('belässt den Fokus beim Sprachwechsel mit keepPosition auf dem Sprachschalter', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    await screen.findByRole('heading', { level: 1, name: 'Strategie und Wirtschaftlichkeit' });
    const language = screen.getByRole('button', { name: 'English' });
    await user.click(language);
    await screen.findByRole('radio', { name: 'Level 2 Strukturiert' });
    expect(router.state.location.pathname).toBe('/en/themen/ai-audit/strategie-und-wirtschaftlichkeit');
    expect(router.state.location.state).toMatchObject({ keepPosition: true });
    expect(language).toHaveFocus();
  });
});
