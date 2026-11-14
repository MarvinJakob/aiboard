import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { isNotFound, useAudit, useAuditDimension, useTopics, type AuditDimension } from '../api/client';
import { AssessmentSteps } from '../components/AssessmentSteps';
import { Icon } from '../components/Icon';
import { LoadError, Loading, TranslationNotice } from '../components/Status';
import { useAssessment } from '../lib/assessment';
import { AUDIT_TOPIC, auditPath, progress, resultPath, type MaturityLevel } from '../lib/audit';
import { href, useLang, type Lang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';
import { NotFound } from './NotFound';

/**
 * Ein Schritt der geführten Selbsteinschätzung (Ticket #113) unter der bisherigen Dimensions-URL
 * (Anforderung 9): Beschreibung und Nutzen der Dimension, drei auswählbare Reifegrade mit ihren
 * Prüffragen als Entscheidungshilfe und „Zurück“/„Weiter“. Die Auswahl selbst wechselt nie den Schritt.
 */
export function AuditDimensionPage() {
  const { dimension: slug = '' } = useParams();
  const { lang, t } = useLang();
  const h1 = usePageFocus<HTMLHeadingElement>();
  const dimension = useAuditDimension(slug, lang);
  const overview = useAudit(lang);
  const { data: topics } = useTopics(lang);
  const { ratings, rate } = useAssessment();
  useHead(dimension.data?.title, dimension.data?.summary);

  if (dimension.isPending || overview.isPending) return <Loading />;
  if (isNotFound(dimension.error)) return <NotFound />;
  if (dimension.isError) return <LoadError onRetry={() => void dimension.refetch()} />;
  if (overview.isError) return <LoadError onRetry={() => void overview.refetch()} />;

  const d = dimension.data;
  const o = overview.data;
  const contentLang = d.lang !== lang ? d.lang : undefined;
  const topicTitle = topics?.find((tp) => tp.slug === AUDIT_TOPIC)?.title ?? t('audit.eyebrow');
  const index = o.dimensions.findIndex((x) => x.slug === d.slug);

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

      <div className="assess-layout">
        <AssessmentSteps dimensions={o.dimensions} levels={o.levels} ratings={ratings} current={d.slug} />

        <div className="assess-main">
          <header className="assess-head">
            <p className="eyebrow">{t('assess.stepOf', { n: index + 1, total: o.dimensions.length })}</p>
            <h1 className="page-title" tabIndex={-1} ref={h1} lang={contentLang}>
              {d.title}
            </h1>
            <p className="lead" lang={contentLang}>
              {d.summary}
            </p>
            {contentLang && <TranslationNotice text={t('audit.fallback', { language: t(`langName.${d.lang}`) })} />}
          </header>

          <div className="dim-about">
            <div className="dim-intro" lang={contentLang}>
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

          {/* key: Hinweiszustand der Navigation gilt nur für diese Dimension */}
          <LevelChoice
            key={d.slug}
            dimension={d}
            contentLang={contentLang}
            selected={ratings[d.slug]}
            onSelect={(level) => rate(d.slug, level)}
            slugs={o.dimensions.map((x) => x.slug)}
            titles={Object.fromEntries(o.dimensions.map((x) => [x.slug, x.title]))}
          />
        </div>
      </div>
    </div>
  );
}

interface ChoiceProps {
  dimension: AuditDimension;
  contentLang?: Lang;
  selected?: MaturityLevel;
  onSelect: (level: MaturityLevel) => void;
  /** Alle freigegebenen Dimensionen in Ablaufreihenfolge */
  slugs: string[];
  titles: Record<string, string>;
}

