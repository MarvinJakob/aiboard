import { useSyncExternalStore } from 'react';

/**
 * Cookie-Einstellungen (Ticket #56). Drei Auswahlmodi:
 *  - none: keine Cookies und kein Web Storage, die Auswahl gilt nur im Arbeitsspeicher
 *  - necessary: nur begründet erforderliche Zugriffe (§ 25 Abs. 2 TDDDG)
 *  - all: zusätzlich die in OPTIONAL_PURPOSES beschriebenen optionalen Zwecke
 * Optionale Zwecke gibt es derzeit nicht, deshalb erscheint kein automatisches Banner.
 */
export type ConsentMode = 'none' | 'necessary' | 'all';

export interface ConsentRecord {
  mode: ConsentMode;
  /** ISO-Zeitpunkt der Entscheidung */
  at: string;
  /** Konfigurationsversion, bei neuen Zwecken erhöhen */
  version: number;
}

export const CONSENT_VERSION = 1;
export const CONSENT_KEY = 'ki-perspektiven.consent';
/** Produktfrist, keine gesetzliche Pauschalfrist. */
export const CONSENT_MAX_AGE_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Eigene Speicherschlüssel, die bei „Keine Cookies“ entfernt werden. */
export const PREFERENCE_KEYS = ['ki-perspektiven.lang', 'ki-perspektiven.theme'] as const;

/** Optionale Zwecke (Analyse, Marketing, Drittanbieter). Leer, solange keine eingesetzt werden. */
export const OPTIONAL_PURPOSES: readonly string[] = [];
export const hasOptionalPurposes = () => OPTIONAL_PURPOSES.length > 0;

const isMode = (v: unknown): v is ConsentMode => v === 'none' || v === 'necessary' || v === 'all';

function parse(raw: string | null, now: number): ConsentRecord | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<ConsentRecord>;
    if (!isMode(v.mode) || typeof v.at !== 'string' || v.version !== CONSENT_VERSION) return null;
    if (v.mode === 'all' && !hasOptionalPurposes()) return null;
    const age = now - Date.parse(v.at);
    if (!(age >= 0) || age > CONSENT_MAX_AGE_DAYS * DAY_MS) return null;
    return { mode: v.mode, at: v.at, version: v.version };
  } catch {
    return null;
  }
}

function readStored(now = Date.now()): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    const record = parse(raw, now);
    if (!record && raw !== null) localStorage.removeItem(CONSENT_KEY);
    return record;
  } catch {
    return null;
  }
}

let memory: ConsentRecord | null | undefined;
const listeners = new Set<() => void>();

/** Gültige Entscheidung oder null (keine, abgelaufen, ungültig oder alte Konfigurationsversion). */
export function getConsent(): ConsentRecord | null {
  if (memory === undefined) memory = readStored();
  else if (memory && memory.mode !== 'none' && !parse(JSON.stringify(memory), Date.now())) memory = null;
  return memory;
}

/** Nur bei ausdrücklichem „Keine Cookies“ werden Sprache und Darstellung nicht gespeichert. */
export const canPersistPreferences = () => getConsent()?.mode !== 'none';

export function removePreferences() {
  for (const key of PREFERENCE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* blockiert */
    }
  }
}

export function setConsent(mode: ConsentMode, now = new Date()) {
  if (mode === 'all' && !hasOptionalPurposes()) mode = 'necessary';
  const record: ConsentRecord = { mode, at: now.toISOString(), version: CONSENT_VERSION };
  memory = record;
  try {
    if (mode === 'none') {
      localStorage.removeItem(CONSENT_KEY);
      removePreferences();
      sessionStorage.clear();
    } else {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    }
  } catch {
    /* blockiert: die Auswahl gilt dann nur bis zum Neuladen */
  }
  listeners.forEach((l) => l());
}

/** Nur für Tests: verwirft den Arbeitsspeicher. */
export function resetConsentMemory() {
  memory = undefined;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useConsent(): ConsentRecord | null {
  return useSyncExternalStore(subscribe, getConsent, getConsent);
}
