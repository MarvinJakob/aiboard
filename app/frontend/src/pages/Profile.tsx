import { Link } from 'react-router';
import { profile } from '../content/profile';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';

export function Profile() {
  const { lang } = useLang();
  const content = profile[lang];
  const h1 = usePageFocus<HTMLHeadingElement>();
  useHead(content.title, content.description);

  return (
    <article className="article profile">
      <header className="article-head">
        <p className="eyebrow">{content.label}</p>
        <h1 className="page-title" tabIndex={-1} ref={h1}>Marvin Jakob</h1>
        <p className="lead">{content.intro}</p>
      </header>
      <div className="prose">
        <section aria-labelledby="profile-experience">
          <h2 id="profile-experience">{content.experienceTitle}</h2>
          {content.experience.map((station) => (
            <section key={station.title}>
              <h3>{station.title}</h3>
              <p>{station.text}</p>
            </section>
          ))}
        </section>
        <section aria-labelledby="profile-topics">
          <h2 id="profile-topics">{content.topicsTitle}</h2>
          <p>{content.topicsIntro}</p>
          {content.topics.map((topic) => (
            <section key={topic.slug}>
              <h3>{topic.title}</h3>
              <p>{topic.text}</p>
              <p><Link to={href(lang, `/themen/${topic.slug}`)}>{topic.link}</Link></p>
            </section>
          ))}
        </section>
      </div>
    </article>
  );
}
