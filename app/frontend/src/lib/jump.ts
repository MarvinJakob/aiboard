import type { MouseEvent } from 'react';

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Sprungmarke innerhalb der Seite: scrollt zum Ziel und setzt den Fokus darauf, ohne die URL zu ändern.
 * So löst der Router keinen Seitenwechsel aus, der den Fokus auf die H1 zurücksetzen würde.
 * Das Ziel braucht tabIndex={-1}. Mit Zusatztaste oder ohne Ziel bleibt das normale Linkverhalten.
 */
export function jumpTo(e: MouseEvent<Element>, id: string) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
}
