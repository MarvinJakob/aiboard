import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetConsentMemory } from '../lib/consent';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  resetConsentMemory();
});

// jsdom kennt scrollTo, scrollIntoView und matchMedia nicht vollständig
window.scrollTo = (() => {}) as typeof window.scrollTo;
Element.prototype.scrollTo = function () {} as typeof Element.prototype.scrollTo;
Element.prototype.scrollBy = function () {} as typeof Element.prototype.scrollBy;
Element.prototype.scrollIntoView = function () {} as typeof Element.prototype.scrollIntoView;
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}
