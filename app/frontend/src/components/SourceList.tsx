import type { Source } from '../i18n/sources';
import { sourceId } from './Footnote';

/** Nummerierte Quellenliste am Seitenende. Ziel der Footnote-Verweise; jede Quelle ist per Sprung fokussierbar. */
export function SourceList({ title, sources }: { title: string; sources: Source[] }) {
  return (
    <section className="container sources" aria-labelledby="quellen-title">
      <h2 id="quellen-title">{title}</h2>
      <ol>
        {sources.map((s, i) => (
          <li key={s.url} id={sourceId(i + 1)} tabIndex={-1}>
            {s.label}: <a href={s.url}>{s.title}</a>
            {s.note && ` – ${s.note}`}
          </li>
        ))}
      </ol>
    </section>
  );
}
