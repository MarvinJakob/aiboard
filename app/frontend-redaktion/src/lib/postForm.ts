import { LANGS, type EditorPost, type Lang, type PostInput, type PostText } from '../api/posts';

/** Formularstand des Beitragseditors: beide Sprachfassungen sind immer vorhanden, auch wenn leer. */
export interface Form {
  slug: string;
  featured: boolean;
  topics: string[];
  texts: Record<Lang, PostText>;
}

const emptyText = (lang: Lang): PostText => ({ lang, title: '', summary: '', bodyMarkdown: '', coverAlt: '' });

/** Meldungen zur Zeitumstellung (Ticket #32). */
export const NONEXISTENT =
  'Diese Uhrzeit gibt es an diesem Tag wegen der Umstellung auf Sommerzeit nicht. Bitte wählen Sie eine andere Uhrzeit.';
export const AMBIGUOUS = 'Diese Uhrzeit gibt es wegen der Zeitumstellung zweimal. Bitte wählen Sie, welche gemeint ist.';

/** Grenzen für Titelbilder wie im Backend (Ticket #25). */
const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const COVER_MAX_BYTES = 5 * 1024 * 1024;

/** Prüft eine Bilddatei vor dem Hochladen. Das Backend prüft den Inhalt noch einmal. */
export function coverProblem(file: File): string | null {
  if (!COVER_TYPES.includes(file.type)) return 'Dieser Dateityp wird nicht unterstützt. Erlaubt sind JPEG, PNG und WebP.';
  if (file.size > COVER_MAX_BYTES) return 'Die Datei ist größer als 5 MB. Bitte ein kleineres Bild wählen.';
  return null;
}

/** Baut den Formularstand aus einem gespeicherten Beitrag (oder leer für einen neuen). */
export function toForm(p?: EditorPost): Form {
  const texts = { de: emptyText('de'), en: emptyText('en') };
  for (const t of p?.texts ?? []) texts[t.lang] = { ...t, coverAlt: t.coverAlt ?? '' };
  return { slug: p?.slug ?? '', featured: p?.featured ?? false, topics: p?.topics ?? [], texts };
}

/** Wandelt das Formular in die API-Eingabe um; vollständig leere Sprachfassungen entfallen. */
export function toInput(f: Form): PostInput {
  return {
    slug: f.slug.trim() || undefined,
    featured: f.featured,
    topics: f.topics,
    texts: LANGS.map((l) => f.texts[l]).filter(hasText),
  };
}

/** Meldet, ob eine Sprachfassung mindestens ein Feld mit Inhalt hat. */
export const hasText = (t: PostText) => Boolean(t.title.trim() || t.summary.trim() || t.bodyMarkdown.trim());
