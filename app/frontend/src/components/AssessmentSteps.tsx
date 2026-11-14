import { Link } from 'react-router';
import type { AuditDimensionSummary, AuditLevelInfo } from '../api/client';
import { auditPath, progress, resultPath, type Ratings } from '../lib/audit';
import { useLang } from '../lib/lang';
import { Icon } from './Icon';

interface Props {
  dimensions: AuditDimensionSummary[];
  levels: AuditLevelInfo[];
  ratings: Ratings;
  /** Slug der angezeigten Dimension; fehlt auf der Auswertung */
  current?: string;
}

type State = 'current' | 'rated' | 'open';

/**
 * Nummerierte Schrittliste der Selbsteinschätzung (Ticket #113). Unterscheidet aktuelle, bewertete und
 * offene Dimensionen auch ohne Farbe: aktueller Schritt mit Rahmen und `aria-current="step"`, bewertete
 * mit Häkchen und gewähltem Reifegrad, offene nur mit Nummer; dazu jeweils ein Statustext.
 * Verlinkt sind bewertete Dimensionen (für Korrekturen) und die erste offene, damit der Ablauf
 * Schritt für Schritt bleibt. Sind alle bewertet, führt ein Link zur Auswertung, etwa nach einer Korrektur.
 * Auf schmalen Bildschirmen steht die Liste kompakt über dem Inhalt.
 */
export function AssessmentSteps({ dimensions, levels, ratings, current }: Props) {
  const { lang, t } = useLang();
  const p = progress(dimensions.map((d) => d.slug), ratings);
  const levelName = (n: number) => levels.find((l) => l.level === n)?.name ?? String(n);

  return (
    <nav className="assess-steps" aria-labelledby="assessStepsTitle">
      <h2 className="assess-steps-title" id="assessStepsTitle">
        {t('assess.stepsTitle')}
      </h2>
      <p className="assess-steps-count">{t('assess.ratedCount', { rated: p.rated, total: p.total })}</p>
      <ol className="assess-step-list">
        {dimensions.map((d, i) => {
          const rating = ratings[d.slug];
          const state: State = d.slug === current ? 'current' : rating ? 'rated' : 'open';
          const status =
            state === 'current'
              ? t('assess.stepCurrent')
              : state === 'rated'
                ? t('assess.stepRated', { level: levelName(rating) })
                : t('assess.stepOpen');
          const body = (
            <>
              <span className="assess-step-marker" aria-hidden="true">
                {rating && state !== 'current' ? <Icon name="check" strokeWidth={2.4} /> : i + 1}
              </span>
              <span className="assess-step-text">
                <span className="assess-step-name" lang={d.lang !== lang ? d.lang : undefined}>
                  <span className="sr-only">{i + 1}. </span>
                  {d.title}
                </span>
                <span className="assess-step-status">{status}</span>
              </span>
            </>
          );
          const linked = state !== 'current' && (rating !== undefined || d.slug === p.firstOpen);
          return (
            <li key={d.slug} className="assess-step" data-state={state}>
              {linked ? (
                <Link to={auditPath(lang, d.slug)}>{body}</Link>
              ) : (
                <span aria-current={state === 'current' ? 'step' : undefined}>{body}</span>
              )}
            </li>
          );
        })}
      </ol>
      {p.complete && (
        <Link className="text-link assess-steps-result" to={resultPath(lang)} aria-current={current === undefined ? 'page' : undefined}>
          {t('assess.showResult')} <Icon name="arrowRight" />
        </Link>
      )}
    </nav>
  );
}
