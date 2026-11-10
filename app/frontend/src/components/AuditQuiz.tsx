import { useState } from 'react';
import type { AuditDimension, AuditQuestion } from '../api/client';
import { assess, type Answer, type Answers } from '../lib/audit';
import type { Lang } from '../lib/lang';
import { useLang } from '../lib/lang';
import { Icon } from './Icon';

interface Props {
  dimension: AuditDimension;
  /** Sprache der Inhalte, falls sie von der Oberfläche abweicht */
  contentLang?: Lang;
}

const questionAnchor = (slug: string, id: string) => `frage-${slug}-${id}`;

/**
 * Selbsteinschätzung einer Dimension (Anforderung 10). Die Antworten bleiben im Zustand dieser
 * Komponente: Sie werden weder gesendet noch gespeichert und gelten nur für diese Dimension.
 * Die Seite setzt die Komponente je Dimension neu auf (key = slug).
 */
export function AuditQuiz({ dimension, contentLang }: Props) {
  const { t } = useLang();
  const [answers, setAnswers] = useState<Answers>({});
  const result = assess(dimension.levels, answers);
  const answeredAny = Object.keys(answers).length > 0;

  const nameOf = (level: number) =>
    level === 0 ? dimension.notApplied.name : dimension.levels.find((l) => l.level === level)?.name ?? '';
  const descriptionOf = (level: number) =>
    level === 0 ? dimension.notApplied.description : dimension.levels.find((l) => l.level === level)?.description;

  const answer = (id: string, a: Answer) => setAnswers((prev) => ({ ...prev, [id]: a }));

  const focusQuestion = (q: AuditQuestion) => {
    const el = document.getElementById(questionAnchor(dimension.slug, q.id));
    el?.scrollIntoView({ block: 'center' });
    el?.querySelector('input')?.focus({ preventScroll: true });
  };

  return (
    <section className="section" aria-labelledby="quizTitle">
      <h2 className="section-title" id="quizTitle">
        {t('audit.quiz.title')}
      </h2>
      <p className="section-sub quiz-sub">{t('audit.quiz.intro')}</p>
      <p className="notice quiz-privacy">
        <Icon name="info" />
        <span>{t('audit.quiz.privacy')}</span>
      </p>

      <div className="quiz-layout">
        <div className="quiz">
          {dimension.levels.map((level) => (
            <fieldset key={level.level} className="quiz-level">
              <legend>
                <span className="level-badge" aria-hidden="true">
                  {level.level}
                </span>
                <span>{t('audit.quiz.questions', { level: level.name })}</span>
              </legend>
              <ol className="quiz-list">
                {level.questions.map((q) => (
                  <Question
                    key={q.id}
                    anchor={questionAnchor(dimension.slug, q.id)}
                    name={`${dimension.slug}-${q.id}`}
                    question={q}
                    value={answers[q.id]}
                    contentLang={contentLang}
                    onChange={(a) => answer(q.id, a)}
                  />
                ))}
              </ol>
            </fieldset>
          ))}
        </div>

        <aside className="quiz-result" aria-labelledby="resultTitle">
          <h3 id="resultTitle">{t('audit.quiz.resultTitle')}</h3>
          <div role="status" aria-atomic="true">
            {result.complete ? (
              <>
                <p className="result-level">
                  <span className="level-badge" aria-hidden="true">
                    {result.level}
                  </span>
                  <span>{t('audit.quiz.resultLevel', { name: nameOf(result.level) })}</span>
                </p>
                {result.level === 0 && <p className="result-text">{t('audit.quiz.resultNotApplied', { name: nameOf(1) })}</p>}
                <p className="result-text" lang={contentLang}>
                  {descriptionOf(result.level)}
                </p>
              </>
            ) : (
              <>
                <div className="progress" aria-hidden="true">
                  <span style={{ width: `${(result.answered / result.total) * 100}%` }} />
                </div>
                <p className="result-text">
                  {t('audit.quiz.missing', { count: result.total - result.answered, total: result.total })}
                </p>
              </>
            )}
          </div>
          {result.complete && result.level < 3 && (
            <div className="result-next">
              <h4>{t('audit.quiz.nextTitle', { name: nameOf(result.level + 1) })}</h4>
              <p className="result-text">{t('audit.quiz.nextText')}</p>
              <ul lang={contentLang}>
                {result.nextSteps.map((q) => (
                  <li key={q.id}>
                    <span className="quiz-q-no">{q.id}</span> <span className="quiz-q-label">{q.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.complete && result.level === 3 && <p className="result-text">{t('audit.quiz.top')}</p>}
          <div className="result-actions">
            {!result.complete && (
              <button className="btn btn-primary press" type="button" onClick={() => focusQuestion(result.firstOpen)}>
                {t('audit.quiz.toOpen')}
              </button>
            )}
            {answeredAny && (
              <button className="btn btn-secondary press" type="button" onClick={() => setAnswers({})}>
                {t('audit.quiz.reset')}
              </button>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

interface QuestionProps {
  anchor: string;
  name: string;
  question: AuditQuestion;
  value: Answer | undefined;
  contentLang?: Lang;
  onChange: (a: Answer) => void;
}

function Question({ anchor, name, question, value, contentLang, onChange }: QuestionProps) {
  const { t } = useLang();
  const options: Answer[] = question.conditional ? ['yes', 'no', 'na'] : ['yes', 'no'];
  const hintId = `${anchor}-hinweis`;
  return (
    <li className="quiz-q" id={anchor}>
      <fieldset aria-describedby={question.conditional ? hintId : undefined}>
        <legend className="quiz-q-text">
          <span className="quiz-q-no">{question.id}</span>{' '}
          <span className="quiz-q-label" lang={contentLang}>
            {question.text}
          </span>
        </legend>
        {question.conditional && (
          <p className="quiz-hint" id={hintId}>
            {t('audit.quiz.naHint')}
          </p>
        )}
        <div className="quiz-options">
          {options.map((opt) => (
            <label key={opt} className="quiz-option">
              <input
                type="radio"
                name={name}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              <span>{t(`audit.quiz.${opt}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </li>
  );
}
