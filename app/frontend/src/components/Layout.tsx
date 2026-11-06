import { useEffect, useMemo } from 'react';
import { Link, Outlet, ScrollRestoration, useParams } from 'react-router';
import { useTopics } from '../api/client';
import { i18n } from '../i18n';
import { DEFAULT_LANG, LangContext, href, isLang, useLang, type Lang } from '../lib/lang';
import { Header } from './Header';
import { NotFound } from '../pages/NotFound';

/** Rahmen aller öffentlichen Seiten: Sprache aus der URL, Kopfzeile, Inhalt, Fußzeile. */
export function LangLayout() {
  const { lang } = useParams();
  if (!isLang(lang)) {
    return (
      <Shell lang={DEFAULT_LANG}>
        <NotFound />
      </Shell>
    );
  }
  return (
    <Shell lang={lang}>
      <Outlet />
    </Shell>
  );
}

export function Shell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const value = useMemo(() => ({ lang, t: i18n.getFixedT(lang) }), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useScrollEffects();

  return (
    <LangContext.Provider value={value}>
      <a className="skip-link" href="#main">
        {value.t('skip')}
      </a>
      <div className="ambient" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>
      <div className="scroll-edge" aria-hidden="true" />
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <ScrollRestoration />
    </LangContext.Provider>
  );
}

function Footer() {
  const { lang, t } = useLang();
  const { data: topics } = useTopics(lang);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="brand-mark" aria-hidden="true" />
              {t('siteName')}
            </div>
            <p className="footer-note">{t('footer.tagline')}</p>
            <p className="footer-note">{t('footer.privacyNote')}</p>
          </div>
          <div>
            <h2 className="footer-head">{t('nav.topics')}</h2>
            <ul className="footer-links">
              {topics?.map((tp) => (
                <li key={tp.slug}>
                  <Link to={href(lang, `/themen/${tp.slug}`)}>{tp.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="footer-head">{t('footer.site')}</h2>
            <ul className="footer-links">
              <li>
                <Link to={href(lang, '/blog')}>{t('nav.blog')}</Link>
              </li>
              <li>
                <Link to={href(lang, '/impressum')}>{t('footer.imprint')}</Link>
              </li>
              <li>
                <Link to={href(lang, '/datenschutz')}>{t('footer.privacy')}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {t('siteName')}</span>
        </div>
      </div>
    </footer>
  );
}

/** Kopfzeile schrumpft beim Scrollen, Lichtreflex folgt dem Mauszeiger (Design.md, Abschnitte 2 und 5). */
function useScrollEffects() {
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        document.documentElement.classList.toggle('is-scrolled', window.scrollY > 24);
        ticking = false;
      });
    };
    let lit: HTMLElement | null = null;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      let el = (e.target as Element | null)?.closest?.<HTMLElement>('.glass, .bar') ?? null;
      if (el?.classList.contains('bar')) el = el.querySelector<HTMLElement>('.bar-glass');
      if (lit && lit !== el) {
        lit.style.removeProperty('--mx');
        lit.style.removeProperty('--my');
      }
      lit = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointermove', onPointer, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointermove', onPointer);
    };
  }, []);
}
