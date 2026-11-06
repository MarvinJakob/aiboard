import { Link, useParams } from 'react-router';
import { isNotFound, useAuditDimension, useTopics } from '../api/client';
import { Art } from '../components/Art';
import { AuditQuiz } from '../components/AuditQuiz';
import { Icon } from '../components/Icon';
import { LoadError, Loading, TranslationNotice } from '../components/Status';
import { AUDIT_TOPIC, auditPath } from '../lib/audit';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';
import { seedOf } from '../lib/topicStyle';
import { NotFound } from './NotFound';

/**
 * Seite einer Audit-Dimension (Anforderung 9): Was die Dimension untersucht, ihr Nutzen und die
 * drei Reifegrade. Darunter folgt die Selbsteinschätzung (Anforderung 10).
 */
export function AuditDimensionPage() {
  const { dimension: slug = '' } = useParams();
  const { lang, t } = useLang();
  const h1 = usePageFocus<HTMLHeadingElement>();
  const dimension = useAuditDimension(slug, lang);
  const { data: topics } = useTopics(lang);
  useHead(dimension.data?.title, dimension.data?.summary);

  if (dimension.isPending) return <Loading />;
  if (isNotFound(dimension.error)) return <NotFound />;
  if (dimension.isError) return <LoadError onRetry={() => void dimension.refetch()} />;

  const d = dimension.data;
  const contentLang = d.lang !== lang ? d.lang : undefined;
  const topicTitle = topics?.find((tp) => tp.slug === AUDIT_TOPIC)?.title ?? t('audit.eyebrow');

  return (
    <div className="container">
      <nav className="crumbs" aria-label={t('crumbs')}>
        <Link to={href(lang)}>{t('nav.home')}</Link>
        <span aria-hidden="true">/</span>
        <span>{t('nav.topics')}</span>
        <span aria-hidden="true">/</span>
        <Link to={auditPath(lang)}>{topicTitle}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" lang={contentLang}>
          {d.title}
        </span>
      </nav>

      <section className="topic-hero">
        <div>
          <p className="eyebrow">{t('audit.dimensionEyebrow', { category: t(`audit.category.${d.category}`) })}</p>
          <h1 className="page-title" tabIndex={-1} ref={h1} lang={contentLang}>
            {d.title}
          </h1>
          <p className="lead" lang={contentLang}>
            {d.summary}
          </p>
          {contentLang && <TranslationNotice text={t('audit.fallback', { language: t(`langName.${d.lang}`) })} />}
        </div>
        <Art topic={AUDIT_TOPIC} seed={seedOf(d.slug)} />
      </section>

      <div className="dim-about">
        <div className="prose dim-intro" lang={contentLang}>
          {d.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <section className="benefits" aria-labelledby="benefitsTitle">
          <h2 id="benefitsTitle">{t('audit.benefitsTitle')}</h2>
          <ul className="benefit-list" lang={contentLang}>
            {d.benefits.map((b) => (
              <li key={b}>
                <Icon name="check" strokeWidth={2.2} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="section" aria-labelledby="levelsTitle">
        <div className="section-head">
          <div>
            <h2 className="section-title" id="levelsTitle">
              {t('audit.levelsTitle')}
            </h2>
            <p className="section-sub">{t('audit.levelsIntro')}</p>
          </div>
        </div>
        <ol className="level-cards">
          {d.levels.map((l) => (
            <li key={l.level} className="level-card">
              <p className="eyebrow">{t('audit.levelNo', { n: l.level })}</p>
              <h3 lang={contentLang}>{l.name}</h3>
              <p lang={contentLang}>{l.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* key: Antworten einer Dimension wirken nur auf ihr eigenes Ergebnis */}
      <AuditQuiz key={d.slug} dimension={d} contentLang={contentLang} />

      <p className="actions">
        <Link className="back-link" to={`${auditPath(lang)}#audit`}>
          <Icon name="chevLeft" /> {t('audit.toOverview')}
        </Link>
      </p>
    </div>
  );
}
