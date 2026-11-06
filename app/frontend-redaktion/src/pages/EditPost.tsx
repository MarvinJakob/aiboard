import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
import { StatusBadge, formatDate, formatWithZone, resolveLocalInput, toLocalInput } from '../components/PostParts';

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

const emptyText = (lang: Lang): PostText => ({ lang, title: '', summary: '', bodyMarkdown: '', coverAlt: '' });

/** Meldungen zur Zeitumstellung (Ticket #32). */
const NONEXISTENT =
  'Diese Uhrzeit gibt es an diesem Tag wegen der Umstellung auf Sommerzeit nicht. Bitte wählen Sie eine andere Uhrzeit.';
const AMBIGUOUS = 'Diese Uhrzeit gibt es wegen der Zeitumstellung zweimal. Bitte wählen Sie, welche gemeint ist.';

/** Grenzen für Titelbilder wie im Backend (Ticket #25). */
const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const COVER_MAX_BYTES = 5 * 1024 * 1024;

/** Prüft eine Bilddatei vor dem Hochladen. Das Backend prüft den Inhalt noch einmal. */
export function coverProblem(file: File): string | null {
  if (!COVER_TYPES.includes(file.type)) return 'Dieser Dateityp wird nicht unterstützt. Erlaubt sind JPEG, PNG und WebP.';
  if (file.size > COVER_MAX_BYTES) return 'Die Datei ist größer als 5 MB. Bitte ein kleineres Bild wählen.';
  return null;
}

