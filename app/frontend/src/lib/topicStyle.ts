import type { CSSProperties } from 'react';
import type { IconName } from '../components/Icon';

// Themenfarben dienen nur Grafiken, Icons und Farbpunkten (Design.md, Abschnitt 4).
// Die generierten Verläufe sind Platzhalter, bis die Bildsprache geklärt ist (Design.md, Abschnitt 12).
interface Palette {
  c1: string;
  c2: string;
  c3: string;
  b1: string;
  b2: string;
  dot: string;
}

const PALETTES: Record<string, Palette> = {
  software: { c1: 'rgba(129,140,248,.95)', c2: 'rgba(192,132,252,.9)', c3: 'rgba(34,211,238,.75)', b1: '#1e1b4b', b2: '#3730a3', dot: '#6366f1' },
  audit: { c1: 'rgba(45,212,191,.9)', c2: 'rgba(74,222,128,.75)', c3: 'rgba(56,189,248,.8)', b1: '#042f2e', b2: '#0f5e6e', dot: '#0d9488' },
  data: { c1: 'rgba(251,146,60,.95)', c2: 'rgba(244,63,94,.85)', c3: 'rgba(250,204,21,.8)', b1: '#431407', b2: '#9a3412', dot: '#ea580c' },
  automation: { c1: 'rgba(56,189,248,.9)', c2: 'rgba(59,130,246,.85)', c3: 'rgba(52,211,153,.75)', b1: '#082f49', b2: '#1e40af', dot: '#0284c7' },
  costs: { c1: 'rgba(250,204,21,.9)', c2: 'rgba(132,204,22,.85)', c3: 'rgba(52,211,153,.75)', b1: '#1a2e05', b2: '#3f6212', dot: '#65a30d' },
};

const TOPICS: Record<string, { palette: keyof typeof PALETTES; icon: IconName }> = {
  softwareentwicklung: { palette: 'software', icon: 'code' },
  'ai-audit': { palette: 'audit', icon: 'shield' },
  'data-analytics': { palette: 'data', icon: 'chart' },
  prozessautomatisierung: { palette: 'automation', icon: 'flow' },
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
