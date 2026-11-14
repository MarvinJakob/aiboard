import { Link } from 'react-router';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAudit } from '../api/client';
import { AUDIT_TOPIC, auditPath } from '../lib/audit';
import { useLang } from '../lib/lang';
import { topicColor } from '../lib/topicStyle';
import { Icon } from './Icon';
import { ContentTable } from './ContentTable';
import { TranslationNotice } from './Status';

/**
 * KI-Readiness-Inhalte aus dem Katalog, einschließlich dessen Sprach-Fallback.
 * Der geführte Ablauf und die Gesamtauswertung folgen in #113/#114.
 */
export function AuditOverview() {
  const { lang, t } = useLang();
  const audit = useAudit(lang);

  if (audit.isPending) {
    return (
      <section className="section">
        <p className="loading" role="status">
          {t('loading')}
        </p>
      </section>
    );
  }
  if (audit.isError) {
    return (
      <section className="section">
        <div className="empty" role="alert">
          <p>{t('error.title')}</p>
          <button className="btn btn-secondary press" type="button" onClick={() => void audit.refetch()}>
            {t('error.retry')}
          </button>
        </div>
      </section>
    );
  }

  const o = audit.data;
  const contentLang = o.lang !== lang ? o.lang : undefined;

  return (
    <section className="section" aria-labelledby="auditTitle" id="audit">
      <p className="eyebrow">{t('audit.eyebrow')}</p>
      <h2 className="section-title" id="auditTitle">
        {t('audit.title')}
      </h2>
      {contentLang && <TranslationNotice text={t('audit.fallback', { language: t(`langName.${o.lang}`) })} />}
      <div className="audit-copy prose" lang={contentLang}>
        <Markdown skipHtml>{o.intro.join('\n\n')}</Markdown>
      </div>

      <h3 className="subhead">{t('audit.levelsTitle')}</h3>
      <ol className="level-list">
        {o.levels.map((l) => (
          <li key={l.level} className="level-item">
            <span className="level-badge" aria-hidden="true">
              {l.level}
            </span>
            <strong lang={contentLang}>{l.name}</strong>
            <span lang={contentLang}>{l.motto}</span>
          </li>
        ))}
      </ol>

      <div className="audit-copy prose" lang={contentLang}>
        <Markdown skipHtml remarkPlugins={[remarkGfm]} components={{ table: ContentTable }}>{o.guidance}</Markdown>
      </div>

      <h3 className="subhead">{t('audit.dimensionsTitle')}</h3>
      <p className="section-sub subhead-sub">{t('audit.dimensionsSub')}</p>
      <ul className="dimension-list">
        {o.dimensions.map((d) => (
          <li key={d.slug}>
            <Link className="dimension-card" to={auditPath(lang, d.slug)}>
              <span className="chip" style={{ '--c': topicColor(AUDIT_TOPIC) } as React.CSSProperties}>
                <i aria-hidden="true" />
                {t(`audit.category.${d.category}`)}
              </span>
              <h4 lang={d.lang !== lang ? d.lang : undefined}>{d.title}</h4>
              <p lang={d.lang !== lang ? d.lang : undefined}>{d.summary}</p>
              <span className="card-link">
                {t('audit.toDimension')} <Icon name="arrowRight" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
