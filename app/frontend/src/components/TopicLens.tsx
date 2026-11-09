import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import type { Topic } from '../api/client';
import { fill, home } from '../i18n/home';
import { href, useLang } from '../lib/lang';

// Lage der drei Kreise und ihrer Beschriftungen im 400 × 400-Raster des Entwurfs.
const ORBS = [
  { slug: 'softwareentwicklung', gradient: 'lens-indigo', cx: 145, cy: 150, lx: 92, ly: 112 },
  { slug: 'ai-audit', gradient: 'lens-teal', cx: 255, cy: 150, lx: 310, ly: 112 },
  { slug: 'data-analytics', gradient: 'lens-orange', cx: 200, cy: 245, lx: 200, ly: 318 },
] as const;

interface Props {
  topics: Topic[] | undefined;
  hot: string | null;
  onHot: (slug: string | null) => void;
}

/**
 * Grafik der Startseite aus drei überlappenden Kreisen, je einer pro Thema (mock/landing).
 * Jeder Kreis ist ein Link zur Themenseite und hebt beim Überfahren oder Fokussieren die passende Themenkarte hervor.
 */
export function TopicLens({ topics, hot, onHot }: Props) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const c = home[lang];

  const open = (e: MouseEvent, path: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(path);
  };

  return (
    <div className={`lens${hot ? ' has-hot' : ''}`}>
      <svg viewBox="0 0 400 400" role="group" aria-label={c.lensLabel}>
        <defs>
          <radialGradient id="lens-indigo" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#a5b4fc" />
            <stop offset=".6" stopColor="#6366f1" />
            <stop offset="1" stopColor="#7c3aed" />
          </radialGradient>
          <radialGradient id="lens-teal" cx="65%" cy="30%" r="75%">
            <stop offset="0" stopColor="#99f6e4" />
            <stop offset=".6" stopColor="#14b8a6" />
            <stop offset="1" stopColor="#0d9488" />
          </radialGradient>
          <radialGradient id="lens-orange" cx="50%" cy="70%" r="75%">
            <stop offset="0" stopColor="#fed7aa" />
            <stop offset=".6" stopColor="#fb923c" />
            <stop offset="1" stopColor="#ea580c" />
          </radialGradient>
        </defs>
        {ORBS.map((o) => {
          const path = href(lang, `/themen/${o.slug}`);
          const label = c.lens[o.slug];
          const title = topics?.find((tp) => tp.slug === o.slug)?.title ?? `${label.line1} ${label.line2}`;
          return (
            <a
              key={o.slug}
              href={path}
              className={hot === o.slug ? 'is-hot' : undefined}
              aria-label={fill(c.lensTopic, { title })}
              onClick={(e) => open(e, path)}
              onPointerEnter={() => onHot(o.slug)}
              onPointerLeave={() => onHot(null)}
              onFocus={() => onHot(o.slug)}
              onBlur={() => onHot(null)}
            >
              <circle className="orb" cx={o.cx} cy={o.cy} r="112" fill={`url(#${o.gradient})`} opacity=".85" />
              <circle className="ring" cx={o.cx} cy={o.cy} r="112" fill="none" stroke="none" />
              <text className="lbl" x={o.lx} y={o.ly} textAnchor="middle" aria-hidden="true">
                {label.line1}
              </text>
              <text className="lbl-sub" x={o.lx} y={o.ly + 18} textAnchor="middle" aria-hidden="true">
                {label.line2}
              </text>
            </a>
          );
        })}
        <g aria-hidden="true" pointerEvents="none">
          <circle className="core-bg" cx="200" cy="182" r="34" />
          <text className="core" x="200" y="193" textAnchor="middle">
            {c.lensCore}
          </text>
        </g>
      </svg>
      <span className="lens-note" aria-hidden="true">
        {c.lensNote}
      </span>
    </div>
  );
}
