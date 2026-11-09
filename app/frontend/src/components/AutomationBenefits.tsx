import { automation } from '../i18n/automation';
import { useLang } from '../lib/lang';
import { Footnote, sourceId } from './Footnote';
import { Icon, type IconName } from './Icon';

const ICONS: IconName[] = ['flow', 'plug', 'server', 'code', 'spark', 'users'];

/**
 * Vorteile von n8n auf der Themenseite „Prozessautomatisierung“ (Ticket #77):
 * je Vorteil Überschrift und kurze Erklärung, dazu nummerierte Quellen.
 */
export function AutomationBenefits() {
  const { lang } = useLang();
  const c = automation[lang];
  return (
    <section className="section" aria-labelledby="n8nTitle">
      <p className="eyebrow">{c.eyebrow}</p>
      <h2 className="section-title" id="n8nTitle">
        {c.title}
      </h2>
      <p className="section-sub">{c.sub}</p>
      <ul className="advantage-list">
        {c.benefits.map((b, i) => (
          <li key={b.title} className="advantage-item">
            <span className="advantage-icon" aria-hidden="true">
              <Icon name={ICONS[i] ?? 'check'} />
            </span>
            <h3>{b.title}</h3>
            <p>
              {b.text}
              {b.sources.map((n) => (
                <Footnote key={n} n={n} />
              ))}
            </p>
          </li>
        ))}
      </ul>
      <p className="advantage-note">{c.note}</p>
      <div className="topic-sources">
        <h3 id="n8nSources">{c.sourcesTitle}</h3>
        <ol aria-labelledby="n8nSources">
          {c.sources.map((s, i) => (
            <li key={s.url} id={sourceId(i + 1)} tabIndex={-1}>
              <a href={s.url}>{s.title}</a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
