import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { Topic } from '../api/client';
import { href, useLang } from '../lib/lang';
import { Art } from './Art';
import { Icon } from './Icon';

const GAP = 20;

/**
 * Horizontale Leiste der Themenkarten (Anforderung 1). Die Pfeile erscheinen nur, wenn Karten
 * außerhalb des sichtbaren Bereichs liegen, und sind am Anfang bzw. Ende deaktiviert.
 */
export function TopicRail({ topics, title, subtitle }: { topics: Topic[]; title: string; subtitle: string }) {
  const { t } = useLang();
  const railRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ overflow: false, atStart: true, atEnd: true });

  const update = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setState({
      overflow: rail.scrollWidth - rail.clientWidth > 4,
      atStart: rail.scrollLeft <= 4,
      atEnd: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    update();
    rail.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(rail);
    return () => {
      rail.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [update, topics.length]);

  const scroll = (dir: -1 | 1) => {
    const rail = railRef.current;
    const card = rail?.firstElementChild;
    if (!rail || !card) return;
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({ left: dir * (card.getBoundingClientRect().width + GAP), behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section className="container section" aria-labelledby="topicsHeading">
      <div className="section-head">
        <div>
          <h2 className="section-title" id="topicsHeading">
            {title}
          </h2>
          <p className="section-sub">{subtitle}</p>
        </div>
        <div className="rail-controls" hidden={!state.overflow}>
          <button className="icon-btn glass press" type="button" aria-label={t('prevTopics')} disabled={state.atStart} onClick={() => scroll(-1)}>
            <Icon name="chevLeft" />
          </button>
          <button className="icon-btn glass press" type="button" aria-label={t('nextTopics')} disabled={state.atEnd} onClick={() => scroll(1)}>
            <Icon name="chevRight" />
          </button>
        </div>
      </div>
      <div className="rail" ref={railRef}>
        {topics.map((tp) => (
          <TopicCard key={tp.slug} topic={tp} />
        ))}
      </div>
    </section>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  const { lang, t } = useLang();
  return (
    <Link className="topic-card" to={href(lang, `/themen/${topic.slug}`)}>
      <Art topic={topic.slug} />
      <div className="card-body">
        <p className="card-count">{topic.postCount ? t('count', { count: topic.postCount }) : t('noPostsYet')}</p>
        <h3>{topic.title}</h3>
        <p>{topic.summary}</p>
        <span className="card-link">
          {t('toTopic')} <Icon name="arrowRight" />
        </span>
      </div>
    </Link>
  );
}
