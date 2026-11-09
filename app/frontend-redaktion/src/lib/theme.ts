import { useEffect, useState } from 'react';

/**
 * Helle und dunkle Darstellung (Ticket #20). Die Wahl bleibt nur im Browser gespeichert und gilt
 * für die öffentliche Webseite und die Redaktion (gleicher Schlüssel, gleiche Herkunft).
 * public/theme.js setzt das Attribut schon vor dem ersten Zeichnen mit derselben Regel.
 */
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'ki-perspektiven.theme';

const isTheme = (v: unknown): v is Theme => v === 'light' || v === 'dark';

export function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return isTheme(v) ? v : null;
  } catch {
    return null;
  }
}

export function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  return isTheme(attr) ? attr : storedTheme() ?? 'light';
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

/** Aktuelle Darstellung und Umschalter. Ohne gespeicherte Wahl gilt hell (Ticket #53). */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const choose = (next: Theme) => {
    storeTheme(next);
    setTheme(next);
  };
  return [theme, choose];
}
