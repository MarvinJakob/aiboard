import { Link } from 'react-router';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';

export function NotFound() {
  const { lang, t } = useLang();
  const h1 = usePageFocus<HTMLHeadingElement>();
  useHead(t('notFound.title'), t('notFound.text'));
  return (
    <div className="container intro">
      <h1 className="page-title" tabIndex={-1} ref={h1}>
        {t('notFound.title')}
      </h1>
      <p className="lead">{t('notFound.text')}</p>
      <p className="actions">
        <Link className="btn btn-primary press" to={href(lang)}>
          {t('notFound.cta')}
        </Link>
      </p>
    </div>
  );
}