function toForm(p?: EditorPost): Form {
  const texts = { de: emptyText('de'), en: emptyText('en') };
  for (const t of p?.texts ?? []) texts[t.lang] = { ...t, coverAlt: t.coverAlt ?? '' };
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

/** Beitrag anlegen oder bearbeiten (Anforderung 5). „neu“ legt beim ersten Speichern einen Beitrag „In Arbeit“ an. */
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
  const [scheduleValue, setScheduleValue] = useState(() => (post?.scheduledAt ? toLocalInput(post.scheduledAt) : ''));
  // Bei doppeldeutiger Ortszeit (Ende der Sommerzeit) wählt die Redaktion den gemeinten Zeitpunkt (Ticket #32).
  const [scheduleChoice, setScheduleChoice] = useState<string | null>(null);
  const resolved = resolveLocalInput(scheduleValue);
  const ids = {
    slug: useId(), title: useId(), summary: useId(), body: useId(), error: useId(), schedule: useId(), scheduleHint: useId(),
    cover: useId(), coverHint: useId(), coverAlt: useId(), coverAltHint: useId(),
  };
  const coverInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(toInput(form)) !== baseline;
  const published = post?.status === 'published';
  const busy = action.isPending;

  // Ticket #33: Veröffentlicht der Hintergrundjob den geöffneten Beitrag, darauf hinweisen.
  // Das Formular bleibt unverändert, ungespeicherte Eingaben gehen nicht verloren.
  // Eigene Aktionen (Veröffentlichen, Rückgängig) melden sich selbst. ownUpdate merkt sich den Stand,
  // den die letzte eigene Aktion geliefert hat; nur andere Stände stammen vom Hintergrundjob.
  const lastStatus = useRef(post?.status);
  const ownUpdate = useRef<string | null>(null);
  useEffect(() => {
    const before = lastStatus.current;
    lastStatus.current = post?.status;
    if (before === 'draft' && post?.status === 'published' && post.updatedAt !== ownUpdate.current) {
      setError('');
      setNotice({ text: 'Der geplante Zeitpunkt ist erreicht: Der Beitrag ist jetzt veröffentlicht.' });
    }
  }, [post?.status]);
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
      ownUpdate.current = saved.updatedAt;
      if (!post) {
        navigate(`/beitraege/${saved.id}`, { replace: true, state: { notice: success } });
        return;
      }
      setForm(toForm(saved));
      setBaseline(JSON.stringify(toInput(toForm(saved))));
      setScheduleValue(saved.scheduledAt ? toLocalInput(saved.scheduledAt) : '');
      setScheduleChoice(saved.scheduledAt ?? null);
      setNotice(success);
    } catch (e) {
      setError(errorText(e));
    }
  };

  const save = () =>
    run(
      () => (post ? action.mutateAsync({ kind: 'save', id: post.id, input: toInput(form) }) : action.mutateAsync({ kind: 'create', input: toInput(form) })),
      { text: published ? 'Änderungen gespeichert. Die Webseite zeigt jetzt die neue Fassung.' : 'Gespeichert. Der Beitrag bleibt „In Arbeit“.' },
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

  // Geplante Veröffentlichung (Ticket #23): Eingabe in lokaler Zeit, gespeichert wird UTC.
  const schedule = () => {
    const fail = (msg: string) => {
      setNotice(null);
      setError(msg);
    };
    let iso: string | null = null;
    switch (resolved.kind) {
      case 'empty':
        return fail('Bitte Datum und Uhrzeit für die Veröffentlichung angeben.');
      case 'nonexistent':
        return fail(NONEXISTENT);
      case 'ambiguous':
        iso = resolved.options.find((o) => o === scheduleChoice) ?? null;
        if (!iso) return fail(AMBIGUOUS);
        break;
      case 'ok':
        iso = resolved.iso;
    }
    if (new Date(iso).getTime() <= Date.now()) {
      return fail('Der Zeitpunkt liegt in der Vergangenheit. Bitte wählen Sie einen Zeitpunkt in der Zukunft.');
    }
    const at = iso;
    return run(
      async () => {
        let target = post!;
        if (dirty) target = await action.mutateAsync({ kind: 'save', id: target.id, input: toInput(form) });
        return action.mutateAsync({ kind: 'schedule', id: target.id, publishAt: at });
      },
      { text: `Geplant: Der Beitrag erscheint am ${formatWithZone(at)} automatisch auf der Webseite.` },
    );
  };

  // Titelbild (Ticket #25): Ungespeicherte Änderungen werden vorher gespeichert, damit sie nicht verloren gehen.
  const uploadCover = (file: File) => {
    const problem = coverProblem(file);
    if (coverInput.current) coverInput.current.value = '';
    if (problem) {
      setNotice(null);
      setError(problem);
      return;
    }
    const replacing = Boolean(post?.cover);
    return run(
      async () => {
        let target = post!;
        if (dirty) target = await action.mutateAsync({ kind: 'save', id: target.id, input: toInput(form) });
        return action.mutateAsync({ kind: 'setCover', id: target.id, file });
      },
      {
        text: replacing
          ? 'Titelbild ersetzt. Die Alternativtexte bleiben erhalten, bitte prüfen Sie, ob sie noch passen.'
          : 'Titelbild gespeichert. Bitte ergänzen Sie in jeder Sprachfassung den Alternativtext.',
      },
    );
  };

  const removeCover = () =>
    run(
      async () => {
        let target = post!;
        if (dirty) target = await action.mutateAsync({ kind: 'save', id: target.id, input: toInput(form) });
        return action.mutateAsync({ kind: 'removeCover', id: target.id });
      },
      { text: 'Titelbild entfernt. Die Beitragsseite zeigt wieder die Themengrafik.' },
    );

  const unschedule = () =>
    run(() => action.mutateAsync({ kind: 'unschedule', id: post!.id }), { text: 'Zeitpunkt entfernt. Der Beitrag bleibt „In Arbeit“.' });

  // Die Überschrift folgt dem gespeicherten Titel. Folgte sie der Eingabe, setzte Page bei jedem Zeichen
  // den Fokus auf die Überschrift, und das Titelfeld verlöre ihn.
  const savedTitle = (l: Lang) => post?.texts.find((t) => t.lang === l)?.title;
  const title = post ? savedTitle('de') || savedTitle('en') || 'Ohne Titel' : 'Neuer Beitrag';
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
            {published && post.publishedAt && <>, veröffentlicht am {formatDate(post.publishedAt)}</>}
            {!published && post.scheduledAt && <>, automatische Veröffentlichung am {formatWithZone(post.scheduledAt)}</>}.{' '}
            {published && (
              <a href={`/${publicLang}/blog/${post.slug}`} target="_blank" rel="noreferrer">
                Auf der Webseite ansehen
              </a>
            )}
          </>
        ) : (
          'Der Beitrag bleibt „In Arbeit“ und ist erst nach dem Veröffentlichen auf der Webseite sichtbar.'
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
          {post?.cover && (
            <div className="field">
              <label htmlFor={ids.coverAlt}>Alternativtext des Titelbilds ({LANG_NAMES[lang]})</label>
              <input
                id={ids.coverAlt}
                lang={lang}
                value={text.coverAlt ?? ''}
                maxLength={300}
                aria-describedby={ids.coverAltHint}
                onChange={(e) => setText('coverAlt', e.target.value)}
              />
              <span className="field-hint" id={ids.coverAltHint}>
                Beschreibt kurz, was das Bild zeigt, für Menschen, die es nicht sehen. Ohne Alternativtext lässt sich der
                Beitrag nicht veröffentlichen.
              </span>
            </div>
          )}
        </div>

        <section className="card" aria-labelledby={ids.cover + '-title'}>
          <h2 className="card-title" id={ids.cover + '-title'}>
            Titelbild
          </h2>
          {post ? (
            <>
              {post.cover && (
                <img
                  className="cover-preview"
                  src={post.cover.src}
                  srcSet={post.cover.srcset}
                  sizes="(max-width: 760px) 100vw, 640px"
                  width={post.cover.width}
                  height={post.cover.height}
                  alt={post.cover.alt ? `Vorschau: ${post.cover.alt}` : 'Vorschau des Titelbilds, noch ohne Alternativtext'}
                />
              )}
              <div className="field">
                <label htmlFor={ids.cover}>{post.cover ? 'Bild ersetzen' : 'Bild hochladen'}</label>
                <input
                  ref={coverInput}
                  id={ids.cover}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-describedby={ids.coverHint}
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadCover(file);
                  }}
                />
                <span className="field-hint" id={ids.coverHint}>
                  JPEG, PNG oder WebP bis 5 MB. Das Bild erscheint auf der Beitragsseite direkt unter der Überschrift und als
                  Vorschaubild beim Teilen.
                </span>
              </div>
              {post.cover && (
                <div className="schedule-actions">
                  <button type="button" className="btn btn-danger press" disabled={busy} onClick={() => void removeCover()}>
                    Bild entfernen
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="field-hint">Speichern Sie den Beitrag zuerst. Danach können Sie ein Titelbild hochladen.</p>
          )}
        </section>

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

        {!published && (
          <section className="card" aria-labelledby={ids.schedule + '-title'}>
            <h2 className="card-title" id={ids.schedule + '-title'}>
              Automatisch veröffentlichen
            </h2>
            {post ? (
              <>
                <div className="field">
                  <label htmlFor={ids.schedule}>Datum und Uhrzeit</label>
                  <input
                    id={ids.schedule}
                    type="datetime-local"
                    value={scheduleValue}
                    min={toLocalInput(new Date())}
                    aria-describedby={ids.scheduleHint}
                    onChange={(e) => {
                      setScheduleValue(e.target.value);
                      setScheduleChoice(null);
                    }}
                  />
                  {resolved.kind === 'ok' && (
                    <span className="field-hint schedule-resolved">Gilt: {formatWithZone(resolved.iso)}</span>
                  )}
                  {resolved.kind === 'nonexistent' && <span className="field-hint schedule-warning">{NONEXISTENT}</span>}
                  {resolved.kind === 'ambiguous' && (
                    <fieldset className="schedule-choice">
                      <legend>Diese Uhrzeit gibt es wegen der Zeitumstellung zweimal. Welche ist gemeint?</legend>
                      {resolved.options.map((o, i) => (
                        <label key={o} className="check">
                          <input
                            type="radio"
                            name={ids.schedule + '-choice'}
                            value={o}
                            checked={scheduleChoice === o}
                            onChange={() => setScheduleChoice(o)}
                          />
                          {formatWithZone(o)} {i === 0 ? '(erstes Mal, noch Sommerzeit)' : '(zweites Mal, schon Winterzeit)'}
                        </label>
                      ))}
                    </fieldset>
                  )}
                  <span className="field-hint" id={ids.scheduleHint}>
                    {post.scheduledAt
                      ? `Geplant für ${formatWithZone(post.scheduledAt)}. `
                      : 'Angabe in Ortszeit. '}
                    Bis dahin bleibt der Beitrag „In Arbeit“ und ist öffentlich nicht sichtbar. Titel, Kurztext und
                    Beitragstext müssen vorhanden sein.
                  </span>
                </div>
                <div className="schedule-actions">
                  <button type="button" className="btn btn-secondary press" disabled={busy} onClick={() => void schedule()}>
                    {post.scheduledAt ? 'Zeitpunkt ändern' : 'Zeitpunkt speichern'}
                  </button>
                  {post.scheduledAt && (
                    <button type="button" className="btn btn-danger press" disabled={busy} onClick={() => void unschedule()}>
                      Zeitpunkt entfernen
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="field-hint">Speichern Sie den Beitrag zuerst. Danach können Sie einen Zeitpunkt festlegen.</p>
            )}
          </section>
        )}

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
