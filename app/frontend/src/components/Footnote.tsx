import { fill, home } from '../i18n/home';
import { jumpTo } from '../lib/jump';
import { useLang } from '../lib/lang';

/** Hochgestellter Verweis auf die Quellenliste der Startseite, z. B. „³“ → Quelle 3. */
export function Footnote({ n }: { n: number }) {
  const { lang } = useLang();
  const id = sourceId(n);
  return (
    <sup className="fn">
      <a href={`#${id}`} aria-label={fill(home[lang].source, { n })} onClick={(e) => jumpTo(e, id)}>
        {n}
      </a>
    </sup>
  );
}

export const sourceId = (n: number) => `quelle-${n}`;
