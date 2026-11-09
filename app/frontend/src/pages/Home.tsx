import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';
import { usePosts, useTopics, type PostSummary, type Topic } from '../api/client';
import portrait from '../assets/marvin-jakob.jpg';
import { AiTasks } from '../components/AiTasks';
import { Art } from '../components/Art';
import { AuditTeaser } from '../components/AuditTeaser';
import { FactsBar } from '../components/FactsBar';
import { Footnote, sourceId } from '../components/Footnote';
import { Icon } from '../components/Icon';
import { TopicLens } from '../components/TopicLens';
import { home } from '../i18n/home';
import { jumpTo } from '../lib/jump';
import { href, useLang } from '../lib/lang';
import { formatDate, useHead, usePageFocus } from '../lib/page';
import { seedOf, topicColor } from '../lib/topicStyle';

const BLOG_POSTS = 3;

/**
 * Startseite nach dem Landing-Page-Entwurf mock/landing/index.html (Ticket #73):
 * Hero, Kennzahlen, Was ist KI?, Themen, KI-Audit, Neu im Blog, Profil und Quellen.
 */
export function Home() {
  const { lang, t } = useLang();
  const c = home[lang];
  const h1 = usePageFocus<HTMLHeadingElement>();
  const topics = useTopics(lang);
  const [hot, setHot] = useState<string | null>(null);
  useHead(t('siteName'), c.description);

  return (
    <div className="landing">
      <section className="container landing-hero" aria-labelledby="hero-title">
        <div>
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 className="display" id="hero-title" tabIndex={-1} ref={h1}>
            {c.display1}
            <br />
            <span>{c.display2}</span>
          </h1>
          <p className="lead">{c.lead}</p>
          <div className="hero-actions">
            <a className="btn btn-primary btn-lift press" href="#audit-title" onClick={(e) => jumpTo(e, 'audit-title')}>
              {c.ctaAudit} <Icon name="arrowRight" />
            </a>
            <a className="text-link" href="#ki-title" onClick={(e) => jumpTo(e, 'ki-title')}>
              {c.ctaWhat} <Icon name="arrowDown" />
            </a>
          </div>
        </div>
        <TopicLens topics={topics.data} hot={hot} onHot={setHot} />
      </section>

      <FactsBar />
      <WhatIsAi />
      <Topics topics={topics} hot={hot} onHot={setHot} />
      <AuditTeaser />
      <NewPosts />
      <Person />
      <Sources />
    </div>
  );
}

