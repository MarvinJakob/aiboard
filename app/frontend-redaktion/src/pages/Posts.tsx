import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../api/client';
import { useDeletePost, useEditorPosts, usePostAction, useTopics, type EditorPostSummary } from '../api/posts';
import { Loading, Page } from '../components/Layout';
import { StatusBadge, formatDate } from '../components/PostParts';

interface Notice {
  kind: 'ok' | 'error';
  text: string;
}

/** Beitragsliste der Redaktion mit Beiträgen „In Arbeit“ und veröffentlichten Beiträgen (Anforderung 5, Tickets #23 und #24). */
export function PostsPage() {
  const { data: posts, isPending, isError, refetch } = useEditorPosts();
  const { data: topics } = useTopics();
  const topicLabel = (slug: string) => topics?.find((t) => t.slug === slug)?.label ?? slug;
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);

  // Nach einer Aktion den Fokus auf die Meldung setzen, damit sie auch per Screenreader ankommt
  // und der Fokus nach dem Löschen nicht ins Leere fällt.
  useEffect(() => {
    if (notice) noticeRef.current?.focus();
  }, [notice]);

  return (
    <Page
      title="Beiträge"
      actions={
        <Link className="btn btn-primary press" to="/beitraege/neu">
          Neuer Beitrag
        </Link>
      }
    >
      <p className="lead">
        Beiträge „In Arbeit“ sind nur hier sichtbar, auch wenn ein Zeitpunkt geplant ist. Veröffentlichte Beiträge erscheinen
        sofort auf der Webseite.
      </p>
      <p
        ref={noticeRef}
        tabIndex={-1}
        className={notice?.kind === 'error' ? 'form-error list-notice' : 'form-ok list-notice'}
        role={notice?.kind === 'error' ? 'alert' : 'status'}
      >
        {notice?.text}
      </p>
      {isPending && <Loading />}
      {isError && (
        <p className="form-error" role="alert">
          Die Beiträge konnten nicht geladen werden.{' '}
          <button className="btn btn-secondary btn-small press" type="button" onClick={() => refetch()}>
            Erneut versuchen
          </button>
        </p>
      )}
      {posts && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Titel</th>
                <th scope="col">Status</th>
                <th scope="col">Themen</th>
                <th scope="col">Geändert</th>
                <th scope="col">Veröffentlicht</th>
                <th scope="col" className="actions">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Noch keine Beiträge. Legen Sie mit „Neuer Beitrag“ den ersten an.
                  </td>
                </tr>
              )}
              {posts.map((p) => (
                <Row key={p.id} post={p} topicLabel={topicLabel} onNotice={setNotice} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}

function Row({
  post: p,
  topicLabel,
  onNotice,
}: {
  post: EditorPostSummary;
  topicLabel: (slug: string) => string;
  onNotice: (n: Notice) => void;
}) {
  const action = usePostAction();
  const remove = useDeletePost();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const title = p.title || 'Ohne Titel';
  const busy = action.isPending || remove.isPending;

  useEffect(() => {
    if (confirmDelete) cancelRef.current?.focus();
  }, [confirmDelete]);

  const publish = async () => {
    try {
      await action.mutateAsync({ kind: 'publish', id: p.id });
      onNotice({ kind: 'ok', text: `„${title}“ ist veröffentlicht und erscheint jetzt auf der Webseite.` });
    } catch (e) {
      onNotice({ kind: 'error', text: `„${title}“ wurde nicht veröffentlicht. ${reason(e)}` });
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    requestAnimationFrame(() => deleteRef.current?.focus());
  };

  // Die Zeile verschwindet nach dem Löschen, daher die Meldung über das Promise statt über Callbacks.
  const confirm = async () => {
    try {
      await remove.mutateAsync(p.id);
      onNotice({ kind: 'ok', text: `„${title}“ wurde gelöscht.` });
    } catch (e) {
      setConfirmDelete(false);
      onNotice({ kind: 'error', text: `„${title}“ wurde nicht gelöscht. ${reason(e)}` });
    }
  };

  return (
    <tr>
      <td>
        <Link to={`/beitraege/${p.id}`}>{title}</Link>
        {p.translations.length > 0 && (
          <span className="row-meta"> {p.translations.map((l) => l.toUpperCase()).join(' · ')}</span>
        )}
      </td>
      <td>
        <StatusBadge status={p.status} />
        {p.status === 'draft' && p.scheduledAt && (
          <span className="row-schedule">Geplant: {formatDate(p.scheduledAt)}</span>
        )}
      </td>
      <td>{p.topics.map(topicLabel).join(', ') || '–'}</td>
      <td className="num">{formatDate(p.updatedAt)}</td>
      <td className="num">{p.status === 'published' && p.publishedAt ? formatDate(p.publishedAt) : '–'}</td>
      <td className="actions">
        {confirmDelete ? (
          <div className="row-actions" role="group" aria-label={`Löschen von „${title}“ bestätigen`}>
            <span className="confirm-text">Endgültig löschen?</span>
            <button ref={cancelRef} type="button" className="btn btn-secondary btn-small press" onClick={cancelDelete}>
              Abbrechen
            </button>
            <button
              type="button"
              className="btn btn-danger btn-small press"
              disabled={busy}
              onClick={() => void confirm()}
              aria-label={`„${title}“ endgültig löschen`}
            >
              Ja, löschen
            </button>
          </div>
        ) : (
          <div className="row-actions">
            {p.status === 'draft' && (
              <button
                type="button"
                className="btn btn-secondary btn-small press"
                disabled={busy}
                onClick={() => void publish()}
                aria-label={`„${title}“ veröffentlichen`}
              >
                Veröffentlichen
              </button>
            )}
            <button
              ref={deleteRef}
              type="button"
              className="btn btn-danger btn-small press"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              aria-label={`„${title}“ löschen`}
            >
              Löschen
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function reason(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.';
    if (e.status === 403) return 'Keine Berechtigung. Bitte laden Sie die Seite neu.';
    if (e.status === 404) return 'Der Beitrag existiert nicht mehr.';
    if (e.status < 500) return e.message;
  }
  return 'Bitte später erneut versuchen.';
}
