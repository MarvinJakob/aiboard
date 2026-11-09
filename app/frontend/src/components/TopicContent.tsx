import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Link, Root, Text } from 'mdast';
import { jumpTo } from '../lib/jump';
import { useLang } from '../lib/lang';
import type { getTopicContent } from '../lib/topicContent';
import { TranslationNotice } from './Status';

const sourceId = (number: number) => `topic-source-${number}`;

/** Verknüpft nummerierte Belege mit der Quellenliste, ohne Code oder vorhandene Links zu verändern. */
function remarkSources() {
  return (tree: Root) => {
    const heading = tree.children.findIndex((node) => node.type === 'heading' && node.depth === 2 &&
      node.children.some((child) => child.type === 'text' && /^(Quellen|Sources)$/.test(child.value)));
    if (heading < 0) return;
    const sources = tree.children.slice(heading + 1).find((node) => node.type === 'list' && node.ordered);
    if (!sources || sources.type !== 'list') return;
    const numbers = new Set<number>();
    sources.children.forEach((item, index) => {
      const number = (sources.start ?? 1) + index;
      numbers.add(number);
      item.data = { ...item.data, hProperties: { id: sourceId(number), tabIndex: -1 } };
    });
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined || parent.type === 'link' || parent.type === 'linkReference') return;
      const parts: (Text | Link)[] = [];
      let cursor = 0;
      for (const match of node.value.matchAll(/\[(\d+)(?:[–-](\d+))?\]/g)) {
        const first = Number(match[1]);
        const last = Number(match[2] ?? match[1]);
        if (last < first || last - first >= numbers.size) continue;
        const range = Array.from({ length: last - first + 1 }, (_, i) => first + i);
        if (!range.every((number) => numbers.has(number))) continue;
        parts.push({ type: 'text', value: node.value.slice(cursor, match.index) });
        // Bereiche erhalten für jede einzelne Quelle einen erreichbaren Verweis.
        range.forEach((number, i) => {
          if (i) parts.push({ type: 'text', value: ' ' });
          parts.push({ type: 'link', url: `#${sourceId(number)}`, children: [{ type: 'text', value: `[${number}]` }] });
        });
        cursor = match.index + match[0].length;
      }
      if (!parts.length) return;
      parts.push({ type: 'text', value: node.value.slice(cursor) });
      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
}

export function TopicContent({ content }: { content: NonNullable<ReturnType<typeof getTopicContent>> }) {
  const { lang, t } = useLang();
  return (
    <article className="topic-content" lang={content.lang}>
      {content.lang !== lang && <div lang={lang}><TranslationNotice text={t('fallbackTopic', { language: t(`langName.${content.lang}`) })} /></div>}
      <div className="prose prose--topic">
        <Markdown skipHtml remarkPlugins={[remarkGfm, remarkSources]} components={{
          a: ({ href, children, title }) => (
            <a title={title} href={href} onClick={href?.startsWith('#topic-source-') ? (e) => jumpTo(e, href.slice(1)) : undefined}>
              {children}
            </a>
          ),
          table: ({ children }) => <div className="topic-table" role="region" aria-label={t('topic.table')} tabIndex={0}><table>{children}</table></div>,
          li: ({ children, className, id, tabIndex }) => (
            <li className={className} id={id} tabIndex={tabIndex}>
              {className?.includes('task-list-item') ? <label>{children}</label> : children}
            </li>
          ),
        }}>{content.body}</Markdown>
      </div>
    </article>
  );
}
