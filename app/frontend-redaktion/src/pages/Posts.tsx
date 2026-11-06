import { Link } from 'react-router';
import { useEditorPosts, useTopics, type EditorPostSummary } from '../api/posts';
import { Loading, Page } from '../components/Layout';
import { StatusBadge, formatDate } from '../components/PostParts';

/** Beitragsliste der Redaktion mit Beiträgen „In Arbeit“ und veröffentlichten Beiträgen (Anforderung 5, Ticket #23). */
export function PostsPage() {
  const { data: posts, isPending, isError, refetch } = useEditorPosts();
  const { data: topics } = useTopics();
  const topicLabel = (slug: string) => topics?.find((t) => t.slug === slug)?.label ?? slug;

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
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Noch keine Beiträge. Legen Sie mit „Neuer Beitrag“ den ersten an.
                  </td>
                </tr>
              )}
              {posts.map((p) => (
                <Row key={p.id} post={p} topicLabel={topicLabel} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}

function Row({ post: p, topicLabel }: { post: EditorPostSummary; topicLabel: (slug: string) => string }) {
  return (
    <tr>
      <td>
        <Link to={`/beitraege/${p.id}`}>{p.title || 'Ohne Titel'}</Link>
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
    </tr>
  );
}
