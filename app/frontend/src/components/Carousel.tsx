import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { PostSummary } from '../api/client';
import { href, useLang } from '../lib/lang';
import { formatDate } from '../lib/page';
import { seedOf } from '../lib/topicStyle';
import { Art } from './Art';
import { Icon } from './Icon';

const reduceMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Beitrags-Karussell der Startseite (Anforderung 1, Design.md, Abschnitt 7).
 * Kein Autoplay. Wischen, Positionspunkte und Pfeile sind gleichwertig. Nicht sichtbare Folien sind inert.
 */
export function Carousel({ posts }: { posts: PostSummary[] }) {
  const { lang, t } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const n = posts.length;

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return; // clientWidth ist 0, solange nichts gerendert ist
    setIndex(Math.min(n - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth))));
  }, [n]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', sync, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    ro?.observe(track);
    return () => {
      track.removeEventListener('scroll', sync);
      ro?.disconnect();
    };
  }, [sync]);

  const go = (i: number) => {
    const next = (i + n) % n;
    setIndex(next); // sofortiges Feedback, auch ohne Layout (z. B. in Tests)
    const track = trackRef.current;
    if (track?.clientWidth) {
      track.scrollTo({ left: next * track.clientWidth, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
  };

  return (
    <section className="container" aria-roledescription="carousel" aria-label={t('home.carousel')}>
      <div className="hero">
        <div className="hero-track" ref={trackRef}>
          {posts.map((p, i) => {
            const fallback = p.lang !== lang;
            const contentLang = fallback ? p.lang : undefined;
            const main = p.topics[0];
            return (
              <div
                key={p.slug}
                className="slide"
                role="group"
                aria-roledescription={t('slide')}
                aria-label={t('slideOf', { i: i + 1, n })}
                inert={i !== index}
              >
                <Link className="slide-link" to={href(lang, `/blog/${p.slug}`)}>
                  <Art topic={main?.slug} seed={seedOf(p.slug) + 7} image={p.cover} eager={i === 0} sizes="(max-width: 1120px) 100vw, 1120px" />
                  <div className="slide-body">
                    <span className="slide-kicker">
                      <i aria-hidden="true" />
                      {t('home.featured')}
                      {main ? ` · ${main.label}` : ''}
                    </span>
                    <h2 className="slide-title" lang={contentLang}>
                      {p.title}
                    </h2>
                    <p className="slide-teaser" lang={contentLang}>
                      {p.summary}
                    </p>
                    <p className="slide-meta">
                      <time dateTime={p.publishedAt}>{formatDate(p.publishedAt, lang)}</time>
                      {fallback && <span>{t('onlyIn', { language: t(`langName.${p.lang}`) })}</span>}
                      <span className="slide-cta">
                        {t('readMore')} <Icon name="arrowRight" />
                      </span>
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        {n > 1 && (
          <div className="hero-controls glass glass--clear">
            <button className="icon-btn press" type="button" aria-label={t('prevPost')} onClick={() => go(index - 1)}>
              <Icon name="chevLeft" />
            </button>
            <div className="dots">
              {posts.map((p, i) => (
                <button
                  key={p.slug}
                  className="dot-btn"
                  type="button"
                  aria-label={t('slideOf', { i: i + 1, n })}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => go(i)}
                >
                  <span />
                </button>
              ))}
            </div>
            <button className="icon-btn press" type="button" aria-label={t('nextPost')} onClick={() => go(index + 1)}>
              <Icon name="chevRight" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
