import type { ReactNode } from 'react';
import { useLang } from '../lib/lang';

/**
 * Tabelle aus Markdown-Inhalten (Themenseiten und KI Readiness).
 * Zellen brechen nicht mitten im Wort um; ist die Tabelle breiter als der Inhalt,
 * scrollt sie horizontal. Daher ist der Container fokussierbar und benannt (Ticket #81, #117).
 */
export function ContentTable({ children }: { children?: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="topic-table" role="region" aria-label={t('topic.table')} tabIndex={0}>
      <table>{children}</table>
    </div>
  );
}
