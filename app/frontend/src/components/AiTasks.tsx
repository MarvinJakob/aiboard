import { useRef, useState, type KeyboardEvent } from 'react';
import { aiUses } from '../i18n/aiUses';
import { fill } from '../i18n/sources';
import { useLang } from '../lib/lang';
import { Footnote } from './Footnote';

const KEYS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * Die sieben typischen Aufgaben von KI als Tabs (WAI-ARIA Tabs mit automatischer Aktivierung):
 * Pfeiltasten wechseln den Tab, Pos1 und Ende springen zum ersten bzw. letzten.
 */
export function AiTasks() {
  const { lang } = useLang();
  const c = aiUses[lang];
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = c.tasks.length;
  const task = c.tasks[index];

  const select = (i: number, focus: boolean) => {
    setIndex(i);
    if (focus) tabs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    let next: number | null = null;
    if (e.key in KEYS) next = (index + KEYS[e.key] + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next === null) return;
    e.preventDefault();
    select(next, true);
  };

  return (
    <div className="tasks">
      <div className="tasklist" role="tablist" aria-label={c.tasksLabel} onKeyDown={onKeyDown}>
        {c.tasks.map((tk, i) => (
          <button
            key={tk.name}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`task-${i}`}
            className="chip-btn press"
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-controls="task-panel"
            tabIndex={i === index ? 0 : -1}
            onClick={() => select(i, false)}
          >
            <span className="n" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            {tk.name}
          </button>
        ))}
      </div>
      <div className="taskpanel" role="tabpanel" id="task-panel" aria-labelledby={`task-${index}`} tabIndex={0} key={index}>
        <p className="kicker">{fill(c.taskOf, { i: index + 1, n })}</p>
        <h3>{task.name}</h3>
        <p className="muted">{task.what}</p>
        <p className="example">
          <strong>{c.example}</strong>
          {task.example}
          <Footnote n={task.source} />
        </p>
      </div>
    </div>
  );
}
