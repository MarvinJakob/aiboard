import { createContext, useContext } from 'react';
import type { TFunction } from 'i18next';

export const LANGS = ['de', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'de';

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

const STORAGE_KEY = 'ki-perspektiven.lang';

/** Die gewählte Sprache bleibt nur im Browser gespeichert (Design.md, Sprachschalter). */
export function storedLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

export function storeLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* privat oder blockiert */
  }
}

/** Sprache für den Einstieg über "/": gespeicherte Wahl, sonst Browsersprache, sonst Deutsch. */
export function preferredLang(): Lang {
  const stored = storedLang();
  if (stored) return stored;
  const nav = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const l of nav) {
    const short = l?.slice(0, 2).toLowerCase();
    if (isLang(short)) return short;
  }
  return DEFAULT_LANG;
}

/** Tauscht das Sprachpräfix einer URL, z. B. /de/blog/x -> /en/blog/x. */
export function switchLangPath(pathname: string, lang: Lang): string {
  const parts = pathname.split('/');
  if (isLang(parts[1])) {
    parts[1] = lang;
    return parts.join('/');
  }
  return `/${lang}`;
}

export interface LangContextValue {
  lang: Lang;
  t: TFunction;
}

export const LangContext = createContext<LangContextValue | null>(null);

export function useLang(): LangContextValue {
  const v = useContext(LangContext);
  if (!v) throw new Error('useLang außerhalb von LangContext');
  return v;
}

/** Baut einen Pfad in der aktuellen Sprache. */
export const href = (lang: Lang, path = '') => `/${lang}${path}`;
