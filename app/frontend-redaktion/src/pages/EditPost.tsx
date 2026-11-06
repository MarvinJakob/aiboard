import { useEffect, useId, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import {
  LANGS,
  LANG_NAMES,
  usePostAction,
  useEditorPost,
  useTopics,
  type EditorPost,
  type Lang,
  type PostInput,
  type PostText,
} from '../api/posts';
import { Loading, Page } from '../components/Layout';
import { StatusBadge, formatDate } from '../components/PostParts';

interface Form {
  slug: string;
  featured: boolean;
  topics: string[];
  texts: Record<Lang, PostText>;
}

interface Notice {
  text: string;
  undo?: boolean; // „Rückgängig“ nach dem Zurücknehmen anbieten
}

const emptyText = (lang: Lang): PostText => ({ lang, title: '', summary: '', bodyMarkdown: '' });

function toForm(p?: EditorPost): Form {
  const texts = { de: emptyText('de'), en: emptyText('en') };
  for (const t of p?.texts ?? []) texts[t.lang] = { ...t };
  return { slug: p?.slug ?? '', featured: p?.featured ?? false, topics: p?.topics ?? [], texts };
}

function toInput(f: Form): PostInput {
  return {
    slug: f.slug.trim() || undefined,
    featured: f.featured,
    topics: f.topics,
    texts: LANGS.map((l) => f.texts[l]).filter((t) => t.title.trim() || t.summary.trim() || t.bodyMarkdown.trim()),
  };
}

const hasText = (t: PostText) => Boolean(t.title.trim() || t.summary.trim() || t.bodyMarkdown.trim());

/** Beitrag anlegen oder bearbeiten (Anforderung 5). „neu“ legt beim ersten Speichern einen Entwurf an. */
export function EditPostPage() {
  const { id: param } = useParams();
  const id = param === 'neu' ? undefined : Number(param);
  const { data: post, isPending, error } = useEditorPost(id);

  if (id !== undefined && isPending) return <Loading />;
  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <Page title={notFound ? 'Beitrag nicht gefunden' : 'Beitrag konnte nicht geladen werden'}>
        <p className="page-links">
          <Link to="/">Zur Beitragsliste</Link>
        </p>
      </Page>
    );
  }
  // Neu laden, sobald ein anderer Beitrag geöffnet wird.
  return <Editor key={id ?? 'neu'} post={post} />;
}

