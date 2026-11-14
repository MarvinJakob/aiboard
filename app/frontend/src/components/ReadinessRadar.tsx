import { useEffect, useId, useRef, useState } from 'react';
import { useLang, type Lang } from '../lib/lang';
import { axisPoint, MAX_LEVEL, radarPoints, wrapLabel } from '../lib/radar';

export interface RadarItem {
  slug: string;
  title: string;
  /** Sprache des Titels, falls sie von der Oberfläche abweicht */
  lang?: Lang;
  level: number;
  levelName: string;
}

interface Props {
  items: RadarItem[];
  /** Namen der Reifegrade 1 bis 3 für die Ringbeschriftung */
  levelNames: string[];
}

/** Unterhalb dieser Breite tragen die Achsen nur ihre Nummer; die Namen stehen nummeriert in der Tabelle darunter. */
const COMPACT_BELOW = 520;
const LINE = 16;

/**
 * Netzdiagramm der selbst eingeschätzten Reifegrade (Ticket #114). Eine Achse je Dimension in Ablaufreihenfolge,
 * Ringe für Reifegrad 1 bis 3, eine Datenreihe ohne Legende (der Titel benennt sie). Das SVG wird in echter
 * Pixelbreite gezeichnet, damit Beschriftungen auch bei 320 px lesbar bleiben, statt mitzuschrumpfen.
 * Für Screenreader beschreibt `desc` alle Werte; die Tabelle der Auswertung ist die Textfassung.
 */
export function ReadinessRadar({ items, levelNames }: Props) {
  const { lang, t } = useLang();
  const ids = useId();
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = items.length;
  const compact = width < COMPACT_BELOW;
  const W = Math.min(width, 640);
  const R = compact ? Math.max(W / 2 - 34, 80) : Math.min(W / 2 - 140, 190);
  const padY = compact ? 36 : 76;
  const H = 2 * R + 2 * padY;
  const cx = W / 2;
  const cy = H / 2;
  const points = radarPoints(items.map((i) => i.level), R, cx, cy);
  const ring = (level: number) =>
    items.map((_, i) => axisPoint(cx, cy, (R * level) / MAX_LEVEL, i, n)).map((p) => `${p.x},${p.y}`).join(' ');
  const value = (item: RadarItem) => t('assess.levelValue', { n: item.level, name: item.levelName });

  return (
    <div className="radar" ref={box}>
      {/* Innere Fläche in Diagrammbreite: Bezugsrahmen für den Tooltip, mittig in der gemessenen Breite */}
      <div className="radar-canvas" style={{ width: `${W}px` }}>
        <svg
          className="radar-svg"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby={`${ids}-title`}
          aria-describedby={`${ids}-desc`}
        >
          <title id={`${ids}-title`}>{t('assess.radarSvgTitle')}</title>
          <desc id={`${ids}-desc`}>
            {items.map((item, i) => t('assess.radarDescItem', { n: i + 1, title: item.title, value: value(item) })).join('; ')}
          </desc>

          <g className="radar-grid" aria-hidden="true">
            {[1, 2, 3].map((level) => (
              <polygon key={level} points={ring(level)} />
            ))}
            {items.map((item, i) => {
              const end = axisPoint(cx, cy, R, i, n);
              return <line key={item.slug} x1={cx} y1={cy} x2={end.x} y2={end.y} />;
            })}
          </g>

          {/* Skala links neben der oberen Achse, knapp innerhalb des jeweiligen Rings: dort kollidiert sie nicht mit
              den Achsenbeschriftungen außerhalb des Diagramms. */}
          <g className="radar-scale" aria-hidden="true">
            {[1, 2, 3].map((level) => (
              <text key={level} x={cx - 7} y={cy - (R * level) / MAX_LEVEL + 13} textAnchor="end">
                {compact ? level : `${level} ${levelNames[level - 1] ?? ''}`}
              </text>
            ))}
          </g>

          <polygon className="radar-area" points={points.map((p) => `${p.x},${p.y}`).join(' ')} />

          <g className="radar-labels" aria-hidden="true">
            {items.map((item, i) => {
              const p = axisPoint(cx, cy, R + 14, i, n);
              const anchor = p.sin > 0.2 ? 'start' : p.sin < -0.2 ? 'end' : 'middle';
              const lines = compact ? [] : wrapLabel(item.title, 17);
              const total = lines.length + 1;
              // Oben stehen die Zeilen über der Achsspitze, unten darunter, seitlich mittig.
              const top =
                p.cos > 0.3 ? p.y - (total - 1) * LINE - 2 : p.cos < -0.3 ? p.y + 12 : p.y - ((total - 1) * LINE) / 2 + 5;
              return (
                <text key={item.slug} x={p.x} y={top} textAnchor={anchor} lang={item.lang !== lang ? item.lang : undefined}>
                  <tspan className="radar-label-no" x={p.x}>
                    {i + 1}
                  </tspan>
                  {lines.map((line, l) => (
                    <tspan key={l} x={p.x} dy={LINE}>
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            })}
          </g>

          <g className="radar-points">
            {points.map((p, i) => (
              <g key={items[i].slug} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover((h) => (h === i ? null : h))}>
                {/* Trefferfläche größer als der Punkt */}
                <circle className="radar-hit" cx={p.x} cy={p.y} r={14} />
                <circle className="radar-dot" cx={p.x} cy={p.y} r={5} data-level={items[i].level} />
              </g>
            ))}
          </g>
        </svg>
        {hover !== null && (
          <div className="radar-tip" role="presentation" style={{ left: `${points[hover].x}px`, top: `${points[hover].y}px` }}>
            <strong lang={items[hover].lang !== lang ? items[hover].lang : undefined}>
              {hover + 1}. {items[hover].title}
            </strong>
            <span>{value(items[hover])}</span>
          </div>
        )}
      </div>
    </div>
  );
}
