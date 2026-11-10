import type { ReactNode } from 'react';
import { Link } from 'react-router';
import portrait from '../assets/marvin-jakob.jpg';
import { Icon } from '../components/Icon';
import { Rich } from '../components/Rich';
import { home, type CodeArt, type CostsArt, type DataArt, type HomeTopic } from '../i18n/home';
import { auditPath } from '../lib/audit';
import { jumpTo } from '../lib/jump';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';

/** Sprungziel von „Themen entdecken“: die Überschrift über den drei Themenabschnitten. */
const TOPICS_ID = 'themen';

/**
 * Startseite nach content/Landingpage_v03.md und dem Mock mock/landing_v03/ (Ticket #101): zentrierter Hero mit
 * nummeriertem Themenindex, drei ausführliche Themenabschnitte mit Illustration, KI-Reifegrad-Banner und Profil-Teaser.
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
              {c.ctaTopics} <Icon name="arrowDown" />
            </a>
            <Link className="text-link" to={href(lang, '/blog')}>
              {c.ctaNews} <Icon name="arrowRight" />
            </Link>
            <Link className="text-link" to={auditPath(lang)}>
              {c.ctaAudit} <Icon name="arrowRight" />
            </Link>
            <Link className="text-link" to={href(lang, '/profil')}>
              {c.ctaAbout} <Icon name="arrowRight" />
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
              <Icon name="arrowRight" />
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

      <TopicSection topic={c.topics[0]} index={0} art={<DataIllustration art={c.topics[0].art} />} />
      <TopicSection topic={c.topics[1]} index={1} art={<CodeIllustration art={c.topics[1].art} />} />
      <TopicSection topic={c.topics[2]} index={2} art={<CostsIllustration art={c.topics[2].art} />} />

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
            {c.auditCta} <Icon name="arrowRight" />
          </Link>
        </div>
        <div className="audit-steps">
          <ol aria-label={c.auditStepsLabel}>
            {c.auditSteps.map((step, i) => (
              <li key={step}>
                <span>{number(i)}</span>
                <strong>{step}</strong>
                <i aria-hidden="true">
                  <b />
                  <b />
                  <b />
                </i>
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
          <img src={portrait} alt={c.profileAlt} width="160" height="160" loading="lazy" />
          <div>
            <p className="eyebrow">{c.profileEyebrow}</p>
            <h2 id="profile-title">{c.profileName}</h2>
            <p>
              {c.profileText[0]}
              <br /> {c.profileText[1]}
            </p>
            <Link className="text-link" to={href(lang, '/profil')}>
              {c.ctaAbout} <Icon name="arrowRight" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const number = (i: number) => String(i + 1).padStart(2, '0');

/**
 * Ausführlicher Themenabschnitt: alle Absätze der Vorlage sind ohne Aufklappen sichtbar. Auf breiten Bildschirmen
 * wechseln Illustration und Text die Seite (jeder zweite Abschnitt gespiegelt), auf schmalen stehen sie untereinander.
 */
function TopicSection<A>({ topic, index, art }: { topic: HomeTopic<A>; index: number; art: ReactNode }) {
  const { lang } = useLang();
  const titleId = topic.slug;
  return (
    <section className={`editorial-section${index % 2 ? ' section-soft' : ''}`} aria-labelledby={titleId}>
      <div className={`container editorial-grid${index % 2 ? ' reverse' : ''}`}>
        {art}
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
              {topic.articleLink} <Icon name="arrowRight" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Gemeinsamer Rahmen der Illustrationen: als Bild mit Beschreibung ausgezeichnet, Inhalte sind dekorativ. */
function Illustration({ className, label, kicker, index, children }: { className: string; label: string; kicker: string; index: number; children: ReactNode }) {
  return (
    <div className={`editorial-art ${className}`} role="img" aria-label={label}>
      <div className="art-kicker">
        {kicker} <span>{number(index)} / 03</span>
      </div>
      {children}
    </div>
  );
}

function DataIllustration({ art }: { art: DataArt }) {
  const icons = ['mail', 'ticket', 'file'] as const;
  return (
    <Illustration className="data-art" label={art.label} kicker={art.kicker} index={0}>
      <div className="source-nodes">
        {art.sources.map((source, i) => (
          <span key={source}>
            <Icon name={icons[i]} />
            {source}
          </span>
        ))}
      </div>
      <div className="connector">
        <i />
        <i />
        <i />
      </div>
      <div className="context-node">
        <span className="context-symbol">+</span>
        <div>
          <small>{art.contextLabel}</small>
          <strong>
            {art.context[0]}
            <br />
            {art.context[1]}
          </strong>
        </div>
      </div>
      <div className="connector single">
        <i />
      </div>
      <div className="analysis-node">
        <Icon name="chart" />
        {art.analysis} <span>↗</span>
      </div>
      <div className="art-foot">{art.foot}</div>
    </Illustration>
  );
}

function CodeIllustration({ art }: { art: CodeArt }) {
  return (
    <Illustration className="code-art" label={art.label} kicker={art.kicker} index={1}>
      <div className="agent-top">
        <span className="code-brackets">&lt;/&gt;</span>
        <span>
          {art.title[0]}
          <br />
          <strong>{art.title[1]}</strong>
        </span>
      </div>
      <div className="agent-workflow">
        <span>{art.workflow[0]}</span>
        <i>→</i>
        <strong>{art.workflow[1]}</strong>
        <i>→</i>
        <span>{art.workflow[2]}</span>
      </div>
      <div className="guardrails">
        {[
          ['+', art.skills],
          ['⌗', art.guardrails],
        ].map(([symbol, [title, text]]) => (
          <div key={title}>
            <span>{symbol}</span>
            <strong>{title}</strong>
            <small>{text}</small>
          </div>
        ))}
      </div>
      <div className="human-review">
        <Icon name="check" />
        {art.responsibility}
      </div>
    </Illustration>
  );
}

function CostsIllustration({ art }: { art: CostsArt }) {
  return (
    <Illustration className="costs-art" label={art.label} kicker={art.kicker} index={2}>
      <div className="cost-title">
        {art.title[0]}
        <br />
        <span>{art.title[1]}</span>
      </div>
      <div className="cost-equation">
        {art.items.map((item, i) => (
          <div key={item}>
            <span>{i ? '+' : '01'}</span>
            <strong>{item}</strong>
          </div>
        ))}
        <div className="cost-total">
          <span>=</span>
          <strong>
            {art.total[0]}
            <br />
            {art.total[1]}
          </strong>
          <Icon name="arrowUpRight" />
        </div>
      </div>
    </Illustration>
  );
}
