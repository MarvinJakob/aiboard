import { describe, expect, it } from 'vitest';
import { progress } from './audit';

describe('Ticket #113: Fortschritt der Selbsteinschätzung', () => {
  const slugs = ['a', 'b', 'c'];

  it('zählt bewertete und offene Dimensionen in Ablaufreihenfolge', () => {
    expect(progress(slugs, { b: 2 })).toEqual({ rated: 1, total: 3, complete: false, firstOpen: 'a', open: ['a', 'c'] });
  });

  it('ist erst vollständig, wenn jede Dimension genau einen Reifegrad hat', () => {
    expect(progress(slugs, { a: 1, b: 3, c: 2 })).toMatchObject({ complete: true, rated: 3, firstOpen: undefined, open: [] });
  });

  it('zählt Bewertungen nicht freigegebener Dimensionen nicht mit', () => {
    expect(progress(slugs, { a: 1, b: 1, alt: 3 })).toMatchObject({ rated: 2, complete: false, firstOpen: 'c' });
  });

  it('gilt ohne Dimensionen nicht als vollständig', () => {
    expect(progress([], {}).complete).toBe(false);
  });
});
