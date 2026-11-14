import { Link, useParams } from 'react-router';
import { isNotFound, useTopic } from '../api/client';
import { Art } from '../components/Art';
import { AuditOverview } from '../components/AuditOverview';
import { TopicContent } from '../components/TopicContent';
import { AUDIT_TOPIC } from '../lib/audit';
import { PostList } from '../components/PostRow';
import { EmptyPosts, LoadError, Loading, TranslationNotice } from '../components/Status';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';
import { getTopicContent } from '../lib/topicContent';
import { NotFound } from './NotFound';

/** Erlaubt nach „/“ einen Zeilenumbruch, etwa in „Preis-/Leistungsverhältnis“, ohne den Text zu verändern. */
const breakAfterSlash = (text: string) =>
  text.split(/(?<=\/)/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]));

/**
 * Themenseite mit Titel, Einführung und zugeordneten veröffentlichten Beiträgen (Anforderung 3).
 * Das Thema `ai-audit` (KI Readiness) zeigt zusätzlich die Audit-Übersicht (Anforderung 8).
 */
export function TopicPage() {
  const { slug = '' } = useParams();
  const { lang, t } = useLang();
  const h1 = usePageFocus<HTMLHeadingElement>();
  const topic = useTopic(slug, lang);
  useHead(topic.data?.title, topic.data?.intro);

  if (topic.isPending) return <Loading />;
  if (isNotFound(topic.error)) return <NotFound />;
  if (topic.isError) return <LoadError onRetry={() => void topic.refetch()} />;

  const tp = topic.data;
  const fallback = tp.lang !== lang;
  const contentLang = fallback ? tp.lang : undefined;
  const content = getTopicContent(tp.slug, lang);

  return (
    <div className="container">
      <nav className="crumbs" aria-label={t('crumbs')}>
        <Link to={href(lang)}>{t('nav.home')}</Link>
        <span aria-hidden="true">/</span>
        <span>{t('nav.topics')}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{tp.title}</span>
      </nav>
      <section className="topic-hero">
        <div lang={contentLang}>
          <p className="eyebrow">{t(tp.slug === AUDIT_TOPIC ? 'audit.eyebrow' : 'topic.eyebrow')}</p>
          <h1 className="page-title" tabIndex={-1} ref={h1}>
            {breakAfterSlash(tp.title)}
          </h1>
          {tp.slug === AUDIT_TOPIC && <p className="topic-subtitle">{tp.summary}</p>}
          {content?.subtitle && <p className="topic-subtitle">{breakAfterSlash(content.subtitle)}</p>}
          <p className="lead">{tp.intro}</p>
          {fallback && <TranslationNotice text={t('fallbackTopic', { language: t(`langName.${tp.lang}`) })} />}
        </div>
        <Art topic={tp.slug} seed={1} />
      </section>
      {tp.slug === AUDIT_TOPIC && <AuditOverview />}
      {content && <TopicContent content={content} />}
      <section className="section" aria-labelledby="topicPosts">
        <div className="section-head">
          <h2 className="section-title" id="topicPosts">
            {t('topic.posts')}
          </h2>
          {tp.posts.length > 0 && <p className="count">{t('count', { count: tp.posts.length })}</p>}
        </div>
        {tp.posts.length > 0 ? <PostList posts={tp.posts} /> : <EmptyPosts text={t('empty.topicText')} />}
      </section>
    </div>
  );
}
