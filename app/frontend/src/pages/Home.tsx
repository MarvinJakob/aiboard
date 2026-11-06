import { Link } from 'react-router';
import { usePosts, useTopics } from '../api/client';
import { Carousel } from '../components/Carousel';
import { Icon } from '../components/Icon';
import { PostList } from '../components/PostRow';
import { LoadError, Loading } from '../components/Status';
import { TopicRail } from '../components/TopicRail';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';

const MORE_POSTS = 3;

/** Startseite: aktuelle Beiträge und Themenkarten (Anforderung 1). */
export function Home() {
  const { lang, t } = useLang();
  const h1 = usePageFocus<HTMLHeadingElement>();
  const topics = useTopics(lang);
  const featured = usePosts(lang, true);
  const posts = usePosts(lang);
  useHead(t('siteName'), t('home.description'));

  const featuredSlugs = new Set(featured.data?.map((p) => p.slug));
  const more = (posts.data ?? []).filter((p) => !featuredSlugs.has(p.slug)).slice(0, MORE_POSTS);

  return (
    <>
      <section className="container intro">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1 className="display" tabIndex={-1} ref={h1}>
          {t('home.display1')}
          <br />
          {t('home.display2')}
        </h1>
        <p className="lead">{t('home.lead')}</p>
      </section>

      {/* Ohne veröffentlichte Beiträge entfällt das Karussell, die Themenkarten bleiben. */}
      {featured.data && featured.data.length > 0 && <Carousel posts={featured.data} />}

      {topics.isPending ? (
        <Loading />
      ) : topics.isError ? (
        <LoadError onRetry={() => void topics.refetch()} />
      ) : (
        <TopicRail topics={topics.data} title={t('home.topics')} subtitle={t('home.topicsSub')} />
      )}

      {more.length > 0 && (
        <section className="container section" aria-labelledby="moreHeading">
          <div className="section-head">
            <h2 className="section-title" id="moreHeading">
              {t('home.more')}
            </h2>
            <Link className="text-link" to={href(lang, '/blog')}>
              {t('allPosts')} <Icon name="arrowRight" />
            </Link>
          </div>
          <PostList posts={more} />
        </section>
      )}
    </>
  );
}
