import { href, type Lang } from './lang';

/** Thema, unter dem Übersicht, Dimensionsschritte und Auswertung der KI Readiness erscheinen. */
export const AUDIT_TOPIC = 'ai-audit';

/** Pfad der Gesamtauswertung; im Backend als `audit.ResultSlug` für Dimensionen reserviert. */
export const RESULT_SLUG = 'auswertung';

export const auditPath = (lang: Lang, slug?: string) =>
  href(lang, `/themen/${AUDIT_TOPIC}${slug ? `/${slug}` : ''}`);

export const resultPath = (lang: Lang) => auditPath(lang, RESULT_SLUG);

/** Bewusst gewählter Reifegrad: 1 = Einfach, 2 = Strukturiert, 3 = Intelligent. Einen Reifegrad 0 gibt es nicht. */
export type MaturityLevel = 1 | 2 | 3;

/** Gewählte Reifegrade je Dimensions-Slug. Fehlt ein Slug, ist die Dimension noch offen. */
export type Ratings = Readonly<Record<string, MaturityLevel>>;

export interface Progress {
  rated: number;
  total: number;
  complete: boolean;
  /** Erste noch nicht bewertete Dimension in Ablaufreihenfolge */
  firstOpen?: string;
  /** Alle noch nicht bewerteten Dimensionen in Ablaufreihenfolge */
  open: string[];
}

/**
 * Fortschritt der Selbsteinschätzung (Ticket #113). Gezählt werden nur die übergebenen, freigegebenen
 * Dimensionen; Bewertungen anderer Slugs (z. B. inzwischen zurückgezogener Dimensionen) zählen nicht.
 */
export function progress(slugs: readonly string[], ratings: Ratings): Progress {
  const open = slugs.filter((s) => ratings[s] === undefined);
  return { rated: slugs.length - open.length, total: slugs.length, complete: open.length === 0 && slugs.length > 0, firstOpen: open[0], open };
}
