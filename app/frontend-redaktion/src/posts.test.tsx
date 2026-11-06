import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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
  const uploads: string[] = [];
  let nextId = 100;
  const now = () => new Date('2026-11-06T10:00:00Z').toISOString();
  const handler: Handler = (r: FakeRequest) => {
    if (r.path === '/api/topics') return json(200, { items: TOPICS });
    if (r.method !== 'GET' && r.csrf !== EDITOR.csrfToken) return json(403, { message: 'CSRF-Token fehlt.' });
    if (r.path === '/api/admin/posts' && r.method === 'GET') {
      return json(200, {
        items: [...posts.values()].map((p) => ({
          id: p.id, slug: p.slug, status: p.status, title: p.texts[0]?.title ?? '', featured: p.featured,
          topics: p.topics, translations: p.texts.map((t) => t.lang), publishedAt: p.publishedAt, scheduledAt: p.scheduledAt,
          updatedAt: p.updatedAt,
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
    const m = r.path.match(/^\/api\/admin\/posts\/(\d+)(?:\/(publish|unpublish|schedule|cover))?$/);
    if (!m) return undefined;
    const p = posts.get(Number(m[1]));
    if (!p) return json(404, { message: 'Beitrag nicht gefunden.' });
    if (r.method === 'GET') return json(200, p);
    if (m[2] === 'cover' && r.method === 'DELETE') {
      delete p.cover;
      p.texts = p.texts.map(({ coverAlt: _, ...t }) => t);
      return json(200, p);
    }
    if (m[2] === 'cover') {
      const file = (r.body as FormData).get('file') as File;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return json(422, { message: 'Dieser Dateityp wird nicht unterstützt. Erlaubt sind JPEG, PNG und WebP.' });
      }
      uploads.push(file.name);
      const key = String(uploads.length).padStart(32, '0');
      p.cover = { src: `/media/${key}-960.jpg`, srcset: `/media/${key}-480.jpg 480w`, width: 1600, height: 900, alt: p.texts[0]?.coverAlt ?? '' };
      return json(200, p);
    }
    if (m[2] === 'schedule' && r.method === 'DELETE') {
      delete p.scheduledAt;
      return json(200, p);
    }
    if (m[2] === 'schedule') {
      const at = (r.body as { publishAt: string }).publishAt;
      if (p.status === 'published') return json(422, { message: 'Der Beitrag ist bereits veröffentlicht.' });
      if (new Date(at).getTime() <= Date.now()) {
        return json(422, { message: 'Der Zeitpunkt liegt in der Vergangenheit. Bitte wählen Sie einen Zeitpunkt in der Zukunft.' });
      }
      const incomplete = p.texts.find((t) => !t.title || !t.summary || !t.bodyMarkdown);
      if (!p.texts.length || incomplete) return json(422, { message: 'Zum Veröffentlichen fehlt in der Fassung Deutsch: Beitragstext.' });
      p.scheduledAt = new Date(at).toISOString();
      return json(200, p);
    }
    if (r.method === 'PUT' && !m[2]) {
      const input = r.body as PostInput;
      Object.assign(p, { featured: input.featured, topics: input.topics, texts: input.texts, updatedAt: now() });
      if (input.slug) p.slug = input.slug;
      return json(200, p);
    }
    if (m[2] === 'publish') {
      const incomplete = p.texts.find((t) => !t.title || !t.summary || !t.bodyMarkdown);
      if (!p.texts.length || incomplete) return json(422, { message: 'Zum Veröffentlichen fehlt in der Fassung Deutsch: Kurztext, Beitragstext.' });
      if (p.cover && p.texts.some((t) => !t.coverAlt)) {
        return json(422, { message: 'Zum Veröffentlichen fehlt in der Fassung Deutsch der Alternativtext des Titelbilds.' });
      }
      Object.assign(p, { status: 'published', publishedAt: p.publishedAt ?? now(), updatedAt: now() });
      delete p.scheduledAt;
      return json(200, p);
    }
    if (m[2] === 'unpublish') {
      Object.assign(p, { status: 'draft', updatedAt: now() });
      return json(200, p);
    }
    return undefined;
  };
  return { posts, handler, uploads };
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
    expect(within(rows[0]).getByText('In Arbeit')).toBeInTheDocument();
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

    expect(await screen.findByText('Gespeichert. Der Beitrag bleibt „In Arbeit“.')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/redaktion/beitraege/100');
    expect(posts.get(100)).toMatchObject({ status: 'draft', topics: ['data-analytics'] });
    expect(screen.getByText('In Arbeit', { selector: '.badge' })).toBeInTheDocument();

    // Erneut öffnen über die Liste und weiterbearbeiten
    await user.click(screen.getByRole('link', { name: /Alle Beiträge/ }));
    await user.click(await screen.findByRole('link', { name: 'Mein Entwurf' }));
    const body = await screen.findByLabelText('Beitragstext');
    expect(screen.getByLabelText('Titel')).toHaveValue('Mein Entwurf');
    await user.type(body, 'Weiter geschrieben.');
    await user.click(within(toolbar()).getByRole('button', { name: 'Speichern' }));
    expect(await screen.findByText('Gespeichert. Der Beitrag bleibt „In Arbeit“.')).toBeInTheDocument();
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
    await screen.findByText('Gespeichert. Der Beitrag bleibt „In Arbeit“.');
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
    expect(screen.getByText('In Arbeit', { selector: '.badge' })).toBeInTheDocument();
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

describe('Ticket #23: Beitragsstatus und geplante Veröffentlichung', () => {
  const inFuture = (hours: number) => new Date(Date.now() + hours * 3_600_000);
  const scheduleField = () => screen.findByLabelText('Datum und Uhrzeit');
  const local = (d: Date) => {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const display = (d: Date) => new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(d);

  it('zeigt in Liste und Beitrag den Status „In Arbeit“ oder „Veröffentlicht“ und den geplanten Zeitpunkt', async () => {
    const at = inFuture(24);
    const { handler } = postsBackend([{ ...DRAFT, scheduledAt: at.toISOString() }, PUBLISHED]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/');
    const rows = within(await screen.findByRole('table')).getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('In Arbeit', { selector: '.badge' })).toBeInTheDocument();
    expect(within(rows[0]).getByText(/^Geplant:/)).toHaveTextContent(display(at));
    expect(within(rows[1]).getByText('Veröffentlicht', { selector: '.badge' })).toBeInTheDocument();
    expect(within(rows[1]).queryByText(/^Geplant:/)).not.toBeInTheDocument();

    await user.click(within(rows[0]).getByRole('link', { name: 'Erster Entwurf' }));
    expect(await screen.findByText('In Arbeit', { selector: '.badge' })).toBeInTheDocument();
    expect(await scheduleField()).toHaveValue(local(at));
  });

  it('trägt einen Zeitpunkt ein, ändert und entfernt ihn', async () => {
    const { posts, handler } = postsBackend([DRAFT]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    const field = await scheduleField();
    expect(screen.queryByRole('button', { name: 'Zeitpunkt entfernen' })).not.toBeInTheDocument();

    const first = inFuture(48);
    first.setSeconds(0, 0);
    fireEvent.change(field, { target: { value: local(first) } });
    await user.click(screen.getByRole('button', { name: 'Zeitpunkt speichern' }));
    expect(await within(toolbar()).findByText(/^Geplant: Der Beitrag erscheint am/)).toBeInTheDocument();
    // Gespeichert wird der Zeitpunkt in UTC, der Beitrag bleibt „In Arbeit“.
    expect(posts.get(7)?.scheduledAt).toBe(first.toISOString());
    expect(posts.get(7)?.status).toBe('draft');

    const second = new Date(first.getTime() + 90 * 60_000);
    fireEvent.change(field, { target: { value: local(second) } });
    await user.click(screen.getByRole('button', { name: 'Zeitpunkt ändern' }));
    await waitFor(() => expect(posts.get(7)?.scheduledAt).toBe(second.toISOString()));

    await user.click(screen.getByRole('button', { name: 'Zeitpunkt entfernen' }));
    expect(await within(toolbar()).findByText('Zeitpunkt entfernt. Der Beitrag bleibt „In Arbeit“.')).toBeInTheDocument();
    expect(posts.get(7)?.scheduledAt).toBeUndefined();
    expect(field).toHaveValue('');
  });

  it('lehnt einen Zeitpunkt in der Vergangenheit mit verständlicher Meldung ab', async () => {
    const { posts, handler } = postsBackend([DRAFT]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    fireEvent.change(await scheduleField(), { target: { value: local(inFuture(-2)) } });
    await user.click(screen.getByRole('button', { name: 'Zeitpunkt speichern' }));
    expect(await within(toolbar()).findByRole('alert')).toHaveTextContent('Der Zeitpunkt liegt in der Vergangenheit.');
    expect(posts.get(7)?.scheduledAt).toBeUndefined();

    fireEvent.change(await scheduleField(), { target: { value: '' } });
    await user.click(screen.getByRole('button', { name: 'Zeitpunkt speichern' }));
    expect(await within(toolbar()).findByRole('alert')).toHaveTextContent('Bitte Datum und Uhrzeit');
  });

  it('speichert ohne Beitragstext keinen Zeitpunkt und nennt den Grund', async () => {
    const { posts, handler } = postsBackend([
      { ...DRAFT, texts: [{ lang: 'de', title: 'Erster Entwurf', summary: 'Kurz', bodyMarkdown: '' }] },
    ]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    fireEvent.change(await scheduleField(), { target: { value: local(inFuture(5)) } });
    await user.click(screen.getByRole('button', { name: 'Zeitpunkt speichern' }));
    expect(await within(toolbar()).findByRole('alert')).toHaveTextContent('Beitragstext');
    expect(posts.get(7)?.scheduledAt).toBeUndefined();
  });

  it('bietet die Planung nur für Beiträge „In Arbeit“ an', async () => {
    const { handler } = postsBackend([PUBLISHED]);
    fakeBackend(EDITOR, handler);
    renderAt('/beitraege/8');
    expect(await screen.findByText('Veröffentlicht', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Datum und Uhrzeit')).not.toBeInTheDocument();
  });

  it('verlangt bei neuen Beiträgen zuerst das Speichern', async () => {
    const { handler } = postsBackend();
    fakeBackend(EDITOR, handler);
    renderAt('/beitraege/neu');
    expect(await screen.findByText(/Danach können Sie einen Zeitpunkt festlegen/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Datum und Uhrzeit')).not.toBeInTheDocument();
  });
});

describe('Ticket #25: Titelbild für Beiträge', () => {
  const jpeg = (name = 'foto.jpg', size = 1000, type = 'image/jpeg') => new File([new Uint8Array(size)], name, { type });
  const COVER: EditorPost['cover'] = { src: '/media/abc-960.jpg', srcset: '/media/abc-480.jpg 480w', width: 1600, height: 900, alt: 'Ein Büro' };

  it('lädt ein Bild hoch, zeigt die Vorschau und verlangt den Alternativtext', async () => {
    const { posts, handler, uploads } = postsBackend([DRAFT]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    expect(screen.queryByLabelText(/^Alternativtext des Titelbilds/)).not.toBeInTheDocument();

    await user.upload(await screen.findByLabelText('Bild hochladen'), jpeg());
    expect(await within(toolbar()).findByText(/^Titelbild gespeichert/)).toBeInTheDocument();
    expect(uploads).toEqual(['foto.jpg']);
    const preview = screen.getByRole('img', { name: /Vorschau des Titelbilds/ });
    expect(preview).toHaveAttribute('width', '1600');
    expect(preview).toHaveAttribute('height', '900');

    // Ohne Alternativtext lässt sich nicht veröffentlichen.
    await user.click(within(toolbar()).getByRole('button', { name: 'Veröffentlichen' }));
    expect(await within(toolbar()).findByRole('alert')).toHaveTextContent('Alternativtext des Titelbilds');
    expect(posts.get(7)?.status).toBe('draft');

    await user.type(screen.getByLabelText('Alternativtext des Titelbilds (Deutsch)'), 'Ein Büro mit Pflanzen');
    await user.click(within(toolbar()).getByRole('button', { name: 'Veröffentlichen' }));
    await waitFor(() => expect(posts.get(7)?.status).toBe('published'));
    expect(posts.get(7)?.texts[0].coverAlt).toBe('Ein Büro mit Pflanzen');
  });

  it('lehnt ungültige Dateitypen und zu große Dateien mit Meldung ab, ohne hochzuladen', async () => {
    const { uploads, handler } = postsBackend([DRAFT]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup({ applyAccept: false });
    renderAt('/beitraege/7');
    const input = await screen.findByLabelText('Bild hochladen');

    await user.upload(input, jpeg('animation.gif', 100, 'image/gif'));
    expect(await within(toolbar()).findByRole('alert')).toHaveTextContent('Erlaubt sind JPEG, PNG und WebP');
    await user.upload(input, jpeg('riesig.jpg', 5 * 1024 * 1024 + 1));
    expect(await within(toolbar()).findByRole('alert')).toHaveTextContent('größer als 5 MB');
    expect(uploads).toEqual([]);
  });

  it('ersetzt und entfernt ein Titelbild', async () => {
    const withCover = { ...DRAFT, cover: COVER, texts: [{ ...DRAFT.texts[0], coverAlt: 'Ein Büro' }] };
    const { posts, handler, uploads } = postsBackend([withCover]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    expect(await screen.findByRole('img', { name: 'Vorschau: Ein Büro' })).toBeInTheDocument();
    expect(screen.getByLabelText('Alternativtext des Titelbilds (Deutsch)')).toHaveValue('Ein Büro');

    await user.upload(screen.getByLabelText('Bild ersetzen'), jpeg('neu.webp', 500, 'image/webp'));
    expect(await within(toolbar()).findByText(/^Titelbild ersetzt/)).toBeInTheDocument();
    expect(uploads).toEqual(['neu.webp']);

    await user.click(screen.getByRole('button', { name: 'Bild entfernen' }));
    expect(await within(toolbar()).findByText(/^Titelbild entfernt/)).toBeInTheDocument();
    expect(posts.get(7)?.cover).toBeUndefined();
    expect(screen.queryByRole('img', { name: /Vorschau/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Alternativtext des Titelbilds/)).not.toBeInTheDocument();
  });

  it('speichert ungesicherte Änderungen vor dem Hochladen', async () => {
    const { posts, handler } = postsBackend([DRAFT]);
    fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    const title = await screen.findByLabelText('Titel');
    await user.clear(title);
    await user.type(title, 'Neuer Titel');
    await user.upload(screen.getByLabelText('Bild hochladen'), jpeg());
    await within(toolbar()).findByText(/^Titelbild gespeichert/);
    expect(posts.get(7)?.texts[0].title).toBe('Neuer Titel');
    expect(screen.getByLabelText('Titel')).toHaveValue('Neuer Titel');
  });

  it('verlangt bei neuen Beiträgen zuerst das Speichern', async () => {
    const { handler } = postsBackend();
    fakeBackend(EDITOR, handler);
    renderAt('/beitraege/neu');
    expect(await screen.findByText(/ein Titelbild hochladen/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Bild hochladen')).not.toBeInTheDocument();
  });

  it('sendet das Bild als multipart/form-data mit CSRF-Token', async () => {
    const { handler } = postsBackend([DRAFT]);
    const state = fakeBackend(EDITOR, handler);
    const user = userEvent.setup();
    renderAt('/beitraege/7');
    await user.upload(await screen.findByLabelText('Bild hochladen'), jpeg());
    await within(toolbar()).findByText(/^Titelbild gespeichert/);
    const req = state.requests.find((r) => r.path === '/api/admin/posts/7/cover');
    expect(req?.method).toBe('PUT');
    expect(req?.csrf).toBe(EDITOR.csrfToken);
    expect(((req?.body as FormData).get('file') as File).name).toBe('foto.jpg');
  });
});
