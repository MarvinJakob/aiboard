import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTopics } from '../api/client';
import { AUDIT_TOPIC, auditPath } from '../lib/audit';
import { LANGS, href, storeLang, switchLangPath, useLang, type Lang } from '../lib/lang';
import { useTheme } from '../lib/theme';
import type { NavState } from '../lib/page';
import { artBackground, topicStyle } from '../lib/topicStyle';
import { Icon } from './Icon';

/**
 * Gemeinsame Kopfzeile aller öffentlichen Seiten (Anforderungen 2 und 7) als schwebende Kapsel im
 * cimt × Apple-Design (DESIGN_CIMT.md, Abschnitte 4 bis 6). Der Glaseffekt entsteht allein per CSS.
 *
 * Bis 650 px Breite klappt ein Menübutton Navigation und Sprachwahl auf; Darstellung und Kontoeinstieg
 * bleiben in der oberen Zeile. Das Menü schließt bei Linkwahl, Seitenwechsel, Klick außerhalb,
 * Fokuswechsel aus der Kopfzeile und `Esc` (dann mit Fokus zurück auf den Menübutton).
 * Auf breiten Ansichten ist der Button per CSS ausgeblendet und das Menü immer sichtbar.
 */
export function Header() {
  const { lang, t } = useLang();
  const { pathname } = useLocation();
  const inBlog = pathname.startsWith(`/${lang}/blog`);
  const profilePath = href(lang, '/profil');
  const inProfile = pathname === profilePath || pathname === `${profilePath}/`;
  // KI Readiness (früher „AI Audit“) ist ein eigener Navigationsbereich (Tickets #21, #110). Übersicht,
  // Selbsteinschätzung und Auswertung bleiben unter /themen/ai-audit und markieren ihn als aktiv.
  const auditRoot = auditPath(lang);
  const inAudit = pathname === auditRoot || pathname.startsWith(`${auditRoot}/`);
  const inTopic = pathname.startsWith(`/${lang}/themen/`) && !inAudit;

  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => setMenuOpen(false), [pathname, lang]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [menuOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape' || !menuOpen) return;
    // Ein offenes Themenmenü schließt zuerst; das übernimmt TopicsMenu selbst.
    if (navRef.current?.querySelector('.nav-topics [aria-expanded="true"]')) return;
    setMenuOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <header className="site-header">
      <nav
        className="container header-inner"
        aria-label={t('nav.label')}
        ref={navRef}
        onKeyDown={onKeyDown}
        onBlur={(e) => {
          if (menuOpen && e.relatedTarget && !navRef.current?.contains(e.relatedTarget as Node)) setMenuOpen(false);
        }}
      >
        <Link className="brand" to={href(lang)} aria-label={t('nav.brand')}>
          <BrandMark />
          <span className="brand-name">{t('siteName')}</span>
        </Link>
        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-lines" aria-hidden="true" />
          {t('nav.menu')}
        </button>
        <div
          className={`header-menu${menuOpen ? ' is-open' : ''}`}
          id={menuId}
          onClick={(e) => {
            if ((e.target as Element).closest('a')) setMenuOpen(false);
          }}
        >
          <div className="nav-main">
            <TopicsMenu active={inTopic} />
            <Link className="nav-btn press" to={href(lang, '/blog')} aria-current={inBlog ? 'page' : undefined}>
              {t('nav.blog')}
            </Link>
            <Link
              className={`nav-btn press${inAudit ? ' is-active' : ''}`}
              to={auditRoot}
              aria-current={pathname === auditRoot ? 'page' : inAudit ? 'true' : undefined}
            >
              {t('nav.audit')}
            </Link>
            <Link
              className={`nav-btn press${inProfile ? ' is-active' : ''}`}
              to={profilePath}
              aria-current={inProfile ? 'page' : undefined}
            >
              {t('nav.profile')}
            </Link>
          </div>
          <LangSwitch />
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          {/* Kontoeinstieg (Anforderung 6): führt zur Anmeldung im eigenständigen Redaktionsfrontend,
              daher ein normaler Link statt einer Route dieser App. */}
          <a className="icon-btn press" href="/redaktion/anmelden" aria-label={t('nav.account')} title={t('nav.account')}>
            <Icon name="user" />
          </a>
        </div>
      </nav>
    </header>
  );
}

/** Wortmarke „ki.“ mit orangefarbenem Punkt, rein dekorativ (DESIGN_CIMT.md, Abschnitt 4). */
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      ki<span>.</span>
    </span>
  );
}

/** Themenmenü als Disclosure: Button mit aria-expanded und Linkliste, kein ARIA-Menü. */
function TopicsMenu({ active }: { active: boolean }) {
  const { lang, t } = useLang();
  const { data: topics } = useTopics(lang);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  // Beim Seitenwechsel schließen
  useEffect(() => setOpen(false), [pathname, lang]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (e: React.MouseEvent) => {
    const next = !open;
    setOpen(next);
    // detail === 0: per Tastatur ausgelöst, dann Fokus auf den ersten Eintrag
    if (next && e.detail === 0) requestAnimationFrame(() => listRef.current?.querySelector('a')?.focus());
  };

  return (
    <div
      className="nav-topics"
      ref={rootRef}
      onBlur={(e) => {
        if (open && e.relatedTarget && !rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        className={`nav-btn press${active ? ' is-active' : ''}`}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggle}
      >
        <span>{t('nav.topics')}</span>
        <Icon name="chevDown" className="chev" strokeWidth={2} />
      </button>
      {/* Opake Fläche: Glas bleibt der Navigationskapsel vorbehalten (DESIGN_CIMT.md, Abschnitt 5). */}
      <div className={`popover${open ? ' is-open' : ''}`} id={menuId}>
        <ul className="menu-list" ref={listRef}>
          {topics?.filter((tp) => tp.slug !== AUDIT_TOPIC).map((tp) => {
            const to = href(lang, `/themen/${tp.slug}`);
            return (
              <li key={tp.slug}>
                <Link
                  className="menu-link"
                  to={to}
                  aria-current={pathname === to ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="menu-icon" style={artBackground(tp.slug, 2)}>
                    <Icon name={topicStyle(tp.slug).icon} />
                  </span>
                  <span>
                    <span className="menu-title">{tp.title}</span>
                    <span className="menu-desc">{tp.summary}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Segment mit gleitender Markierung. Ein Wechsel tauscht nur das Sprachpräfix der URL. */
function LangSwitch() {
  const { lang, t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();

  const select = (next: Lang) => {
    if (next === lang) return;
    storeLang(next);
    const state: NavState = { keepPosition: true };
    navigate(
      { pathname: switchLangPath(location.pathname, next), search: location.search, hash: location.hash },
      { preventScrollReset: true, state },
    );
  };

  return (
    <div className="lang-switch" role="group" aria-label={t('nav.lang')} data-lang={lang}>
      <span className="lang-thumb" aria-hidden="true" />
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === lang}
          aria-label={l === 'de' ? 'Deutsch' : 'English'}
          onClick={() => select(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/**
 * Schalter für die dunkle Darstellung (Ticket #20). Ein Toggle-Button: aria-pressed nennt den Zustand,
 * das Symbol zeigt die aktive Darstellung (Sonne hell, Mond dunkel).
 */
function ThemeToggle() {
  const { t } = useLang();
  const [theme, setTheme] = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      className="icon-btn theme-toggle press"
      type="button"
      aria-pressed={dark}
      aria-label={t('nav.theme')}
      title={t('nav.theme')}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      <Icon name={dark ? 'moon' : 'sun'} />
    </button>
  );
}
