import type { EditorPost } from '../api/posts';

/** Status als Badge, immer sichtbar (Design.md, Redaktionssystem; Ticket #23: „In Arbeit“ oder „Veröffentlicht“). */
export function StatusBadge({ status }: { status: EditorPost['status'] }) {
  return status === 'published' ? (
    <span className="badge badge-published">Veröffentlicht</span>
  ) : (
    <span className="badge badge-draft">In Arbeit</span>
  );
}

const dateFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' });

/** Zeitpunkte kommen in UTC vom Backend und erscheinen in der lokalen Zeit des Browsers. */
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO-Zeitpunkt als Wert für ein Feld vom Typ datetime-local in lokaler Zeit, z. B. 2026-11-12T09:30. */
export function toLocalInput(iso: string | Date): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Wert eines datetime-local-Felds (lokale Zeit) als ISO-Zeitpunkt in UTC. Ungültige Werte liefern null. */
export function fromLocalInput(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
