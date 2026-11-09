import { Link } from 'react-router';
import { AiTasks } from '../components/AiTasks';
import { FactsBar } from '../components/FactsBar';
import { Footnote } from '../components/Footnote';
import { Icon } from '../components/Icon';
import { SourceList } from '../components/SourceList';
import { aiUses } from '../i18n/aiUses';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';

/**
 * Ausführliche Einordnung zu KI-Einsatzfeldern unter /{lang}/ki-einsatzfelder (Ticket #78).
 * Ziel des Links „Zur ausführlichen Einordnung“ auf der Startseite. Kennzahlen und die sieben Aufgaben
 * standen bis dahin auf der Startseite (Ticket #73) und nutzen weiter deren Gestaltung (.landing).
 */
export function AiUses() {
  const { lang } = useLang();
  const c = aiUses[lang];
  const h1 = usePageFocus<HTMLHeadingElement>();
  useHead(c.title, c.description);

  return (
    <div className="landing">
      <section className="container landing-hero" aria-labelledby="ai-uses-title">
        <Link className="back-link" to={href(lang)}>
          <Icon name="chevLeft" /> {c.backLink}
        </Link>
        <p className="eyebrow">{c.eyebrow}</p>
        <h1 className="page-title" id="ai-uses-title" tabIndex={-1} ref={h1}>
          {c.title}
        </h1>
        <p className="lead">{c.lead}</p>
      </section>

      <FactsBar />

      <section className="container section" aria-labelledby="tasks-title">
        <div className="what">
          <div className="definition">
            <p className="eyebrow">{c.tasksEyebrow}</p>
            <h2 id="tasks-title">{c.tasksTitle}</h2>
            <p className="muted">
              {c.tasksText}
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
      </section>

      <SourceList title={c.sourcesTitle} sources={c.sources} />
    </div>
  );
}
