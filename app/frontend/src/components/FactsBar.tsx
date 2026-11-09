import { useEffect, useRef, useState } from 'react';
import { aiUses } from '../i18n/aiUses';
import { prefersReducedMotion } from '../lib/jump';
import { useLang, type Lang } from '../lib/lang';
import { Footnote } from './Footnote';

const DURATION = 900;

const percent = (v: number, lang: Lang, decimals: number) =>
  new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v / 100);

/** Kennzahlen zur KI-Nutzung in Deutschland mit Quellenverweis (Seite KI-Einsatzfelder). */
export function FactsBar() {
  const { lang } = useLang();
  const c = aiUses[lang];
  return (
    <section className="container" aria-labelledby="facts-title">
      <h2 className="sr-only" id="facts-title">
        {c.factsTitle}
      </h2>
      <div className="facts">
        {c.facts.map((f) => (
          <div className="fact" key={f.value}>
            <Counter value={f.value} lang={lang} />
            <p>
              {f.text}
              <Footnote n={f.source} />
            </p>
          </div>
        ))}
        <p className="facts-caption">
          <span>{c.factsCaption}</span>
          <span>{c.factsSources}</span>
        </p>
      </div>
    </section>
  );
}

/**
 * Zählt beim ersten Erscheinen von 0 bis zum Wert hoch. Ohne IntersectionObserver oder bei reduzierter
 * Bewegung steht sofort der Endwert. Screenreader lesen nur den Endwert.
 */
function Counter({ value, lang }: { value: number; lang: Lang }) {
  const decimals = Number.isInteger(value) ? 0 : 1;
  const ref = useRef<HTMLElement>(null);
  const [animate] = useState(() => typeof IntersectionObserver !== 'undefined' && !prefersReducedMotion());
  const [shown, setShown] = useState(animate ? 0 : value);

  useEffect(() => {
    const el = ref.current;
    if (!animate || !el) return;
    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / DURATION);
          setShown(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [animate, value]);

  return (
    <strong ref={ref}>
      <span aria-hidden="true">{percent(shown, lang, decimals)}</span>
      <span className="sr-only">{percent(value, lang, decimals)}</span>
    </strong>
  );
}
