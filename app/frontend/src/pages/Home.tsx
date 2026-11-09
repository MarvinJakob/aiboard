import { Link } from 'react-router';
import { Icon } from '../components/Icon';
import { Rich } from '../components/Rich';
import { AI_USES_PATH, home, type FocusTopic } from '../i18n/home';
import { auditPath } from '../lib/audit';
import { jumpTo } from '../lib/jump';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';
import { topicStyle } from '../lib/topicStyle';

/** Ziel des Buttons „Themen entdecken“. */
const FOCUS_ID = 'fokus-title';

/**
 * Startseite nach der Textvorlage content/Landingpage.md (Ticket #78): Hook, Aktuell im Fokus und Grundlagen.
 * Ohne Quellenverweise (Ticket #91); die Belege stehen als Kommentar in i18n/home.ts. Die Themenkarten sind statisch,
 * weil jede Karte einen eigenen Aufhänger und Linktext aus der Vorlage hat, den die Themen-API nicht kennt.
 */
export function Home() {
  const { lang, t } = useLang();
  const c = home[lang];
  const h1 = usePageFocus<HTMLHeadingElement>();
  useHead(t('siteName'), c.description);

  return (
    <div className="landing">
      <section className="hero-band" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero-copy">
            <p className="hook">{c.hook}</p>
            <h1 className="display" id="hero-title" tabIndex={-1} ref={h1}>
              {c.display1}
              <br />
              <span>{c.display2}</span>
            </h1>
            <p className="lead">{c.lead}</p>
            <div className="hero-actions">
              <a className="btn btn-primary press" href={`#${FOCUS_ID}`} onClick={(e) => jumpTo(e, FOCUS_ID)}>
                {c.ctaTopics} <Icon name="arrowDown" />
              </a>
              <Link className="btn btn-secondary press" to={auditPath(lang)}>
                {c.ctaAudit} <Icon name="arrowRight" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Focus />
      <Basics />
    </div>
  );
}

function Focus() {
  const { lang } = useLang();
  const c = home[lang];
  return (
    <section className="container section" aria-labelledby={FOCUS_ID}>
      <div className="landing-head">
        <div>
          <p className="eyebrow">{c.focusEyebrow}</p>
          <h2 id={FOCUS_ID} tabIndex={-1}>
            {c.focusTitle}
          </h2>
        </div>
        <p className="muted">{c.focusText}</p>
      </div>
      <ul className="topics">
        {c.topics.map((tp, i) => (
          <TopicCard key={tp.slug} topic={tp} index={i} />
        ))}
      </ul>
    </section>
  );
}

/**
 * Themenkarte mit fett gesetztem Aufhänger. Nur der Textlink führt zur Themenseite; per CSS deckt er die
 * ganze Karte ab. So bleibt die Karte ohne verschachtelte interaktive Elemente und hat einen klaren Linktext.
 * Nummer und Symbol oben folgen den Themenkarten aus mock/design_cimt.
 */
function TopicCard({ topic, index }: { topic: FocusTopic; index: number }) {
  const { lang } = useLang();
  return (
    <li className="topic">
      <div className="topic-top" aria-hidden="true">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <Icon name={topicStyle(topic.slug).icon} />
      </div>
      <div className="topic-body">
        <h3>{topic.title}</h3>
        <p className="topic-hook">
          <strong>{topic.hook}</strong>
        </p>
        <p>
          <Rich text={topic.text} />
        </p>
        <Link className="text-link topic-link" to={href(lang, `/themen/${topic.slug}`)}>
          {topic.link} <Icon name="arrowRight" />
        </Link>
      </div>
    </li>
  );
}

function Basics() {
  const { lang } = useLang();
  const c = home[lang];
  return (
    <section className="container section" aria-labelledby="ki-title">
      <div className="basics">
        <div>
          <p className="eyebrow">{c.basicsEyebrow}</p>
          <h2 id="ki-title">{c.basicsTitle}</h2>
          <p className="lead">{c.basicsText}</p>
        </div>
        <div className="check">
          <h3>{c.checkTitle}</h3>
          {c.checkText.map((p, i) => (
            <p className="muted" key={i}>
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="limits-intro">
        <h3>{c.limitsTitle}</h3>
        <p className="muted">{c.limitsText}</p>
      </div>
      <ul className="limits">
        {c.limits.map((l, i) => (
          <li className="limit" key={l.title}>
            <p>
              <strong>
                <Icon name={(['alert', 'clock', 'target'] as const)[i]} />
                {l.title}
              </strong>{' '}
              {l.text}
            </p>
          </li>
        ))}
      </ul>

      <p className="more">
        {c.moreText}{' '}
        <Link className="text-link" to={href(lang, AI_USES_PATH)}>
          {c.moreLink} <Icon name="arrowRight" />
        </Link>
      </p>
    </section>
  );
}
