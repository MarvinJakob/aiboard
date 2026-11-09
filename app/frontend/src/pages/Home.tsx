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
        <div className="container hero-grid">
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
          <HeroVisual />
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
 * Dekorative Hero-Grafik nach mock/design_cimt: vier Stationen um einen orangefarbenen KI-Kern.
 * Sie ist sprachneutral und ohne Text gezeichnet, weil sie in beiden Sprachen erscheint; Screenreader überspringen sie.
 */
function HeroVisual() {
  const stations = [
    { x: 108, y: 106, icon: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18' },
    { x: 376, y: 106, icon: 'M4 3v17h17M8 15v-4m5 4V7m5 8v-6' },
    { x: 108, y: 298, icon: 'M2 9h6v6H2zM16 2h6v6h-6zM16 16h6v6h-6zM8 12h4m4-7h-4v14h4' },
    { x: 376, y: 298, icon: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V15h7v-1.1A6 6 0 0 0 12 3Z' },
  ];
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg viewBox="0 0 560 480">
        <defs>
          <pattern id="hero-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#fff" opacity=".14" />
          </pattern>
          <radialGradient id="hero-glow">
            <stop stopColor="#dc6e14" stopOpacity=".18" />
            <stop offset="1" stopColor="#dc6e14" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-core" x2="1" y2="1">
            <stop stopColor="#ef8e3f" />
            <stop offset="1" stopColor="#dc6e14" />
          </linearGradient>
        </defs>
        <rect width="560" height="480" fill="url(#hero-dots)" />
        <circle cx="280" cy="240" r="224" fill="url(#hero-glow)" />
        <g fill="none" stroke="#90a5b8">
          <circle cx="280" cy="240" r="171" opacity=".22" />
          <circle cx="280" cy="240" r="123" opacity=".3" strokeDasharray="3 8" />
          <path d="M280 69v342M109 240h342" opacity=".15" />
          <path d="M280 69a171 171 0 0 1 171 171M109 240a171 171 0 0 0 171 171" stroke="#dc6e14" strokeWidth="2" />
          <path d="m184 182 53 24m86 68 53 24m-192 0 53-24m86-68 53-24" stroke="#dc6e14" opacity=".7" />
        </g>
        <g fill="#dc6e14">
          <circle cx="280" cy="69" r="4" />
          <circle cx="451" cy="240" r="4" />
          <circle cx="280" cy="411" r="4" />
          <circle cx="109" cy="240" r="4" />
        </g>
        {stations.map((s) => (
          <g key={s.x + s.y * 1000}>
            <rect x={s.x} y={s.y} width="76" height="76" rx="18" fill="#172f44" stroke="#3b5062" />
            <path
              d={s.icon}
              transform={`translate(${s.x + 20} ${s.y + 20}) scale(1.5)`}
              fill="none"
              stroke="#f5a66b"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
        <circle cx="280" cy="240" r="72" fill="#dc6e14" opacity=".09" />
        <circle cx="280" cy="240" r="59" fill="url(#hero-core)" />
        <circle cx="280" cy="240" r="49" fill="none" stroke="#ffb57b" opacity=".65" />
        <path d="m280 214 6.5 15.5L302 236l-15.5 6.5L280 258l-6.5-15.5L258 236l15.5-6.5Z" fill="#12263a" />
      </svg>
    </div>
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
