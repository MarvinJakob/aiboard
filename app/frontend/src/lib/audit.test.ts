import { describe, expect, it } from 'vitest';
import type { AuditLevel } from '../api/client';
import { assess, type Answers } from './audit';

const q = (id: string, conditional = false) => ({ id, text: id, conditional });
const levels: AuditLevel[] = [
  { level: 1, name: 'Einfach', description: '', questions: [q('1.1'), q('1.2')] },
  { level: 2, name: 'Strukturiert', description: '', questions: [q('2.1'), q('2.2', true)] },
  { level: 3, name: 'Intelligent', description: '', questions: [q('3.1')] },
];
const all = (a: Answers['x']): Answers => Object.fromEntries(levels.flatMap((l) => l.questions).map((x) => [x.id, a]));

describe('Anforderung 10: Auswertung der Selbsteinschätzung', () => {
  it('liefert vor der letzten Antwort kein Ergebnis, sondern die offenen Fragen', () => {
    const r = assess(levels, { '1.1': 'yes', '1.2': 'yes' });
    expect(r).toMatchObject({ complete: false, answered: 2, total: 5, firstOpen: { id: '2.1' } });
  });

  it.each([
    ['Nicht angewendet', { ...all('yes'), '1.2': 'no' }, 0],
    ['Einfach', { ...all('yes'), '2.1': 'no' }, 1],
    ['Strukturiert', { ...all('yes'), '3.1': 'no' }, 2],
    ['Intelligent', all('yes'), 3],
  ] as const)('ermittelt %s', (_, answers, level) => {
    expect(assess(levels, answers)).toMatchObject({ complete: true, level });
  });

  it('ist kumulativ: Ja auf höheren Stufen hilft nicht, wenn eine Stufe darunter fehlt', () => {
    expect(assess(levels, { ...all('yes'), '1.1': 'no' })).toMatchObject({ complete: true, level: 0 });
  });

  it('nennt die nicht erfüllten Fragen des nächsten Reifegrads als nächsten Schritt', () => {
    const r = assess(levels, { ...all('no'), '1.1': 'yes', '1.2': 'yes', '2.2': 'yes' });
    expect(r).toMatchObject({ complete: true, level: 1, nextSteps: [{ id: '2.1' }] });
  });

  it('wertet „Trifft nicht zu“ nur bei bedingten Fragen als erfüllt', () => {
    expect(assess(levels, { ...all('yes'), '2.2': 'na' })).toMatchObject({ complete: true, level: 3 });
    expect(assess(levels, { ...all('yes'), '2.1': 'na' })).toMatchObject({ complete: false, firstOpen: { id: '2.1' } });
  });
});
