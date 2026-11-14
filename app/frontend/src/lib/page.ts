import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import type { Lang } from './lang';

const SITE = 'KI Perspektiven';

/** Setzt Titel und Beschreibung im <head> beim Seitenwechsel (Erstaufruf: Backend). */
export function useHead(title: string | undefined, description?: string) {
  useEffect(() => {
    if (title === undefined) return;
    document.title = title === SITE ? SITE : `${title} · ${SITE}`;
    if (description !== undefined) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
}

/** Schaltet die Fokusverwaltung beim Seitenwechsel ab, z. B. beim Sprachwechsel. */
export interface NavState {
  keepPosition?: boolean;
}

let firstKey: string | null = null;
const focusedKeys = new Set<string>();

/**
 * Nach jedem Seitenwechsel springt der Fokus auf die H1 (Design.md, Abschnitt 8).
 * Beim ersten Aufruf und beim Sprachwechsel bleibt der Fokus, wo er ist.
 */
export function usePageFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const location = useLocation();
  useEffect(() => {
    if (firstKey === null) firstKey = location.key;
    if (location.key === firstKey || focusedKeys.has(location.key)) return;
    if ((location.state as NavState | null)?.keepPosition) return;
    if (!ref.current) return;
    ref.current.focus({ preventScroll: true });
    focusedKeys.add(location.key);
    // Ohne Abhängigkeitsliste: Die H1 kann erst nach dem Laden der API-Daten erscheinen.
    // Der Location-Key verhindert erneuten Fokus bei späteren Änderungen auf derselben Seite.
  });
  return ref;
}

const dateFormats = new Map<Lang, Intl.DateTimeFormat>();

export function formatDate(iso: string, lang: Lang): string {
  let f = dateFormats.get(lang);
  if (!f) {
    f = new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Berlin',
    });
    dateFormats.set(lang, f);
  }
  return f.format(new Date(iso));
}
