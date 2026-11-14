import { Link } from 'react-router';
import { Rich } from '../components/Rich';
import { home, type HomeTopic } from '../i18n/home';
import { auditPath } from '../lib/audit';
import { jumpTo } from '../lib/jump';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';

/** Sprungziel von „Themen entdecken“: die Überschrift über den drei Themenabschnitten. */
const TOPICS_ID = 'themen';

/**
 * Startseite nach content/Landingpage_v03.md und dem Mock mock/landing_v03/ (Ticket #101): zentrierter Hero mit
 * nummeriertem Themenindex, drei ausführliche Themenabschnitte, KI-Reifegrad-Banner und Profil-Teaser.
 * Seit Ticket #118 ohne Grafiken und deren Beschriftungen.
 * Sprunglinks nutzen jumpTo: Sie scrollen zur Überschrift und setzen dort den Fokus, ohne die URL zu ändern.
 */
export function Home() {
  const { lang } = useLang();
  const c = home[lang];
  const h1 = usePageFocus<HTMLHeadingElement>();
  useHead(c.title, c.description);

  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="container home-hero-inner">
          <p className="home-hook">{c.hook}</p>
          <h1 className="home-title" id="hero-title" tabIndex={-1} ref={h1}>
            {c.display1}
            <br />
            <span>{c.display2}</span>
          </h1>
          <p className="home-lead">
            {c.lead[0]}
            <br className="wide-break" /> {c.lead[1]}
          </p>
          <div className="hero-actions home-actions">
            <a className="btn btn-primary press" href={`#${TOPICS_ID}`} onClick={(e) => jumpTo(e, TOPICS_ID)}>
              {c.ctaTopics}
            </a>
            <Link className="text-link" to={href(lang, '/blog')}>
              {c.ctaNews}
            </Link>
            <Link className="text-link" to={auditPath(lang)}>
              {c.ctaAudit}
            </Link>
            <Link className="text-link" to={href(lang, '/profil')}>
              {c.ctaAbout}
            </Link>
          </div>
        </div>
        <nav className="container topic-index" aria-label={c.indexLabel}>
          {c.topics.map((tp, i) => (
            <a key={tp.slug} href={`#${tp.slug}`} onClick={(e) => jumpTo(e, tp.slug)}>
              <span className="index-number">{number(i)}</span>
              <span>
                {tp.title}
                <small>{tp.teaser}</small>
              </span>
            </a>
          ))}
        </nav>
      </section>

      <div className="container topics-intro">
        <div>
          <p className="eyebrow">{c.topicsEyebrow}</p>
          <h2 id={TOPICS_ID} tabIndex={-1}>
            {c.topicsTitle[0]}
            <br />
            {c.topicsTitle[1]}
          </h2>
        </div>
        <p>
          {c.topicsText[0]}
          <br /> {c.topicsText[1]}
        </p>
      </div>

      {c.topics.map((topic, index) => <TopicSection key={topic.slug} topic={topic} index={index} />)}

      <section className="container audit-banner" aria-labelledby="audit-title">
        <div>
          <p className="eyebrow">{c.auditEyebrow}</p>
          <h2 id="audit-title">
            {c.auditTitle[0]}
            <br />
            <span>{c.auditTitle[1]}</span>
          </h2>
          <p>{c.auditText}</p>
          <Link className="btn btn-primary press" to={auditPath(lang)}>
            {c.auditCta}
          </Link>
        </div>
        <div className="audit-steps">
          <ol aria-label={c.auditStepsLabel}>
            {c.auditSteps.map((step, i) => (
              <li key={step}>
                <span>{number(i)}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
          <p>
            {c.auditStepsText[0]}
            <br /> {c.auditStepsText[1]}
          </p>
        </div>
      </section>

      <section className="home-profile" aria-labelledby="profile-title">
        <div className="container home-profile-inner">
          <div>
            <p className="eyebrow">{c.profileEyebrow}</p>
            <h2 id="profile-title">{c.profileName}</h2>
            <p>
              {c.profileText[0]}
              <br /> {c.profileText[1]}
            </p>
            <Link className="text-link" to={href(lang, '/profil')}>
              {c.ctaAbout}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const number = (i: number) => String(i + 1).padStart(2, '0');

/**
 * Alle Absätze der Vorlage sind ohne Aufklappen in einer Lesespalte sichtbar.
 */
function TopicSection({ topic, index }: { topic: HomeTopic; index: number }) {
  const { lang } = useLang();
  const titleId = topic.slug;
  return (
    <section className={`editorial-section${index % 2 ? ' section-soft' : ''}`} aria-labelledby={titleId}>
      <div className="container editorial-inner">
        <div className="editorial-copy">
          <p className="eyebrow topic-eyebrow">
            <span className="topic-number">{number(index)}</span> {topic.title}
          </p>
          <h2 id={titleId} tabIndex={-1}>
            {topic.question}
          </h2>
          <div className="editorial-text">
            {topic.paragraphs.map((p, i) => (
              <p key={i}>
                <Rich text={p} />
              </p>
            ))}
          </div>
          <p className="article-link">
            <Link className="text-link" to={href(lang, `/themen/${topic.slug}`)}>
              {topic.articleLink}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
