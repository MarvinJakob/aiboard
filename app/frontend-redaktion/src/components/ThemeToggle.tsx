import { useTheme } from '../lib/theme';

/**
 * Schalter für die dunkle Darstellung (Ticket #20), wie in der Kopfzeile der öffentlichen Webseite.
 * aria-pressed nennt den Zustand, das Symbol zeigt die aktive Darstellung (Sonne hell, Mond dunkel).
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      className={`icon-btn theme-toggle press ${className}`.trim()}
      type="button"
      aria-pressed={dark}
      aria-label="Dunkle Darstellung"
      title="Dunkle Darstellung"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {dark ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
