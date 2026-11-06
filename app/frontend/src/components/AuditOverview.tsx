import { Link } from 'react-router';
import { useAudit } from '../api/client';
import { AUDIT_TOPIC, auditPath } from '../lib/audit';
import { useLang } from '../lib/lang';
import { topicColor } from '../lib/topicStyle';
import { Icon } from './Icon';
import { TranslationNotice } from './Status';

/**
 * Einstieg in das KI-Audit auf der Themenseite „AI Audit für Unternehmen“ (Anforderung 8):
 * Zweck des Audits, die drei Reifegrade und je Dimension ein Link zu ihrer Seite.
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
      <div className="audit-intro" lang={contentLang}>
        {o.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
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
