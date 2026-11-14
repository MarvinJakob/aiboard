import { useState } from 'react';
import { Link } from 'react-router';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAudit, type AuditDimensionSummary } from '../api/client';
import { AUDIT_TOPIC, auditPath } from '../lib/audit';
import { useLang, type Lang } from '../lib/lang';
import { topicColor } from '../lib/topicStyle';
import { Icon } from './Icon';
import { ContentTable } from './ContentTable';
import { TranslationNotice } from './Status';

/**
 * KI-Readiness-Übersicht: Einleitung und Anleitung aus dem Katalog (#111), aufklappbare
 * Dimensionsliste (#112) und Einstieg in die Selbsteinschätzung bei der ersten Dimension.
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
  const first = o.dimensions[0];
  const start = first && <StartLink to={auditPath(lang, first.slug)} />;

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
      <p className="actions">{start}</p>

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

      <h3 className="subhead" id="dimensionsTitle">
        {t('audit.dimensionsTitle')}
      </h3>
      <p className="section-sub subhead-sub">{t('audit.dimensionsSub', { count: o.dimensions.length })}</p>
      <DimensionAccordion dimensions={o.dimensions} lang={lang} />
      <p className="actions">{start}</p>
    </section>
  );
}

function StartLink({ to }: { to: string }) {
  const { t } = useLang();
  return (
    <Link className="btn btn-primary press" to={to}>
      {t('audit.start')} <Icon name="arrowRight" />
    </Link>
  );
}

/**
 * Dimensionen in fester Reihenfolge, jede mit aufklappbarer Erklärung (Ticket #112, Accordion-Muster
 * der WAI-ARIA Authoring Practices: Button in Überschrift, aria-expanded und aria-controls).
 * Mehrere Erklärungen dürfen gleichzeitig offen sein. Aufklappen liest nur; es bewertet nichts.
 */
function DimensionAccordion({ dimensions, lang }: { dimensions: AuditDimensionSummary[]; lang: Lang }) {
  const { t } = useLang();
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const toggle = (slug: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });

  return (
    <ol className="dim-accordion" aria-labelledby="dimensionsTitle">
      {dimensions.map((d, i) => {
        const expanded = open.has(d.slug);
        const ids = { button: `dimension-${d.slug}`, panel: `dimension-${d.slug}-erklaerung` };
        const contentLang = d.lang !== lang ? d.lang : undefined;
        return (
          <li key={d.slug} className="dim-acc-item" data-open={expanded || undefined}>
            <h4 className="dim-acc-heading">
              <button
                type="button"
                className="dim-acc-toggle"
                id={ids.button}
                aria-expanded={expanded}
                aria-controls={ids.panel}
                onClick={() => toggle(d.slug)}
              >
                <span className="dim-acc-no" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="dim-acc-text" lang={contentLang}>
                  <span className="dim-acc-title">{d.title}</span>{' '}
                  <span className="dim-acc-summary">{d.summary}</span>
                </span>
                <span className="dim-acc-icon" aria-hidden="true">
                  <Icon name="chevDown" />
                </span>
              </button>
            </h4>
            <div className="dim-acc-panel" id={ids.panel} hidden={!expanded}>
              <span className="chip" style={{ '--c': topicColor(AUDIT_TOPIC) } as React.CSSProperties}>
                <i aria-hidden="true" />
                {t(`audit.category.${d.category}`)}
              </span>
              <div className="dim-acc-copy" lang={contentLang}>
                {d.intro.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <Link className="text-link" to={auditPath(lang, d.slug)}>
                {t('audit.toDimension', { title: d.title })} <Icon name="arrowRight" />
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
