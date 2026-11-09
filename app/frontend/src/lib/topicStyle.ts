import type { CSSProperties } from 'react';
import type { IconName } from '../components/Icon';

// Themenfarben dienen nur Grafiken, Icons und Farbpunkten; Bedeutung tragen immer Text und Symbol.
// Die generierten Verläufe sind Platzhalter, bis die Bildsprache geklärt ist (Design.md, Abschnitt 12).
interface Palette {
  c1: string;
  c2: string;
  c3: string;
  b1: string;
  b2: string;
  dot: string;
}

// cimt × Apple (DESIGN_CIMT.md): Alle Grafiken stehen auf dunklem Blau mit orangefarbenen und blaugrauen
// Lichtern. Die Themen unterscheiden sich über Mischung und Lage der Lichter sowie ihr Symbol.
const PALETTES: Record<string, Palette> = {
  software: { c1: 'rgba(220,110,20,.7)', c2: 'rgba(144,165,184,.35)', c3: 'rgba(245,166,107,.4)', b1: '#12263a', b2: '#1d3a54', dot: '#dc6e14' },
  audit: { c1: 'rgba(144,165,184,.45)', c2: 'rgba(220,110,20,.55)', c3: 'rgba(95,125,149,.5)', b1: '#0f2131', b2: '#23455f', dot: '#5f7d95' },
  data: { c1: 'rgba(245,166,107,.6)', c2: 'rgba(220,110,20,.5)', c3: 'rgba(144,165,184,.3)', b1: '#172f44', b2: '#2a2f3a', dot: '#f39b56' },
  automation: { c1: 'rgba(95,125,149,.6)', c2: 'rgba(245,166,107,.45)', c3: 'rgba(220,110,20,.4)', b1: '#12263a', b2: '#2b4a63', dot: '#8fa3b4' },
  skills: { c1: 'rgba(220,110,20,.55)', c2: 'rgba(245,166,107,.5)', c3: 'rgba(95,125,149,.45)', b1: '#1c292f', b2: '#33404a', dot: '#b85a12' },
  costs: { c1: 'rgba(144,165,184,.4)', c2: 'rgba(220,110,20,.45)', c3: 'rgba(245,166,107,.35)', b1: '#0d1d2b', b2: '#203a4f', dot: '#3f6585' },
};

const TOPICS: Record<string, { palette: keyof typeof PALETTES; icon: IconName }> = {
  softwareentwicklung: { palette: 'software', icon: 'code' },
  'ai-audit': { palette: 'audit', icon: 'shield' },
  'data-analytics': { palette: 'data', icon: 'chart' },
  prozessautomatisierung: { palette: 'automation', icon: 'flow' },
  'ki-tipps-und-tricks': { palette: 'skills', icon: 'bulb' },
  'modelle-und-kosten': { palette: 'costs', icon: 'coins' },
};

const FALLBACK = { palette: 'software' as const, icon: 'spark' as IconName };

export const topicStyle = (slug: string | undefined) => (slug && TOPICS[slug]) || FALLBACK;

export const topicColor = (slug: string | undefined) => PALETTES[topicStyle(slug).palette].dot;

/** Kleine, stabile Zahl aus einem Text, damit jede Grafik leicht anders aussieht. */
export function seedOf(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 997;
  return h;
}

export function artBackground(slug: string | undefined, seed = 0): CSSProperties {
  const p = PALETTES[topicStyle(slug).palette];
  const s = seed * 23;
  const x1 = 15 + (s % 30);
  const y1 = 25 + ((s * 3) % 30);
  const x2 = 85 - ((s * 2) % 30);
  const y2 = 15 + (s % 25);
  const x3 = 40 + ((s * 5) % 35);
  return {
    background: [
      `radial-gradient(55% 75% at ${x1}% ${y1}%, ${p.c1}, transparent 70%)`,
      `radial-gradient(45% 65% at ${x2}% ${y2}%, ${p.c2}, transparent 70%)`,
      `radial-gradient(65% 55% at ${x3}% 100%, ${p.c3}, transparent 70%)`,
      `linear-gradient(135deg, ${p.b1}, ${p.b2})`,
    ].join(','),
  };
}
