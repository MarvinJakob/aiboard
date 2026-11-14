import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { MaturityLevel, Ratings } from './audit';

interface Assessment {
  ratings: Ratings;
  rate: (slug: string, level: MaturityLevel) => void;
}

const AssessmentContext = createContext<Assessment | null>(null);

/**
 * Hält die gewählten Reifegrade der Selbsteinschätzung (Ticket #113) für die ganze Anwendung, damit sie
 * beim Wechsel zwischen Dimensionen, Übersicht und Auswertung erhalten bleiben. Bewusst nur im
 * Arbeitsspeicher: Die Auswahl wird weder übertragen noch im Browser gespeichert und endet mit dem
 * Neuladen oder Schließen der Seite. Daher ist auch keine Einwilligung (Cookie-Einstellungen) nötig.
 */
export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [ratings, setRatings] = useState<Ratings>({});
  const rate = useCallback((slug: string, level: MaturityLevel) => setRatings((prev) => ({ ...prev, [slug]: level })), []);
  const value = useMemo(() => ({ ratings, rate }), [ratings, rate]);
  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment(): Assessment {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment braucht einen AssessmentProvider');
  return ctx;
}
