/** Höchster Reifegrad; die Skala des Netzdiagramms reicht von der Mitte bis Reifegrad 3 am äußeren Ring. */
export const MAX_LEVEL = 3;

export interface Point {
  x: number;
  y: number;
  /** Richtung der Achse als Einheitsvektor: sin > 0 rechts, cos > 0 oben */
  sin: number;
  cos: number;
}

/** Punkt auf Achse `i` von `n` (Achse 0 zeigt nach oben, weiter im Uhrzeigersinn) im Abstand `r` vom Mittelpunkt. */
export function axisPoint(cx: number, cy: number, r: number, i: number, n: number): Point {
  const angle = (2 * Math.PI * i) / n;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  return { x: cx + r * sin, y: cy - r * cos, sin, cos };
}

/**
 * Datenpunkte des Netzdiagramms (Ticket #114): Reifegrad 1 bis 3 liegt auf dem gleichnamigen Ring, also bei
 * 1/3, 2/3 und dem vollen Radius. Werte außerhalb 1 bis 3 sind ein Programmierfehler: Eine fehlende Auswahl
 * darf nie als Reifegrad 0 in der Mitte erscheinen, daher zeigt die Auswertung ohne alle Werte kein Diagramm.
 */
export function radarPoints(levels: readonly number[], radius: number, cx: number, cy: number): Point[] {
  return levels.map((level, i) => {
    if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) throw new Error(`Ungültiger Reifegrad ${level}`);
    return axisPoint(cx, cy, (radius * level) / MAX_LEVEL, i, levels.length);
  });
}

/** Bricht eine Achsenbeschriftung an Wortgrenzen in Zeilen von höchstens `max` Zeichen um. */
export function wrapLabel(text: string, max: number): string[] {
  const lines: string[] = [];
  for (const word of text.split(/\s+/)) {
    const last = lines.length - 1;
    if (last >= 0 && lines[last].length + 1 + word.length <= max) lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}