function WhatIsAi() {
  const { lang } = useLang();
  const c = home[lang];
  return (
    <section className="container section" aria-labelledby="ki-title">
      <div className="what">
        <div className="definition">
          <p className="eyebrow">{c.whatEyebrow}</p>
          <h2 id="ki-title" tabIndex={-1}>
            {c.whatTitle}
          </h2>
          <p className="muted">
            {c.whatText}
            <Footnote n={2} />
          </p>
          <blockquote>
            <p>{c.definition}</p>
            <footer>
              {c.definitionSource}
              <Footnote n={1} />
            </footer>
          </blockquote>
        </div>
        <AiTasks />
      </div>

      <ul className="limits" aria-label={c.limitsLabel}>
        {c.limits.map((l, i) => (
          <li className="limit" key={l.title}>
            <h3>
              <Icon name={(['alert', 'clock', 'target'] as const)[i]} />
              {l.title}
            </h3>
            <p>
              {l.text}
              {l.sources.map((n) => (
                <Footnote key={n} n={n} />
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Grafiken der Themenkarten aus dem Entwurf. Unbekannte Themen erhalten den Verlauf ohne Linienbild.
const TOPIC_ART: Record<string, { bg: string; art?: ReactNode }> = {
  softwareentwicklung: {
    bg: 'linear-gradient(135deg, #6366f1, #8b5cf6 50%, #22d3ee)',
    art: (
      <>
        <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2">
          <path d="M110 70 80 90l30 20M190 70l30 20-30 20M165 60l-30 60" />
        </g>
        <circle cx="250" cy="30" r="60" fill="rgba(255,255,255,.12)" />
      </>
    ),
  },
  'ai-audit': {
    bg: 'linear-gradient(135deg, #0d9488, #22c55e 55%, #38bdf8)',
    art: (
      <>
        <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2">
          <rect x="105" y="45" width="90" height="100" rx="12" />
          <path d="M125 80h50M125 100h50M125 120h30" />
          <path d="m170 120 8 8 16-18" />
        </g>
        <circle cx="40" cy="160" r="70" fill="rgba(255,255,255,.12)" />
      </>
    ),
  },
  'data-analytics': {
    bg: 'linear-gradient(135deg, #ea580c, #ec4899 55%, #facc15)',
    art: (
      <>
        <g fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2">
          <path d="M90 130V95M125 130V70M160 130V85M195 130V55" />
          <path d="M85 135h120" />
          <path d="m90 80 35-25 35 15 35-30" strokeDasharray="4 6" />
        </g>
        <circle cx="260" cy="150" r="60" fill="rgba(255,255,255,.12)" />
      </>
    ),
  },
};

function Topics({
  topics,
  hot,
  onHot,
}: {
  topics: ReturnType<typeof useTopics>;
  hot: string | null;
  onHot: (slug: string | null) => void;
}) {
  const { lang, t } = useLang();
  const c = home[lang];
  return (
    <section className="container section" aria-labelledby="themen-title">
      <div className="landing-head">
        <div>
          <p className="eyebrow">{c.topicsEyebrow}</p>
          <h2 id="themen-title">{c.topicsTitle}</h2>
        </div>
        <p className="muted">{c.topicsText}</p>
      </div>
      {topics.isPending ? (
        <p className="loading" role="status">
          {t('loading')}
        </p>
      ) : topics.isError ? (
        <SectionError onRetry={() => void topics.refetch()} />
      ) : (
        <div className="topics">
          {topics.data.map((tp) => (
            <TopicCard key={tp.slug} topic={tp} hot={hot === tp.slug} onHot={onHot} />
          ))}
        </div>
      )}
    </section>
  );
}

function TopicCard({ topic, hot, onHot }: { topic: Topic; hot: boolean; onHot: (slug: string | null) => void }) {
  const { lang, t } = useLang();
  const art = TOPIC_ART[topic.slug] ?? { bg: TOPIC_ART.softwareentwicklung.bg };
  const contentLang = topic.lang !== lang ? topic.lang : undefined;
  return (
    <Link
      className={`topic${hot ? ' is-hot' : ''}`}
      to={href(lang, `/themen/${topic.slug}`)}
      onPointerEnter={() => onHot(topic.slug)}
      onPointerLeave={() => onHot(null)}
      onFocus={() => onHot(topic.slug)}
      onBlur={() => onHot(null)}
    >
      <div className="topic-art" style={{ background: art.bg }} aria-hidden="true">
        {art.art && (
          <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice">
            {art.art}
          </svg>
        )}
      </div>
      <div className="topic-body">
        <span className="label">
          <span className="dot" style={{ '--c': topicColor(topic.slug) } as CSSProperties} aria-hidden="true" />
          <span lang={contentLang}>{topic.label}</span>
        </span>
        <h3 lang={contentLang}>{topic.title}</h3>
        <p lang={contentLang}>{topic.summary}</p>
        <span className="text-link">
          {t('toTopic')} <Icon name="arrowRight" />
        </span>
      </div>
    </Link>
  );
}

function NewPosts() {
  const { lang, t } = useLang();
  const c = home[lang];
  const posts = usePosts(lang);
  const latest = (posts.data ?? []).slice(0, BLOG_POSTS);
  // Ohne veröffentlichte Beiträge entfällt der Abschnitt.
  if (posts.isSuccess && latest.length === 0) return null;
  return (
    <section className="container section" aria-labelledby="blog-title">
      <div className="landing-head">
        <div>
          <p className="eyebrow">{c.blogEyebrow}</p>
          <h2 id="blog-title">{c.blogTitle}</h2>
        </div>
        <Link className="text-link" to={href(lang, '/blog')}>
          {t('allPosts')} <Icon name="arrowRight" />
        </Link>
      </div>
      {posts.isPending ? (
        <p className="loading" role="status">
          {t('loading')}
        </p>
      ) : posts.isError ? (
        <SectionError onRetry={() => void posts.refetch()} />
      ) : (
        <ul className="posts">
          {latest.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </ul>
      )}
    </section>
  );
}

function PostCard({ post }: { post: PostSummary }) {
  const { lang, t } = useLang();
  const contentLang = post.lang !== lang ? post.lang : undefined;
  return (
    <li>
      <Link className="post" to={href(lang, `/blog/${post.slug}`)}>
        <Art className="post-art" topic={post.topics[0]?.slug} seed={seedOf(post.slug)} image={post.cover} sizes="(max-width: 760px) 100vw, 360px" />
        <div className="post-body">
          <p className="meta">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
            {post.topics.map((tp) => (
              <span className="tag" key={tp.slug}>
                <span className="dot" style={{ '--c': topicColor(tp.slug) } as CSSProperties} aria-hidden="true" />
                {tp.label}
              </span>
            ))}
            {contentLang && <span className="tag tag--lang">{t('onlyIn', { language: t(`langName.${post.lang}`) })}</span>}
          </p>
          <h3 lang={contentLang}>{post.title}</h3>
          <p lang={contentLang}>{post.summary}</p>
        </div>
      </Link>
    </li>
  );
}

function Person() {
  const { lang } = useLang();
  const c = home[lang];
  return (
    <section className="container section" aria-labelledby="person-title">
      <div className="person">
        <img src={portrait} alt={c.portraitAlt} width={220} height={220} loading="lazy" decoding="async" />
        <div>
          <h2 className="eyebrow" id="person-title">
            {c.personEyebrow}
          </h2>
          <blockquote>{c.personQuote}</blockquote>
          <p>{c.personText}</p>
          <Link className="text-link" to={href(lang, '/profil')}>
            {c.personLink} <Icon name="arrowRight" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Sources() {
  const { lang } = useLang();
  const c = home[lang];
  return (
    <section className="container sources" aria-labelledby="quellen-title">
      <h2 id="quellen-title">{c.sourcesTitle}</h2>
      <ol>
        {c.sources.map((s, i) => (
          <li key={s.url} id={sourceId(i + 1)} tabIndex={-1}>
            {s.label}: <a href={s.url}>{s.title}</a>
            {s.note && ` – ${s.note}`}
          </li>
        ))}
      </ol>
    </section>
  );
}

function SectionError({ onRetry }: { onRetry: () => void }) {
  const { t } = useLang();
  return (
    <div className="empty" role="alert">
      <p>{t('error.title')}</p>
      <button className="btn btn-secondary press" type="button" onClick={onRetry}>
        {t('error.retry')}
      </button>
    </div>
  );
}
