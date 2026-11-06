import type { AuditLevel, AuditQuestion } from '../api/client';
import { href, type Lang } from './lang';

/** Thema, unter dem Audit-Übersicht und Dimensionsseiten erscheinen (Anforderungen 8 und 9). */
export const AUDIT_TOPIC = 'ai-audit';

export const auditPath = (lang: Lang, slug?: string) =>
  href(lang, `/themen/${AUDIT_TOPIC}${slug ? `/${slug}` : ''}`);

/** Antwort auf eine Prüffrage. „Trifft nicht zu“ gibt es nur für bedingte Fragen. */
export type Answer = 'yes' | 'no' | 'na';
export type Answers = Readonly<Record<string, Answer>>;

export type Assessment =
  | { complete: false; answered: number; total: number; firstOpen: AuditQuestion }
  | {
      complete: true;
      total: number;
      /** 0 = Nicht angewendet, 1 = Einfach, 2 = Strukturiert, 3 = Intelligent */
      level: number;
      /** Nicht erfüllte Fragen des nächsthöheren Reifegrads: die To-do-Liste */
      nextSteps: AuditQuestion[];
    };

/** Eine Frage gilt als erfüllt bei „Ja“ oder, wenn sie bedingt ist, bei „Trifft nicht zu“. */
export const fulfilled = (q: AuditQuestion, a: Answer | undefined) =>
  a === 'yes' || (a === 'na' && q.conditional);

/**
 * Ermittelt den Reifegrad einer Dimension (content/KI Audit.docx, Regeln für die Bewertung).
 *
 * - Alle Fragen sind Pflichtfragen. Fehlt eine Antwort, gibt es noch kein Ergebnis.
 * - Kumulativ: Ein Reifegrad gilt nur, wenn alle seine Fragen und die aller darunterliegenden erfüllt sind.
 *   Sprünge sind nicht möglich.
 * - Ist Reifegrad 1 nicht erfüllt, gilt Reifegrad 0 „Nicht angewendet“.
 */
export function assess(levels: readonly AuditLevel[], answers: Answers): Assessment {
  const questions = levels.flatMap((l) => l.questions);
  const open = questions.filter((q) => !isAnswered(q, answers[q.id]));
  if (open.length > 0) {
    return { complete: false, answered: questions.length - open.length, total: questions.length, firstOpen: open[0] };
  }
  const sorted = [...levels].sort((a, b) => a.level - b.level);
  let level = 0;
  for (const l of sorted) {
    if (!l.questions.every((q) => fulfilled(q, answers[q.id]))) break;
    level = l.level;
  }
  const next = sorted.find((l) => l.level === level + 1);
  const nextSteps = next ? next.questions.filter((q) => !fulfilled(q, answers[q.id])) : [];
  return { complete: true, total: questions.length, level, nextSteps };
}

// „Trifft nicht zu“ bei einer unbedingten Frage zählt nicht als Antwort.
const isAnswered = (q: AuditQuestion, a: Answer | undefined) =>
  a === 'yes' || a === 'no' || (a === 'na' && q.conditional);
