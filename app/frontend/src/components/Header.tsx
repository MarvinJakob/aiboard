import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTopics } from '../api/client';
import { LANGS, href, storeLang, switchLangPath, useLang, type Lang } from '../lib/lang';
import type { NavState } from '../lib/page';
import { artBackground, topicStyle } from '../lib/topicStyle';
import { Icon } from './Icon';

/** Gemeinsame Kopfzeile aller öffentlichen Seiten (Anforderungen 2 und 7). */
export function Header() {
  const { lang, t } = useLang();
  const { pathname } = useLocation();
  const inBlog = pathname.startsWith(`/${lang}/blog`);
  const inTopic = pathname.startsWith(`/${lang}/themen/`);

  return (
    <header className="site-header">
      <nav className="bar" aria-label={t('nav.label')}>
        {/* Glas auf eigener Schicht, damit das Themenmenü kein Glas-auf-Glas wird (Design.md, Abschnitt 5) */}
        <span className="bar-glass glass" aria-hidden="true" />
        <Link className="brand press" to={href(lang)} aria-label={t('nav.brand')}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">{t('siteName')}</span>
        </Link>
        <div className="nav-main">
          <TopicsMenu active={inTopic} />
          <Link className="nav-btn press" to={href(lang, '/blog')} aria-current={inBlog ? 'page' : undefined}>
            {t('nav.blog')}
          </Link>
        </div>
        <div className="nav-actions">
          <LangSwitch />
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
      <div className={`popover glass${open ? ' is-open' : ''}`} id={menuId}>
        <ul className="menu-list" ref={listRef}>
          {topics?.map((tp) => {
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
