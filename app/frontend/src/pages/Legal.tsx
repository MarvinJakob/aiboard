import Markdown from 'react-markdown';
import type { Lang } from '../lib/lang';
import { useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';
import imprintDe from '../content/legal/impressum.de.md?raw';
import imprintEn from '../content/legal/impressum.en.md?raw';
import privacyDe from '../content/legal/datenschutz.de.md?raw';
import privacyEn from '../content/legal/datenschutz.en.md?raw';

// Impressum und Datenschutzerklärung liegen als Markdown je Sprache im Repository (ARCHITECTURE.md, Abschnitt 3).
const TEXTS: Record<'imprint' | 'privacy', Record<Lang, string>> = {
  imprint: { de: imprintDe, en: imprintEn },
  privacy: { de: privacyDe, en: privacyEn },
};

export function Legal({ page }: { page: 'imprint' | 'privacy' }) {
  const { lang, t } = useLang();
  const h1 = usePageFocus<HTMLHeadingElement>();
  const title = t(`footer.${page}`);
  useHead(title, title);
  return (
    <article className="article">
      <h1 className="page-title" tabIndex={-1} ref={h1}>
        {title}
      </h1>
      <div className="prose prose--legal">
        <Markdown skipHtml>{TEXTS[page][lang]}</Markdown>
      </div>
    </article>
  );
}
