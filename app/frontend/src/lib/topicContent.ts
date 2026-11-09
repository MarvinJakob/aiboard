import type { Lang } from './lang';

const documents = import.meta.glob<string>('../content/topics/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** Metadaten vor dem ersten Trenner, Seiteninhalt danach. Eine leere Fassung nutzt den deutschen Text. */
function readDocument(slug: string, lang: Lang) {
  const source = documents[`../content/topics/${slug}.${lang}.md`];
  if (!source) return undefined;
  const separator = /^---\s*$/m.exec(source);
  const metadata = separator ? source.slice(0, separator.index) : source;
  return {
    subtitle: /\*\*Untertitel:\*\*\s*(.+)/.exec(metadata)?.[1]?.trim(),
    body: separator ? source.slice(separator.index + separator[0].length).trim() : '',
  };
}

export function getTopicContent(slug: string, lang: Lang) {
  const requested = readDocument(slug, lang);
  const content = requested?.body ? requested : readDocument(slug, 'de');
  if (!content?.body) return undefined;
  return { subtitle: requested?.subtitle ?? content.subtitle, body: content.body, lang: requested?.body ? lang : 'de' as Lang };
}
