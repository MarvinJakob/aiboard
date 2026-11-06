import { describe, expect, it } from 'vitest';
import type { AuditLevel } from '../api/client';
import raw from '../../../backend/internal/audit/content.json?raw';
import { assess, type Answer, type Answers } from './audit';

// Prüft die Antwortsätze aus docs/audit-abnahme.md gegen die echten Audit-Inhalte des Backends
// (Anforderung 10: je Dimension und Reifegrad mindestens ein dokumentierter Antwortsatz).

interface Content {
  dimensions: {
    slug: string;
    released: boolean;
    texts: { de: { levels: { questions: { text: string; conditional?: boolean }[] }[] } };
  }[];
}

const content = JSON.parse(raw) as Content;

const dimensions = content.dimensions
  .filter((d) => d.released)
  .map((d) => ({
    slug: d.slug,
    levels: d.texts.de.levels.map(
      (l, i): AuditLevel => ({
        level: i + 1,
        name: '',
        description: '',
        questions: l.questions.map((q, j) => ({ id: `${i + 1}.${j + 1}`, text: q.text, conditional: !!q.conditional })),
      }),
    ),
  }));

/** Stufen bis einschließlich `upTo` mit Ja, alle höheren mit Nein. */
function answerSet(levels: AuditLevel[], upTo: number, conditional: Answer = 'yes'): Answers {
  const out: Record<string, Answer> = {};
  for (const l of levels) {
    for (const q of l.questions) out[q.id] = l.level <= upTo ? (q.conditional ? conditional : 'yes') : 'no';
  }
  return out;
}

describe('Anforderung 10: dokumentierte Antwortsätze je Dimension', () => {
  it('umfasst alle freigegebenen Dimensionen', () => {
    expect(dimensions.map((d) => d.slug)).toContain('strategie-und-wirtschaftlichkeit');
    expect(dimensions).toHaveLength(8);
  });

  describe.each(dimensions)('$slug', ({ levels }) => {
    it.each([
      ['Nicht angewendet', 0],
      ['Einfach', 1],
      ['Strukturiert', 2],
      ['Intelligent', 3],
    ])('ergibt %s', (_, level) => {
      expect(assess(levels, answerSet(levels, level))).toMatchObject({ complete: true, level });
    });

    it('wertet „Trifft nicht zu“ bei bedingten Fragen wie Ja', () => {
      expect(assess(levels, answerSet(levels, 3, 'na'))).toMatchObject({ complete: true, level: 3 });
    });
  });
});
