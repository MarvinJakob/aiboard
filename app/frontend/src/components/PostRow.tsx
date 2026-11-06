import { Link } from 'react-router';
import type { PostSummary, TopicRef } from '../api/client';
import { href, useLang } from '../lib/lang';
import { formatDate } from '../lib/page';
import { seedOf, topicColor } from '../lib/topicStyle';
import { Art } from './Art';

export function TopicChip({ topic }: { topic: TopicRef }) {
  return (
    <span className="chip">
      <i style={{ ['--c' as string]: topicColor(topic.slug) }} aria-hidden="true" />
      {topic.label}
    </span>
  );
}

/** Hinweis-Chip, wenn ein Inhalt nicht in der gewählten Sprache vorliegt (Anforderung 7). */
export function LangChip({ contentLang }: { contentLang: string }) {
  const { t } = useLang();
  return <span className="chip chip--lang">{t('onlyIn', { language: t(`langName.${contentLang}`) })}</span>;
}

/** Beitragszeile: Vorschaubild, Datum, Themen-Chips, Titel und Kurztext. Die ganze Zeile ist ein Link. */
export function PostRow({ post, headingLevel = 3 }: { post: PostSummary; headingLevel?: 2 | 3 }) {
  const { lang } = useLang();
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const fallback = post.lang !== lang;
  const contentLang = fallback ? post.lang : undefined;
  return (
    <li>
      <Link className="post-row" to={href(lang, `/blog/${post.slug}`)}>
        <div className="post-thumb">
          <Art topic={post.topics[0]?.slug} seed={seedOf(post.slug)} image={post.cover} sizes="128px" />
        </div>
        <div className="post-main">
          <p className="post-meta">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
            {post.topics.map((tp) => (
              <TopicChip key={tp.slug} topic={tp} />
            ))}
            {fallback && <LangChip contentLang={post.lang} />}
          </p>
          <H className="post-title" lang={contentLang}>
            {post.title}
          </H>
          <p className="post-teaser" lang={contentLang}>
            {post.summary}
          </p>
        </div>
      </Link>
    </li>
  );
}

export function PostList({ posts, headingLevel }: { posts: PostSummary[]; headingLevel?: 2 | 3 }) {
  return (
    <ul className="post-list">
      {posts.map((p) => (
        <PostRow key={p.slug} post={p} headingLevel={headingLevel} />
      ))}
    </ul>
  );
}