/** Reifegradwahl als Radiogruppe und Ablaufnavigation eines Schritts. */
function LevelChoice({ dimension: d, contentLang, selected, onSelect, slugs, titles }: ChoiceProps) {
  const { lang, t } = useLang();
  const { ratings } = useAssessment();
  const navigate = useNavigate();
  const firstRadio = useRef<HTMLInputElement>(null);
  const [blocked, setBlocked] = useState(false);

  const index = slugs.indexOf(d.slug);
  const prev = index > 0 ? slugs[index - 1] : undefined;
  const next = index >= 0 && index < slugs.length - 1 ? slugs[index + 1] : undefined;
  const isLast = index === slugs.length - 1;
  const p = progress(slugs, ratings);
  const selectedName = d.levels.find((l) => l.level === selected)?.name;
  // Weiter braucht eine Auswahl; die Auswertung zusätzlich alle übrigen Dimensionen.
  const canContinue = selected !== undefined && (!isLast || p.complete);

  const onContinue = () => {
    if (!canContinue) {
      setBlocked(true);
      if (selected === undefined) firstRadio.current?.focus();
      return;
    }
    navigate(isLast ? resultPath(lang) : auditPath(lang, next));
  };

  const hintId = `weiter-hinweis-${d.slug}`;
  const hint =
    selected === undefined
      ? t('assess.needChoice')
      : isLast && !p.complete
        ? t('assess.needAll', { list: p.open.map((s) => titles[s] ?? s).join(', ') })
        : t('assess.chosen', { name: selectedName });

  return (
    <>
      <section className="section assess-choice" aria-labelledby="choiceTitle">
        <h2 className="section-title" id="choiceTitle">
          {t('assess.choiceTitle')}
        </h2>
        <p className="section-sub">{t('assess.choiceIntro')}</p>
        <p className="notice assess-privacy">
          <Icon name="info" />
          <span>{t('assess.privacy')}</span>
        </p>
        <fieldset className="choice-group">
          <legend className="sr-only">{t('assess.legend', { title: d.title })}</legend>
          <ol className="choice-list">
            {d.levels.map((l, i) => {
              const id = `reifegrad-${d.slug}-${l.level}`;
              const checked = selected === l.level;
              return (
                <li key={l.level} className="choice-card" data-selected={checked || undefined}>
                  <label className="choice-head" htmlFor={id}>
                    <input
                      ref={i === 0 ? firstRadio : undefined}
                      type="radio"
                      id={id}
                      name={`reifegrad-${d.slug}`}
                      value={l.level}
                      checked={checked}
                      aria-describedby={`${id}-text`}
                      onChange={() => {
                        onSelect(l.level as MaturityLevel);
                        setBlocked(false);
                      }}
                    />
                    <span className="choice-mark" aria-hidden="true">
                      {checked && <Icon name="check" strokeWidth={2.6} />}
                    </span>
                    <span className="choice-name">
                      <span className="eyebrow">{t('audit.levelNo', { n: l.level })}</span>{' '}
                      <strong lang={contentLang}>{l.name}</strong>
                    </span>
                    {checked && (
                      <span className="choice-state" aria-hidden="true">
                        {t('assess.selected')}
                      </span>
                    )}
                  </label>
                  <p className="choice-text" id={`${id}-text`} lang={contentLang}>
                    {l.description}
                  </p>
                  <div className="choice-questions">
                    <h3 id={`${id}-fragen`}>{t('assess.questionsTitle', { level: l.name })}</h3>
                    <ol aria-labelledby={`${id}-fragen`} lang={contentLang}>
                      {l.questions.map((q) => (
                        <li key={q.id}>
                          <span className="q-no">{q.id}</span> <span className="q-label">{q.text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </li>
              );
            })}
          </ol>
        </fieldset>
      </section>

      <nav className="assess-nav" aria-label={t('assess.navLabel')}>
        <p className="assess-hint" id={hintId} role="status" data-blocked={(blocked && !canContinue) || undefined}>
          {hint}
          {isLast && selected !== undefined && !p.complete && p.firstOpen && (
            <>
              {' '}
              <Link to={auditPath(lang, p.firstOpen)}>{t('assess.toOpen')}</Link>
            </>
          )}
        </p>
        <div className="assess-nav-buttons">
          <Link className="btn btn-secondary press" to={auditPath(lang, prev)}>
            <Icon name="chevLeft" /> {prev ? t('assess.back') : t('assess.toOverview')}
          </Link>
          <button
            type="button"
            className="btn btn-primary press"
            aria-disabled={!canContinue}
            aria-describedby={hintId}
            onClick={onContinue}
          >
            {isLast ? t('assess.showResult') : t('assess.next')} <Icon name="chevRight" />
          </button>
        </div>
      </nav>
    </>
  );
}
