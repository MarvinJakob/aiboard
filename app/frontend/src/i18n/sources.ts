/** Eine Quelle aus der Quellenliste einer Seite. Die Nummer im Text ist der Index + 1. */
export interface Source {
  label: string;
  title: string;
  url: string;
  note?: string;
}

/**
 * Quellen einer Sprache: übernimmt die gemeinsame Liste und ergänzt je Quellennummer
 * übersetzte Angaben (`local`) und einen Hinweis, was die Quelle belegt (`notes`).
 */
export const localizeSources = (
  base: Omit<Source, 'note'>[],
  notes: Record<number, string>,
  local: Record<number, Partial<Source>> = {},
): Source[] => base.map((s, i) => ({ ...s, ...local[i + 1], note: notes[i + 1] }));

/** Ersetzt {{name}} durch den passenden Wert. */
export const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(vars[k] ?? ''));