function Editor({ post }: { post?: EditorPost }) {
  const navigate = useNavigate();
  const location = useLocation();
  const action = usePostAction();
  const { data: topics } = useTopics();
  const [form, setForm] = useState<Form>(() => toForm(post));
  const [baseline, setBaseline] = useState(() => JSON.stringify(toInput(toForm(post))));
  const [lang, setLang] = useState<Lang>('de');
  const [notice, setNotice] = useState<Notice | null>((location.state as { notice?: Notice } | null)?.notice ?? null);
  const [error, setError] = useState('');
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const ids = { slug: useId(), title: useId(), summary: useId(), body: useId(), error: useId() };

  const dirty = JSON.stringify(toInput(form)) !== baseline;
  const published = post?.status === 'published';
  const busy = action.isPending;
  const text = form.texts[lang];

  // Ungespeicherte Änderungen nicht stillschweigend verlieren.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setText = (field: keyof Omit<PostText, 'lang'>, value: string) =>
    setForm((f) => ({ ...f, texts: { ...f.texts, [lang]: { ...f.texts[lang], [field]: value } } }));

  const toggleTopic = (slug: string) =>
    setForm((f) => ({ ...f, topics: f.topics.includes(slug) ? f.topics.filter((t) => t !== slug) : [...f.topics, slug] }));

  const run = async (steps: () => Promise<EditorPost>, success: Notice) => {
    setError('');
    setNotice(null);
    try {
      const saved = await steps();
      if (!post) {
        navigate(`/beitraege/${saved.id}`, { replace: true, state: { notice: success } });
        return;
      }
      setForm(toForm(saved));
      setBaseline(JSON.stringify(toInput(toForm(saved))));
      setNotice(success);
    } catch (e) {
      setError(errorText(e));
    }
  };

  const save = () =>
    run(
      () => (post ? action.mutateAsync({ kind: 'save', id: post.id, input: toInput(form) }) : action.mutateAsync({ kind: 'create', input: toInput(form) })),
      { text: published ? 'Änderungen gespeichert. Die Webseite zeigt jetzt die neue Fassung.' : 'Entwurf gespeichert.' },
    );

  const publish = () =>
    run(
      async () => {
        let target = post;
        if (!target) target = await action.mutateAsync({ kind: 'create', input: toInput(form) });
        else if (dirty) target = await action.mutateAsync({ kind: 'save', id: target.id, input: toInput(form) });
        return action.mutateAsync({ kind: 'publish', id: target.id });
      },
      { text: 'Veröffentlicht. Der Beitrag erscheint jetzt im Blog und auf den zugeordneten Themenseiten.' },
    );

  const unpublish = () => {
    setConfirmUnpublish(false);
    return run(() => action.mutateAsync({ kind: 'unpublish', id: post!.id }), {
      text: 'Veröffentlichung zurückgenommen. Der Beitrag ist nicht mehr öffentlich.',
      undo: true,
    });
  };

  const title = post ? form.texts.de.title || form.texts.en.title || 'Ohne Titel' : 'Neuer Beitrag';
  const publicLang = useMemo<Lang>(() => (post?.texts.some((t) => t.lang === 'de') ? 'de' : 'en'), [post]);

  return (
    <Page title={title} actions={<StatusBadge status={post?.status ?? 'draft'} />}>
      <p className="back">
        <Link to="/">← Alle Beiträge</Link>
      </p>
      <p className="lead">
        {post ? (
          <>
            Zuletzt geändert am {formatDate(post.updatedAt)}
            {published && post.publishedAt && <>, veröffentlicht am {formatDate(post.publishedAt)}</>}.{' '}
            {published && (
              <a href={`/${publicLang}/blog/${post.slug}`} target="_blank" rel="noreferrer">
                Auf der Webseite ansehen
              </a>
            )}
          </>
        ) : (
          'Der Entwurf ist erst nach dem Veröffentlichen auf der Webseite sichtbar.'
        )}
      </p>

      <form
        className="editor"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        noValidate
      >
        <div className="card">
          <div className="lang-tabs" role="group" aria-label="Sprachfassung">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                className="nav-btn press"
                aria-pressed={l === lang}
                onClick={() => setLang(l)}
              >
                {LANG_NAMES[l]}
                {hasText(form.texts[l]) && <span className="dot" aria-label="(mit Inhalt)" />}
              </button>
            ))}
          </div>
          <p className="field-hint">
            Für die Veröffentlichung braucht jede angefangene Fassung Titel, Kurztext und Beitragstext. Leere Fassungen
            werden nicht gespeichert.
          </p>
          <div className="field">
            <label htmlFor={ids.title}>Titel</label>
            <input id={ids.title} lang={lang} value={text.title} maxLength={200} onChange={(e) => setText('title', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor={ids.summary}>Kurztext</label>
            <textarea id={ids.summary} lang={lang} rows={3} maxLength={600} value={text.summary} onChange={(e) => setText('summary', e.target.value)} />
            <span className="field-hint">Erscheint in Listen, auf der Startseite und in Link-Vorschauen.</span>
          </div>
          <div className="field">
            <label htmlFor={ids.body}>Beitragstext</label>
            <textarea
              id={ids.body}
              lang={lang}
              rows={18}
              className="mono"
              value={text.bodyMarkdown}
              onChange={(e) => setText('bodyMarkdown', e.target.value)}
            />
            <span className="field-hint">Markdown, z. B. „## Zwischenüberschrift“, „**fett**“ oder „- Aufzählung“.</span>
          </div>
        </div>

        <div className="card">
          <fieldset className="field">
            <legend>Themen</legend>
            <div className="checks">
              {topics?.map((t) => (
                <label key={t.slug} className="check">
                  <input type="checkbox" checked={form.topics.includes(t.slug)} onChange={() => toggleTopic(t.slug)} />
                  {t.title}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label className="check">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
              Im Karussell der Startseite hervorheben
            </label>
          </div>
          <div className="field">
            <label htmlFor={ids.slug}>URL-Kürzel</label>
            <input
              id={ids.slug}
              value={form.slug}
              placeholder="wird aus dem Titel erzeugt"
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
            <span className="field-hint">
              Teil der Adresse, z. B. /de/blog/{form.slug.trim() || 'mein-beitrag'}. Bei veröffentlichten Beiträgen besser nicht ändern,
              sonst funktionieren geteilte Links nicht mehr.
            </span>
          </div>
        </div>

        <div className="toolbar glass" role="toolbar" aria-label="Beitrag">
          <div className="toolbar-status" aria-live="polite">
            {error ? (
              <span className="form-error" role="alert" id={ids.error}>
                {error}
              </span>
            ) : notice ? (
              <span className="form-ok" role="status">
                {notice.text}{' '}
                {notice.undo && post && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-small press"
                    disabled={busy}
                    onClick={() => run(() => action.mutateAsync({ kind: 'publish', id: post.id }), { text: 'Wieder veröffentlicht.' })}
                  >
                    Rückgängig
                  </button>
                )}
              </span>
            ) : dirty ? (
              <span className="field-hint">Ungespeicherte Änderungen</span>
            ) : null}
          </div>
          {confirmUnpublish ? (
            <div className="toolbar-actions" role="group" aria-label="Zurücknehmen bestätigen">
              <span className="confirm-text">Beitrag sofort von der Webseite nehmen?</span>
              <button type="button" className="btn btn-secondary press" onClick={() => setConfirmUnpublish(false)}>
                Abbrechen
              </button>
              <button type="button" className="btn btn-danger press" disabled={busy} onClick={() => void unpublish()}>
                Ja, zurücknehmen
              </button>
            </div>
          ) : (
            <div className="toolbar-actions">
              {published && (
                <button type="button" className="btn btn-danger press" disabled={busy} onClick={() => setConfirmUnpublish(true)}>
                  Veröffentlichung zurücknehmen
                </button>
              )}
              <button type="submit" className="btn btn-secondary press" disabled={busy || (Boolean(post) && !dirty)}>
                {published ? 'Änderungen speichern' : 'Speichern'}
              </button>
              {!published && (
                <button type="button" className="btn btn-primary press" disabled={busy} onClick={() => void publish()}>
                  Veröffentlichen
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </Page>
  );
}

function errorText(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.';
    if (e.status === 403) return 'Keine Berechtigung. Bitte laden Sie die Seite neu.';
    if (e.status < 500) return e.message;
  }
  return 'Speichern ist gerade nicht möglich. Bitte erneut versuchen.';
}
