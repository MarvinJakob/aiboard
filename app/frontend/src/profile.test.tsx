import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { installFakeApi, renderApp } from './test/fakeApi';

beforeEach(() => { installFakeApi(); });

describe('Ticket 41: Profilseite', () => {
  it.each([
    ['de', 'Was meine Perspektive prägt', 'Meine Fragen zu KI', 'Profil'],
    ['en', 'What shapes my perspective', 'My questions about AI', 'Profile'],
  ])('zeigt auf %s die Vorstellung, Stationen und drei Themen', async (lang, experience, topics, title) => {
    renderApp(`/${lang}/profil`);
    expect(await screen.findByRole('heading', { level: 1, name: 'Marvin Jakob' })).toBeInTheDocument();
    const career = screen.getByRole('region', { name: experience });
    expect(within(career).getAllByRole('heading', { level: 3 })).toHaveLength(2);
    expect(career).toHaveTextContent('2023');
    expect(career).toHaveTextContent('2019');
    expect(career).toHaveTextContent('IT Service Owner');
    expect(career).toHaveTextContent('Product Owner');
    const interests = screen.getByRole('region', { name: topics });
    expect(within(interests).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      `/${lang}/themen/softwareentwicklung`, `/${lang}/themen/data-analytics`, `/${lang}/themen/ai-audit`,
    ]);
    expect(document.title).toBe(`Marvin Jakob – ${title} · KI Perspektiven`);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', expect.stringContaining('Marvin Jakob:'));
  });

  it('wechselt beide Profilfassungen und die Metadaten ohne Sprachfallback', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/de/profil');
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(router.state.location.pathname).toBe('/en/profil');
    expect(screen.getByText(/^I am Marvin Jakob/)).toBeInTheDocument();
    expect(document.title).toBe('Marvin Jakob – Profile · KI Perspektiven');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', expect.stringContaining('IT consultant'));
    await user.click(screen.getByRole('button', { name: 'Deutsch' }));
    expect(router.state.location.pathname).toBe('/de/profil');
    expect(screen.getByText(/^Ich bin Marvin Jakob/)).toBeInTheDocument();
  });

  it.each(['de', 'en'])('öffnet alle Themenlinks in %s', async (lang) => {
    const user = userEvent.setup();
    const { router } = renderApp(`/${lang}/profil`);
    for (const slug of ['softwareentwicklung', 'data-analytics', 'ai-audit']) {
      const article = screen.getByRole('article');
      const link = within(article).getAllByRole('link').find((a) => a.getAttribute('href') === `/${lang}/themen/${slug}`)!;
      await user.click(link);
      expect(router.state.location.pathname).toBe(`/${lang}/themen/${slug}`);
      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
      await act(() => router.navigate(`/${lang}/profil`));
      await screen.findByRole('heading', { name: 'Marvin Jakob' });
    }
  });
});
