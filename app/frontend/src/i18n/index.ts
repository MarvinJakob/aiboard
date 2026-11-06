import i18next from 'i18next';
import { de } from './de';
import { en } from './en';

// Oberflächentexte. Jede deutsche Beschriftung hat ein englisches Gegenstück (Design.md, Abschnitt 9).
// Die Sprache kommt aus der URL; Komponenten erhalten über LangContext eine feste t-Funktion.
export const i18n = i18next.createInstance();

void i18n.init({
  resources: { de: { translation: de }, en: { translation: en } },
  lng: 'de',
  fallbackLng: 'de',
  supportedLngs: ['de', 'en'],
  interpolation: { escapeValue: false },
  initAsync: false,
});
