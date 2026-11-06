import { useEffect, useState } from 'react';

/**
 * Helle und dunkle Darstellung (Ticket #20). Die Wahl bleibt nur im Browser gespeichert und gilt
 * für die öffentliche Webseite und die Redaktion (gleicher Schlüssel, gleiche Herkunft).
 * public/theme.js setzt das Attribut schon vor dem ersten Zeichnen mit derselben Regel.
 */
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'ki-perspektiven.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const isTheme = (v: unknown): v is Theme => v === 'light' || v === 'dark';

export function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return isTheme(v) ? v : null;
  } catch {
    return null;
  }
}

/** Systemeinstellung; ist sie nicht ermittelbar, gilt hell. */
export function systemTheme(): Theme {
  try {
    return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  return isTheme(attr) ? attr : storedTheme() ?? systemTheme();
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* privat oder blockiert: gilt dann nur bis zum Neuladen */
  }
}

/**
 * Aktuelle Darstellung und Umschalter. Ohne gespeicherte Wahl folgt die Seite Änderungen
 * der Systemeinstellung, sobald eine Wahl gespeichert ist, nicht mehr.
 */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
    if (!mq) return;
    const onChange = () => {
      if (!storedTheme()) setTheme(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const choose = (next: Theme) => {
    storeTheme(next);
    setTheme(next);
  };
  return [theme, choose];
}
