import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EditorPost, PostInput } from './api/posts';
import { EDITOR, fakeBackend, json, renderAt, type FakeRequest, type Handler } from './test/fakeApi';

afterEach(() => vi.unstubAllGlobals());

const TOPICS = [
  { slug: 'softwareentwicklung', title: 'AI in der Softwareentwicklung', label: 'Softwareentwicklung' },
  { slug: 'ai-audit', title: 'AI Audit für Unternehmen', label: 'AI Audit' },
  { slug: 'data-analytics', title: 'AI in Data Analytics', label: 'Data Analytics' },
].map((t) => ({ ...t, lang: 'de', summary: '', intro: '', postCount: 0 }));

/** Kleines Beitrags-Backend im Speicher mit denselben Regeln wie der Server. */
function postsBackend(initial: EditorPost[] = []) {
  const posts = new Map(initial.map((p) => [p.id, structuredClone(p)]));
  let nextId = 100;
  const now = () => new Date('2026-11-06T10:00:00Z').toISOString();
  const handler: Handler = (r: FakeRequest) => {
    if (r.path === '/api/topics') return json(200, { items: TOPICS });
    if (r.method !== 'GET' && r.csrf !== EDITOR.csrfToken) return json(403, { message: 'CSRF-Token fehlt.' });
    if (r.path === '/api/admin/posts' && r.method === 'GET') {
      return json(200, {
        items: [...posts.values()].map((p) => ({
          id: p.id, slug: p.slug, status: p.status, title: p.texts[0]?.title ?? '', featured: p.featured,
          topics: p.topics, translations: p.texts.map((t) => t.lang), publishedAt: p.publishedAt, updatedAt: p.updatedAt,
        })),
      });
    }
    if (r.path === '/api/admin/posts' && r.method === 'POST') {
      const input = r.body as PostInput;
      if (!input.texts.some((t) => t.title)) return json(422, { message: 'Bitte mindestens einen Titel angeben.' });
      const p: EditorPost = {
        id: nextId++, slug: input.slug || input.texts[0].title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: 'draft', featured: input.featured, topics: input.topics, texts: input.texts, updatedAt: now(),
      };
      posts.set(p.id, p);
      return json(201, p);
    }
    const m = r.path.match(/^\/api\/admin\/posts\/(\d+)(?:\/(publish|unpublish))?$/);
    if (!m) return undefined;
    const p = posts.get(Number(m[1]));
    if (!p) return json(404, { message: 'Beitrag nicht gefunden.' });
    if (r.method === 'GET') return json(200, p);
    if (r.method === 'DELETE' && !m[2]) {
      posts.delete(p.id);
      return new Response(null, { status: 204 });
    }
    if (r.method === 'PUT') {
      const input = r.body as PostInput;
      Object.assign(p, { featured: input.featured, topics: input.topics, texts: input.texts, updatedAt: now() });
      if (input.slug) p.slug = input.slug;
      return json(200, p);
    }
    if (m[2] === 'publish') {
      const incomplete = p.texts.find((t) => !t.title || !t.summary || !t.bodyMarkdown);
      if (!p.texts.length || incomplete) return json(422, { message: 'Zum Veröffentlichen fehlt in der Fassung Deutsch: Kurztext, Beitragstext.' });
      Object.assign(p, { status: 'published', publishedAt: p.publishedAt ?? now(), updatedAt: now() });
      return json(200, p);
    }
    if (m[2] === 'unpublish') {
      Object.assign(p, { status: 'draft', updatedAt: now() });
      return json(200, p);
    }
    return undefined;
  };
  return { posts, handler };
}

const DRAFT: EditorPost = {
  id: 7,
  slug: 'erster-entwurf',
  status: 'draft',
  featured: false,
  topics: ['ai-audit'],
  texts: [{ lang: 'de', title: 'Erster Entwurf', summary: 'Kurz', bodyMarkdown: 'Text' }],
  updatedAt: '2026-11-05T09:00:00Z',
};

const PUBLISHED: EditorPost = {
  ...DRAFT,
  id: 8,
  slug: 'veroeffentlicht',
  status: 'published',
  texts: [{ lang: 'de', title: 'Schon online', summary: 'Kurz', bodyMarkdown: 'Alter Text' }],
  publishedAt: '2026-11-01T09:00:00Z',
};

