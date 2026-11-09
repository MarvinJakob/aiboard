import { jumpTo } from '../lib/jump';
import { useLang } from '../lib/lang';

/** Hochgestellter Verweis auf die Quellenliste der Seite (SourceList), z. B. „³“ → Quelle 3. */
export function Footnote({ n }: { n: number }) {
  const { t } = useLang();
  const id = sourceId(n);
  return (
    <sup className="fn">
      <a href={`#${id}`} aria-label={t('sourceRef', { n })} onClick={(e) => jumpTo(e, id)}>
        {n}
      </a>
    </sup>
  );
}

export const sourceId = (n: number) => `quelle-${n}`;
