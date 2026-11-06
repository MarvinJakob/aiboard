import type { EditorPost } from '../api/posts';

/** Status als Badge, immer sichtbar (Design.md, Redaktionssystem). */
export function StatusBadge({ status }: { status: EditorPost['status'] }) {
  return status === 'published' ? (
    <span className="badge badge-published">Veröffentlicht</span>
  ) : (
    <span className="badge badge-draft">Entwurf</span>
  );
}

const dateFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' });

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
