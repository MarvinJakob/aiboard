import { Link } from 'react-router';
import { href, useLang } from '../lib/lang';
import { Icon } from './Icon';

export function Loading() {
  const { t } = useLang();
  return (
    <div className="container intro" aria-busy="true">
      <p className="loading" role="status">
        {t('loading')}
      </p>
    </div>
  );
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useLang();
  return (
    <div className="container intro">
      <div className="empty" role="alert">
        <span className="empty-icon">
          <Icon name="info" />
        </span>
        <h1 className="empty-title">{t('error.title')}</h1>
        <p>{t('error.text')}</p>
        <button className="btn btn-secondary press" type="button" onClick={onRetry}>
          {t('error.retry')}
        </button>
      </div>
    </div>
  );
}

export function EmptyPosts({ text, showBlogLink = true }: { text: string; showBlogLink?: boolean }) {
  const { lang, t } = useLang();
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name="inbox" />
      </span>
      <h3>{t('empty.title')}</h3>
      <p>{text}</p>
      {showBlogLink && (
        <Link className="btn btn-secondary press" to={href(lang, '/blog')}>
          {t('empty.cta')} <Icon name="arrowRight" />
        </Link>
      )}
    </div>
  );
}

export function TranslationNotice({ text }: { text: string }) {
  return (
    <p className="notice">
      <Icon name="info" />
      <span>{text}</span>
    </p>
  );
}
