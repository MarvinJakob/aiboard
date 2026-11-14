import { describe, expect, it } from 'vitest';
import { radarPoints, wrapLabel } from './radar';

// Ticket #114: Einfach = 1, Strukturiert = 2, Intelligent = 3 auf einer gemeinsamen Skala bis zum Radius.
const R = 150;
const distance = (p: { x: number; y: number }) => Math.hypot(p.x - 200, p.y - 200);
const radii = (levels: number[]) => radarPoints(levels, R, 200, 200).map((p) => Math.round(distance(p)));

describe('Ticket #114: Werte des Netzdiagramms', () => {
  it('legt „alle Einfach“ auf den inneren Ring', () => {
    expect(radii(Array(8).fill(1))).toEqual(Array(8).fill(50));
  });

  it('legt „alle Intelligent“ auf den äußeren Ring', () => {
    expect(radii(Array(8).fill(3))).toEqual(Array(8).fill(150));
  });

  it('bildet gemischte Bewertungen je Achse exakt ab', () => {
    expect(radii([2, 1, 3, 2, 1, 2, 3, 1])).toEqual([100, 50, 150, 100, 50, 100, 150, 50]);
  });

  it('beginnt oben und folgt der Ablaufreihenfolge im Uhrzeigersinn', () => {
    const [first, second, third] = radarPoints([3, 3, 3, 3], R, 200, 200);
    expect(first.x).toBeCloseTo(200);
    expect(first.y).toBeCloseTo(50);
    expect(second.x).toBeCloseTo(350);
    expect(third.y).toBeCloseTo(350);
  });

  it('stellt eine fehlende Auswahl nie als Reifegrad 0 dar', () => {
    expect(() => radarPoints([1, 0], R, 0, 0)).toThrow();
    expect(() => radarPoints([1, undefined as unknown as number], R, 0, 0)).toThrow();
  });

  it('bricht Achsenbeschriftungen an Wortgrenzen um', () => {
    expect(wrapLabel('Ressourcenplanung und Kompetenzen', 17)).toEqual(['Ressourcenplanung', 'und Kompetenzen']);
    expect(wrapLabel('Betrieb', 17)).toEqual(['Betrieb']);
  });
});
