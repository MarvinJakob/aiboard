import { focusManager } from '@tanstack/react-query';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STATUS_REFRESH_MS, type EditorPost } from './api/posts';
import { EDITOR, fakeBackend, json, renderAt, type Handler } from './test/fakeApi';

// Ticket #33: Nach der automatischen Veröffentlichung zeigen Liste und Editor ohne Neuladen „Veröffentlicht“.

const inOneMinute = () => new Date(Date.now() + 60_000).toISOString();

function backend({ scheduled = true } = {}) {
  const scheduledAt = scheduled ? inOneMinute() : undefined;
  const post: EditorPost = {
    id: 7,
    slug: 'geplant',
    status: 'draft',
    featured: false,
    topics: [],
    texts: [{ lang: 'de', title: 'Geplanter Beitrag', summary: 'Kurz', bodyMarkdown: 'Text' }],
    scheduledAt,
    updatedAt: '2026-11-05T09:00:00Z',
  };
  const summary = () => ({
    id: post.id, slug: post.slug, status: post.status, title: post.texts[0].title, featured: false, topics: [],
    translations: ['de'], publishedAt: post.publishedAt, scheduledAt: post.scheduledAt, updatedAt: post.updatedAt,
  });
  const handler: Handler = (r) => {
    if (r.path === '/api/topics') return json(200, { items: [] });
    if (r.path === '/api/admin/posts' && r.method === 'GET') return json(200, { items: [summary()] });
    if (r.path === '/api/admin/posts/7' && r.method === 'GET') return json(200, post);
    return undefined;
  };
  // So verändert der Hintergrundjob den Beitrag.
  const publishByJob = () => {
    post.status = 'published';
    post.publishedAt = post.scheduledAt;
    delete post.scheduledAt;
  };
  return { handler, publishByJob };
}

const gets = (state: { requests: { method: string; path: string }[] }, path: string) =>
  state.requests.filter((r) => r.method === 'GET' && r.path === path).length;

describe('Ticket #33: Status nach automatischer Veröffentlichung', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    act(() => focusManager.setFocused(undefined));
  });

  it('aktualisiert die Beitragsliste innerhalb einer Minute', async () => {
    const { handler, publishByJob } = backend();
    const state = fakeBackend(EDITOR, handler);
    renderAt('/');
    const row = (await screen.findByRole('link', { name: 'Geplanter Beitrag' })).closest('tr') as HTMLElement;
    expect(within(row).getByText('In Arbeit', { selector: '.badge' })).toBeInTheDocument();

    publishByJob();
    await act(() => vi.advanceTimersByTimeAsync(STATUS_REFRESH_MS));
    await waitFor(() => expect(within(row).getByText('Veröffentlicht', { selector: '.badge' })).toBeInTheDocument());
    expect(within(row).queryByText(/^Geplant:/)).not.toBeInTheDocument();
    expect(STATUS_REFRESH_MS).toBeLessThanOrEqual(45_000); // Job (15 s) + Abfrage bleiben unter einer Minute
    expect(gets(state, '/api/admin/posts')).toBe(2);
  });

  it('aktualisiert den Editor und verwirft keine ungespeicherten Eingaben', async () => {
    const { handler, publishByJob } = backend();
    const state = fakeBackend(EDITOR, handler);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderAt('/beitraege/7');
    const body = await screen.findByLabelText('Beitragstext');
    await user.type(body, ' – noch nicht gespeichert');
    expect(screen.getByText('In Arbeit', { selector: '.badge' })).toBeInTheDocument();

    publishByJob();
    await act(() => vi.advanceTimersByTimeAsync(STATUS_REFRESH_MS));
    expect(await screen.findByText('Veröffentlicht', { selector: '.badge' })).toBeInTheDocument();
    const toolbar = screen.getByRole('toolbar', { name: 'Beitrag' });
    expect(within(toolbar).getByText(/Der geplante Zeitpunkt ist erreicht/)).toBeInTheDocument();
    // Ungespeicherte Eingabe bleibt, gespeichert wurde nichts.
    expect(screen.getByLabelText('Beitragstext')).toHaveValue('Text – noch nicht gespeichert');
    expect(state.requests.filter((r) => r.method !== 'GET')).toEqual([]);
    expect(screen.queryByLabelText('Datum und Uhrzeit')).not.toBeInTheDocument();
  });

  it('aktualisiert beim Zurückkehren in den Tab', async () => {
    const { handler, publishByJob } = backend();
    fakeBackend(EDITOR, handler);
    renderAt('/beitraege/7');
    expect(await screen.findByText('In Arbeit', { selector: '.badge' })).toBeInTheDocument();
    act(() => focusManager.setFocused(false));
    publishByJob();
    act(() => focusManager.setFocused(true));
    expect(await screen.findByText('Veröffentlicht', { selector: '.badge' })).toBeInTheDocument();
  });

  it('fragt ohne geplanten Termin nicht regelmäßig nach', async () => {
    const { handler } = backend({ scheduled: false });
    const state = fakeBackend(EDITOR, handler);
    renderAt('/beitraege/7');
    await screen.findByText('In Arbeit', { selector: '.badge' });
    await act(() => vi.advanceTimersByTimeAsync(4 * STATUS_REFRESH_MS));
    expect(gets(state, '/api/admin/posts/7')).toBe(1);
  });
});
