import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import themeScript from '../public/theme.js?raw';
import { THEME_KEY, useTheme } from './lib/theme';

const theme = () => document.documentElement.getAttribute('data-theme');
const boot = () => new Function(themeScript)();

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-theme');
});

describe('Ticket #53: Heller Standard vor und nach dem React-Start', () => {
  it.each([null, 'invalid', 'light', 'dark'])('berücksichtigt die gespeicherte Wahl %s trotz dunklem System', (stored) => {
    if (stored !== null) localStorage.setItem(THEME_KEY, stored);
    const expected = stored === 'dark' ? 'dark' : 'light';
    boot();
    expect(theme()).toBe(expected);
    const { result } = renderHook(useTheme);
    expect(result.current[0]).toBe(expected);
    expect(theme()).toBe(expected);
    expect(localStorage.getItem(THEME_KEY)).toBe(stored);
  });

  it('startet auch mit gesperrtem Speicher hell und lässt sich umschalten', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    boot();
    expect(theme()).toBe('light');
    const { result } = renderHook(useTheme);
    act(() => result.current[1]('dark'));
    expect(theme()).toBe('dark');
    act(() => result.current[1]('light'));
    expect(theme()).toBe('light');
  });

  it('behält die Auswahl beim erneuten Öffnen und startet nach ihrem Löschen wieder hell', () => {
    boot();
    const first = renderHook(useTheme);
    act(() => first.result.current[1]('dark'));
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    first.unmount();
    document.documentElement.removeAttribute('data-theme');
    boot();
    const reopened = renderHook(useTheme);
    expect(reopened.result.current[0]).toBe('dark');
    reopened.unmount();
    localStorage.removeItem(THEME_KEY);
    document.documentElement.removeAttribute('data-theme');
    boot();
    expect(theme()).toBe('light');
    const cleared = renderHook(useTheme);
    expect(cleared.result.current[0]).toBe('light');
  });

  it('bleibt ohne gespeicherte Wahl bei einem Wechsel der Systemeinstellung hell', () => {
    const media = new EventTarget();
    const query = Object.assign(media, { matches: false });
    vi.stubGlobal('matchMedia', vi.fn(() => query));
    const { result } = renderHook(useTheme);
    expect(result.current[0]).toBe('light');
    act(() => {
      query.matches = true;
      query.dispatchEvent(new Event('change'));
    });
    expect(result.current[0]).toBe('light');
    expect(theme()).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });
});