const toolbar = () => screen.getByRole('toolbar', { name: 'Beitrag' });

describe('Anforderung 5: Redaktionssystem', () => {
  it('listet Entwürfe und veröffentlichte Beiträge mit Status', async () => {
    const { handler } = postsBackend([DRAFT, PUBLISHED]);
    fakeBackend(EDITOR, handler);
    renderAt('/');
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByRole('link', { name: 'Erster Entwurf' })).toHaveAttribute('href', '/redaktion/beitraege/7');
    expect(within(rows[0]).getByText('Entwurf')).toBeInTheDocument();
    expect(within(rows[0]).getByText('AI Audit')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Veröffentlicht')).toBeInTheDocument();
  });

  it('speichert einen neuen Beitrag als Entwurf, öffnet ihn erneut und bearbeitet ihn weiter', async () => {
    const { posts, handler } = postsBackend();
    fakeBackend(EDITOR, handler);
    const { router } = renderAt('/beitraege/neu');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Titel'), 'Mein Entwurf');
    await user.type(screen.getByLabelText('Kurztext'), 'Kurz gesagt');
    await user.click(await screen.findByRole('checkbox', { name: 'AI in Data Analytics' }));
    await user.click(within(toolbar()).getByRole('button', { name: 'Speichern' }));

    expect(await screen.findByText('Entwurf gespeichert.')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/redaktion/beitraege/100');
    expect(posts.get(100)).toMatchObject({ status: 'draft', topics: ['data-analytics'] });
    expect(screen.getByText('Entwurf', { selector: '.badge' })).toBeInTheDocument();

    // Erneut öffnen über die Liste und weiterbearbeiten
    await user.click(screen.getByRole('link', { name: /Alle Beiträge/ }));
    await user.click(await screen.findByRole('link', { name: 'Mein Entwurf' }));
    const body = await screen.findByLabelText('Beitragstext');
    expect(screen.getByLabelText('Titel')).toHaveValue('Mein Entwurf');
    await user.type(body, 'Weiter geschrieben.');
    await user.click(within(toolbar()).getByRole('button', { name: 'Speichern' }));
    expect(await screen.findByText('Entwurf gespeichert.')).toBeInTheDocument();
    expect(posts.get(100)?.texts[0].bodyMarkdown).toBe('Weiter geschrieben.');
  });

  it('ändert die Themenzuordnung und speichert die englische Fassung getrennt', async () => {
    const { posts, handler } = postsBackend([DRAFT]);
    fakeBackend(EDITOR, handler);
    renderAt('/beitraege/7');
    const user = userEvent.setup();
    const audit = await screen.findByRole('checkbox', { name: 'AI Audit für Unternehmen' });
    expect(audit).toBeChecked();
    await user.click(audit);
    await user.click(screen.getByRole('checkbox', { name: 'AI in der Softwareentwicklung' }));
    await user.click(screen.getByRole('checkbox', { name: 'AI in Data Analytics' }));
    await user.click(screen.getByRole('button', { name: /^Englisch/ }));
    expect(screen.getByLabelText('Titel')).toHaveValue('');
    await user.type(screen.getByLabelText('Titel'), 'First draft');
    await user.click(within(toolbar()).getByRole('button', { name: 'Speichern' }));
    await screen.findByText('Entwurf gespeichert.');
    expect(posts.get(7)?.topics).toEqual(['softwareentwicklung', 'data-analytics']);
    expect(posts.get(7)?.texts.map((t) => [t.lang, t.title])).toEqual([
      ['de', 'Erster Entwurf'],
      ['en', 'First draft'],
    ]);
  });

  it('veröffentlicht einen vollständigen Entwurf', async () => {
    const { posts, handler } = postsBackend([DRAFT]);
    fakeBackend(EDITOR, handler);
    renderAt('/beitraege/7');
    const user = userEvent.setup();
    const publish = await screen.findByRole('button', { name: 'Veröffentlichen' });
    expect(publish).toHaveClass('btn-primary');
    await user.click(publish);
    expect(await screen.findByText(/Veröffentlicht\. Der Beitrag erscheint jetzt im Blog/)).toBeInTheDocument();
    expect(posts.get(7)?.status).toBe('published');
    expect(screen.getByText('Veröffentlicht', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Auf der Webseite ansehen' })).toHaveAttribute('href', '/de/blog/erster-entwurf');
    expect(screen.queryByRole('button', { name: 'Veröffentlichen' })).not.toBeInTheDocument();
  });

  it('speichert ungesicherte Änderungen vor dem Veröffentlichen und meldet fehlende Texte', async () => {
    const { posts, handler } = postsBackend();
    fakeBackend(EDITOR, handler);
    renderAt('/beitraege/neu');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Titel'), 'Nur ein Titel');
    await user.click(screen.getByRole('button', { name: 'Veröffentlichen' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Kurztext, Beitragstext');
    expect(posts.get(100)?.status).toBe('draft');
  });

  it('speichert Änderungen an einem veröffentlichten Beitrag direkt in die öffentliche Fassung', async () => {
    const { posts, handler } = postsBackend([PUBLISHED]);
    fakeBackend(EDITOR, handler);
    renderAt('/beitraege/8');
    const user = userEvent.setup();
    const save = await screen.findByRole('button', { name: 'Änderungen speichern' });
    expect(save).toBeDisabled();
    const body = screen.getByLabelText('Beitragstext');
    await user.clear(body);
    await user.type(body, 'Neuer Text');
    await user.click(save);
    expect(await screen.findByText(/Die Webseite zeigt jetzt die neue Fassung/)).toBeInTheDocument();
    expect(posts.get(8)).toMatchObject({ status: 'published', texts: [{ bodyMarkdown: 'Neuer Text' }] });
  });

  it('nimmt eine Veröffentlichung nach Bestätigung zurück und bietet Rückgängig an', async () => {
    const { posts, handler } = postsBackend([PUBLISHED]);
    const state = fakeBackend(EDITOR, handler);
    renderAt('/beitraege/8');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Veröffentlichung zurücknehmen' }));
    expect(posts.get(8)?.status).toBe('published'); // erst nach Bestätigung
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
    await user.click(screen.getByRole('button', { name: 'Veröffentlichung zurücknehmen' }));
    await user.click(screen.getByRole('button', { name: 'Ja, zurücknehmen' }));

    expect(await screen.findByText(/Veröffentlichung zurückgenommen/)).toBeInTheDocument();
    expect(posts.get(8)?.status).toBe('draft');
    expect(screen.getByText('Entwurf', { selector: '.badge' })).toBeInTheDocument();
    const unpublish = state.requests.find((r) => r.path.endsWith('/unpublish'));
    expect(unpublish?.csrf).toBe(EDITOR.csrfToken);

    await user.click(screen.getByRole('button', { name: 'Rückgängig' }));
    await waitFor(() => expect(posts.get(8)?.status).toBe('published'));
    expect(await screen.findByText('Wieder veröffentlicht.')).toBeInTheDocument();
  });

  it('zeigt für unbekannte Beiträge einen Hinweis', async () => {
    const { handler } = postsBackend();
    fakeBackend(EDITOR, handler);
    renderAt('/beitraege/999');
    expect(await screen.findByRole('heading', { level: 1, name: 'Beitrag nicht gefunden' })).toBeInTheDocument();
  });
});

describe('Ticket #24: Beitragsaktionen in der Beitragsübersicht', () => {
  const INCOMPLETE: EditorPost = {
    ...DRAFT,
    id: 9,
    slug: 'unvollstaendig',
    texts: [{ lang: 'de', title: 'Noch ohne Text', summary: 'Kurz', bodyMarkdown: '' }],
  };
  const rowOf = (title: string) => screen.getByRole('link', { name: title }).closest('tr') as HTMLElement;

  it('bietet je Zeile eindeutig beschriftete Aktionen, „Veröffentlichen“ nur für Entwürfe', async () => {
    const { handler } = postsBackend([DRAFT, PUBLISHED]);
    fakeBackend(EDITOR, handler);
    renderAt('/');
    await screen.findByRole('table');
    expect(screen.getByRole('columnheader', { name: 'Aktionen' })).toBeInTheDocument();
    const draft = rowOf('Erster Entwurf');
    expect(within(draft).getByRole('button', { name: '„Erster Entwurf“ veröffentlichen' })).toHaveTextContent('Veröffentlichen');
    expect(within(draft).getByRole('button', { name: '„Erster Entwurf“ löschen' })).toHaveTextContent('Löschen');
    const published = rowOf('Schon online');
    expect(within(published).queryByRole('button', { name: /veröffentlichen/ })).not.toBeInTheDocument();
    expect(within(published).getByRole('button', { name: '„Schon online“ löschen' })).toBeInTheDocument();
  });

  it('veröffentlicht einen Entwurf direkt aus der Übersicht, auch per Tastatur', async () => {
    const { posts, handler } = postsBackend([DRAFT]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/');
    const button = await screen.findByRole('button', { name: '„Erster Entwurf“ veröffentlichen' });
    button.focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('status')).toHaveTextContent('„Erster Entwurf“ ist veröffentlicht');
    await waitFor(() => expect(within(rowOf('Erster Entwurf')).getByText('Veröffentlicht', { selector: '.badge' })).toBeInTheDocument());
    expect(posts.get(7)?.status).toBe('published');
    expect(within(rowOf('Erster Entwurf')).queryByRole('button', { name: /veröffentlichen/ })).not.toBeInTheDocument();
  });

  it('lässt einen unvollständigen Beitrag unverändert und nennt den Grund', async () => {
    const { posts, handler } = postsBackend([INCOMPLETE]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/');
    await user.click(await screen.findByRole('button', { name: '„Noch ohne Text“ veröffentlichen' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('„Noch ohne Text“ wurde nicht veröffentlicht.');
    expect(alert).toHaveTextContent('Beitragstext');
    expect(posts.get(9)?.status).toBe('draft');
    expect(within(rowOf('Noch ohne Text')).getByText('Entwurf', { selector: '.badge' })).toBeInTheDocument();
  });

  it('löscht erst nach Bestätigung und entfernt den Beitrag aus der Übersicht', async () => {
    const { posts, handler } = postsBackend([DRAFT, PUBLISHED]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/');
    await user.click(await screen.findByRole('button', { name: '„Schon online“ löschen' }));

    // Abbrechen lässt alles unverändert und gibt den Fokus zurück.
    const confirm = within(rowOf('Schon online')).getByRole('group', { name: 'Löschen von „Schon online“ bestätigen' });
    expect(within(confirm).getByRole('button', { name: 'Abbrechen' })).toHaveFocus();
    await user.click(within(confirm).getByRole('button', { name: 'Abbrechen' }));
    expect(posts.has(8)).toBe(true);
    await waitFor(() => expect(screen.getByRole('button', { name: '„Schon online“ löschen' })).toHaveFocus());

    await user.click(screen.getByRole('button', { name: '„Schon online“ löschen' }));
    await user.click(screen.getByRole('button', { name: '„Schon online“ endgültig löschen' }));
    expect(await screen.findByRole('status')).toHaveTextContent('„Schon online“ wurde gelöscht.');
    expect(posts.has(8)).toBe(false);
    expect(screen.queryByRole('link', { name: 'Schon online' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Erster Entwurf' })).toBeInTheDocument();
  });

  it('sendet bei beiden Aktionen das CSRF-Token', async () => {
    const { handler } = postsBackend([DRAFT, PUBLISHED]);
    const state = fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/');
    await user.click(await screen.findByRole('button', { name: '„Erster Entwurf“ veröffentlichen' }));
    await screen.findByRole('status');
    await user.click(screen.getByRole('button', { name: '„Schon online“ löschen' }));
    await user.click(screen.getByRole('button', { name: '„Schon online“ endgültig löschen' }));
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Schon online' })).not.toBeInTheDocument());
    const writes = state.requests.filter((r) => r.method !== 'GET');
    expect(writes.map((r) => `${r.method} ${r.path}`)).toEqual(['POST /api/admin/posts/7/publish', 'DELETE /api/admin/posts/8']);
    expect(writes.every((r) => r.csrf === EDITOR.csrfToken)).toBe(true);
  });
});
