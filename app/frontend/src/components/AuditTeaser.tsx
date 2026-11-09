import { useState } from 'react';
import { Link } from 'react-router';
import { useAudit, useAuditDimension, type AuditCategory, type AuditDimensionSummary } from '../api/client';
import { fill, home } from '../i18n/home';
import { auditPath } from '../lib/audit';
import { useLang } from '../lib/lang';
import { Icon } from './Icon';

const CATEGORIES: AuditCategory[] = ['organizational', 'business', 'technical'];

/** Erster Satz einer Reifegradbeschreibung, wie im Entwurf. */
export const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? text;

/**
 * KI-Audit auf der Startseite (mock/landing): Dimension wählen und sehen, was die drei Reifegrade für sie bedeuten.
 * Dimensionen, Reifegrade und Beschreibungen kommen aus /api/audit. Der Link führt zur Selbsteinschätzung der Dimension.
 */
export function AuditTeaser() {
  const { lang, t } = useLang();
  const c = home[lang];
  const audit = useAudit(lang);
  const [selected, setSelected] = useState<string | null>(null);

  const dims = audit.data?.dimensions ?? [];
  const current = dims.find((d) => d.slug === selected) ?? dims[0];
  const contentLang = audit.data && audit.data.lang !== lang ? audit.data.lang : undefined;

  return (
    <section className="container section" aria-labelledby="audit-title">
      <div className="audit-panel">
        <div className="audit-top">
          <div>
            <p className="eyebrow">{c.auditEyebrow}</p>
            <h2 id="audit-title" tabIndex={-1}>
              {c.auditTitle}
            </h2>
            <p className="muted">{c.auditText}</p>
          </div>
          {audit.isError ? (
            <div role="alert">
              <p>{t('error.title')}</p>
              <button className="btn btn-light press" type="button" onClick={() => void audit.refetch()}>
                {t('error.retry')}
              </button>
            </div>
          ) : audit.isPending ? (
            <p role="status">{t('loading')}</p>
          ) : (
            <DimensionPicker dims={dims} current={current?.slug} onSelect={setSelected} contentLang={contentLang} />
          )}
        </div>

        {audit.data && current && <Levels slug={current.slug} contentLang={contentLang} />}

        <div className="audit-foot">
          <p className="muted">
            {c.auditNote}
            {contentLang && (
              <>
                {' · '}
                {t('onlyIn', { language: t(`langName.${contentLang}`) })}
              </>
            )}
          </p>
          <Link className="btn btn-light press" to={auditPath(lang, current?.slug)}>
            <span lang={current ? contentLang : undefined}>{current ? fill(c.auditCtaFor, { title: current.title }) : c.auditCta}</span>
            <Icon name="arrowRight" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function DimensionPicker({
  dims,
  current,
  onSelect,
  contentLang,
}: {
  dims: AuditDimensionSummary[];
  current: string | undefined;
  onSelect: (slug: string) => void;
  contentLang: string | undefined;
}) {
  const { lang, t } = useLang();
  return (
    <div className="dimpicker" role="group" aria-label={home[lang].dimensionsLabel}>
      {CATEGORIES.map((cat) => {
        const inCat = dims.filter((d) => d.category === cat);
        if (inCat.length === 0) return null;
        const label = t(`audit.category.${cat}`);
        return (
          <div className="dimgroup" role="group" aria-label={label} key={cat}>
            <span aria-hidden="true">{label}</span>
            <div className="dimchips">
              {inCat.map((d) => (
                <button
                  key={d.slug}
                  className="chip-btn press"
                  type="button"
                  lang={contentLang}
                  aria-pressed={d.slug === current}
                  onClick={() => onSelect(d.slug)}
                >
                  {d.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Die drei Reifegrade mit Leitsatz und der Beschreibung für die gewählte Dimension. */
function Levels({ slug, contentLang }: { slug: string; contentLang: string | undefined }) {
  const { lang, t } = useLang();
  const audit = useAudit(lang);
  const dim = useAuditDimension(slug, lang);
  const levels = audit.data?.levels ?? [];
  return (
    <div className="levels" aria-live="polite" aria-busy={dim.isPending}>
      {levels.map((l) => {
        const desc = dim.data?.levels.find((x) => x.level === l.level)?.description;
        return (
          <article className="level" key={l.level}>
            <div className="level-head">
              <span className={`meter meter--${l.level}`} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <h3 lang={contentLang}>{l.name}</h3>
            </div>
            <p className="motto" lang={contentLang}>
              {l.motto}
            </p>
            <p className="desc" key={slug} lang={desc ? contentLang : undefined}>
              {desc ? firstSentence(desc) : dim.isError ? t('error.title') : t('loading')}
            </p>
          </article>
        );
      })}
    </div>
  );
}
