/**
 * Ziel nach der Anmeldung (Ticket #49). Bei aktivem Zugangsschutz führt das Backend Besucherinnen und
 * Besucher mit `?weiter=/pfad` zur Anmeldung. Danach geht es zurück zu dieser Seite der Webseite.
 */

/** Liefert das Ziel nur, wenn es ein Pfad derselben Webseite ist. Dieselbe Regel prüft das Backend. */
export function safeTarget(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
  if (/[\r\n\t]/.test(value)) return null;
  return value;
}

/** Lädt eine Seite außerhalb des Redaktionsfrontends. Als Objekt, damit Tests es ersetzen können. */
export const page = {
  open(url: string) {
    window.location.assign(url);
  },
};
