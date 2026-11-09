import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from '../components/Icon';
import { Rich } from '../components/Rich';
import { AI_USES_PATH, home, type FocusTopic } from '../i18n/home';
import { auditPath } from '../lib/audit';
import { jumpTo } from '../lib/jump';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';

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
      <section className="container landing-hero" aria-labelledby="hero-title">
        <p className="hook">
          {c.hook}
        </p>
        <h1 className="display" id="hero-title" tabIndex={-1} ref={h1}>
          {c.display1}
          <br />
          <span>{c.display2}</span>
        </h1>
        <p className="lead">{c.lead}</p>
        <div className="hero-actions">
          <a className="btn btn-primary btn-lift press" href={`#${FOCUS_ID}`} onClick={(e) => jumpTo(e, FOCUS_ID)}>
            {c.ctaTopics} <Icon name="arrowDown" />
          </a>
          <Link className="btn btn-secondary press" to={auditPath(lang)}>
            {c.ctaAudit} <Icon name="arrowRight" />
          </Link>
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
        {c.topics.map((tp) => (
          <TopicCard key={tp.slug} topic={tp} />
        ))}
      </ul>
    </section>
  );
}

// Grafiken der Themenkarten. Unbekannte Themen erhalten den Verlauf der Softwareentwicklung ohne Linienbild.
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
  prozessautomatisierung: {
    bg: 'linear-gradient(135deg, #0284c7, #2563eb 55%, #34d399)',
    art: (
      <>
        <g fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2">
          <rect x="70" y="60" width="44" height="34" rx="8" />
          <rect x="186" y="96" width="44" height="34" rx="8" />
          <path d="M114 77h26a12 12 0 0 1 12 12v12a12 12 0 0 0 12 12h22" />
          <path d="m178 107 8 6-8 6" />
        </g>
        <circle cx="40" cy="30" r="60" fill="rgba(255,255,255,.12)" />
      </>
    ),
  },
  'ki-tipps-und-tricks': {
    bg: 'linear-gradient(135deg, #db2777, #a855f7 55%, #fbbf24)',
    art: (
      <>
        <g fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2">
          <path d="M150 50a30 30 0 0 0-18 54v14h36v-14a30 30 0 0 0-18-54Z" />
          <path d="M138 128h24M142 138h16" />
          <path d="M150 30v-8M110 50l-6-6M190 50l6-6M100 82h-8M200 82h8" />
        </g>
        <circle cx="255" cy="155" r="60" fill="rgba(255,255,255,.12)" />
      </>
    ),
  },
  'modelle-und-kosten': {
    bg: 'linear-gradient(135deg, #ca8a04, #65a30d 55%, #34d399)',
    art: (
      <>
        <g fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2">
          <path d="M150 40v100M110 60h80" />
          <path d="m110 60-20 40h40l-20-40ZM190 60l-20 30h40l-20-30Z" />
          <path d="M125 140h50" />
        </g>
        <circle cx="45" cy="35" r="60" fill="rgba(255,255,255,.12)" />
      </>
    ),
  },
};

/**
 * Themenkarte mit fett gesetztem Aufhänger. Nur der Textlink führt zur Themenseite; per CSS deckt er die
 * ganze Karte ab. So bleibt die Karte ohne verschachtelte interaktive Elemente und hat einen klaren Linktext.
 */
function TopicCard({ topic }: { topic: FocusTopic }) {
  const { lang } = useLang();
  const art = TOPIC_ART[topic.slug] ?? { bg: TOPIC_ART.softwareentwicklung.bg };
  return (
    <li className="topic">
      <div className="topic-art" style={{ background: art.bg }} aria-hidden="true">
        {art.art && (
          <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice">
            {art.art}
          </svg>
        )}
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
