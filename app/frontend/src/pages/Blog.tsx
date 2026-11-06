import { usePosts } from '../api/client';
import { PostList } from '../components/PostRow';
import { EmptyPosts, LoadError, Loading } from '../components/Status';
import { useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';

/** Blogübersicht: alle veröffentlichten Beiträge, neueste zuerst (Anforderung 4). */
export function Blog() {
  const { lang, t } = useLang();
  const h1 = usePageFocus<HTMLHeadingElement>();
  const posts = usePosts(lang);
  useHead(t('blog.title'), t('blog.description'));

  return (
    <div className="container">
      <section className="intro">
        <h1 className="page-title" tabIndex={-1} ref={h1}>
          {t('blog.title')}
        </h1>
        <p className="lead">{t('blog.lead')}</p>
      </section>
      {posts.isPending ? (
        <Loading />
      ) : posts.isError ? (
        <LoadError onRetry={() => void posts.refetch()} />
      ) : posts.data.length > 0 ? (
        <PostList posts={posts.data} headingLevel={2} />
      ) : (
        <EmptyPosts text={t('empty.blogText')} showBlogLink={false} />
      )}
    </div>
  );
}
