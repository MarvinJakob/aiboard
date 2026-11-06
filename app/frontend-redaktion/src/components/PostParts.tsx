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

/**
 * Ergebnis der Umrechnung einer Ortszeit nach UTC (Ticket #32). Bei der Zeitumstellung gibt es Uhrzeiten,
 * die nicht existieren (Sommerzeit beginnt, die Uhr springt vor), und solche, die zweimal vorkommen
 * (Sommerzeit endet). Dann wird nichts stillschweigend verschoben oder ausgewählt.
 */
export type LocalTime =
  | { kind: 'empty' }
  | { kind: 'ok'; iso: string }
  | { kind: 'nonexistent' }
  | { kind: 'ambiguous'; options: [string, string] };

const LOCAL_INPUT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Wert eines datetime-local-Felds (lokale Zeit) eindeutig in UTC umrechnen. */
export function resolveLocalInput(value: string): LocalTime {
  const v = value.slice(0, 16);
  if (!LOCAL_INPUT.test(v)) return { kind: 'empty' };
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return { kind: 'empty' };
  // Der Browser verschiebt nicht existierende Uhrzeiten stillschweigend: Die Rückrechnung passt dann nicht.
  if (toLocalInput(d) !== v) return { kind: 'nonexistent' };
  // Kommt dieselbe Ortszeit eine Stunde (oder halbe Stunde) früher oder später noch einmal vor?
  const others = [-60, -30, 30, 60]
    .map((m) => new Date(d.getTime() + m * 60_000))
    .filter((o) => toLocalInput(o) === v);
  if (others.length > 0) {
    const all = [d, others[0]].sort((a, b) => a.getTime() - b.getTime());
    return { kind: 'ambiguous', options: [all[0].toISOString(), all[1].toISOString()] };
  }
  return { kind: 'ok', iso: d.toISOString() };
}

/** Wert eines datetime-local-Felds als ISO-Zeitpunkt in UTC; null bei leeren, ungültigen oder mehrdeutigen Werten. */
export function fromLocalInput(value: string): string | null {
  const r = resolveLocalInput(value);
  return r.kind === 'ok' ? r.iso : null;
}

const zoneFormat = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
});
const utcFormat = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

/** Zeitpunkt eindeutig mit Zeitzone und UTC, z. B. „31.10.2027, 02:30 MESZ (00:30 UTC)“. */
export const formatWithZone = (iso: string) => `${zoneFormat.format(new Date(iso))} (${utcFormat.format(new Date(iso))} UTC)`;
