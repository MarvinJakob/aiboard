import { Link } from 'react-router';
import portrait from '../assets/marvin-jakob.jpg';
import { profile } from '../i18n/profile';
import { href, useLang } from '../lib/lang';
import { useHead, usePageFocus } from '../lib/page';

const topicSlugs = ['softwareentwicklung', 'ai-audit', 'data-analytics'];
const symbols = ['</>', '◎', '≋'];

export function Profile() {
  const { lang, t } = useLang();
  const content = profile[lang];
  const h1 = usePageFocus<HTMLHeadingElement>();
  useHead(content.title, content.description);

  return (
    <article className="container profile">
      <nav className="crumbs profile-crumbs" aria-label={t('crumbs')}>
        <Link to={href(lang)}>{content.home}</Link>
        <span aria-hidden="true">/</span><span aria-current="page">Marvin Jakob</span>
      </nav>
      <header className="profile-hero">
        <div>
          <p className="eyebrow">{content.label}</p>
          <h1 className="page-title" tabIndex={-1} ref={h1}>Marvin Jakob<span aria-hidden="true">.</span></h1>
          <p className="profile-headline">{content.headline}<br /><span>{content.headlineAccent}</span></p>
          <p className="profile-intro">{content.intro}</p>
          <ul className="profile-tags" aria-label={content.focusLabel}>
            {content.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
          <a className="btn btn-primary press" href="#expertise-title">
            {content.discover} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <figure className="profile-portrait">
          <img src={portrait} alt={content.portraitAlt} width={1024} height={1024} fetchPriority="high" />
          <figcaption><strong>{content.caption}</strong><span>Marvin Jakob</span></figcaption>
        </figure>
      </header>
      <dl className="profile-facts" aria-label={content.factsLabel}>
        {content.facts.map((fact) => <div key={fact.title}><dt>{fact.title}</dt><dd>{fact.text}</dd></div>)}
      </dl>
      <section id="expertise" className="profile-section" aria-labelledby="expertise-title">
        <div className="profile-section-head">
          <div><p className="eyebrow">{content.expertiseLabel}</p><h2 id="expertise-title" tabIndex={-1}>{content.expertiseTitle}</h2></div>
          <p>{content.expertiseIntro}</p>
        </div>
        <div className="profile-expertise">
          {content.expertise.map((item, index) => (
            <section className="profile-card" key={item.title} aria-labelledby={`expertise-${index}`}>
              <div className="profile-card-top"><span className="profile-symbol" aria-hidden="true">{symbols[index]}</span><span>{item.label}</span></div>
              <h3 id={`expertise-${index}`}>{item.title}</h3>
              <p>{item.text}</p>
              <p className="profile-application"><strong>{content.valueLabel}</strong>{item.value}</p>
              <Link className="profile-topic-link" to={href(lang, `/themen/${topicSlugs[index]}`)}>{item.link}<span aria-hidden="true"> ↗</span></Link>
            </section>
          ))}
        </div>
        <aside className="profile-approach" aria-label={content.approachLabel}><p>{content.approach}</p></aside>
      </section>
      <section className="profile-section profile-projects" aria-labelledby="projects-title">
        <div className="profile-section-head">
          <div><p className="eyebrow">{content.projectsLabel}</p><h2 id="projects-title">{content.projectsTitle}</h2></div>
          <p>{content.projectsIntro}</p>
        </div>
        {content.projects.map((project, index) => (
          <details className="profile-project" key={index} open={index === 0}>
            <summary>
              <span className="profile-period">{project.period}</span>
              <span className="profile-project-heading"><span className="profile-project-title">{project.title}</span><span className="profile-project-role">{project.role}</span></span>
              <span className="profile-project-toggle" aria-hidden="true" />
            </summary>
            <div className="profile-project-body"><p>{project.text}</p><ul className="profile-tags">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></div>
          </details>
        ))}
      </section>
      <section className="profile-about" aria-labelledby="foundation-title">
        <div><p className="eyebrow">{content.foundationLabel}</p><h2 id="foundation-title">{content.foundationTitle}</h2><p>{content.foundationText}</p></div>
        <dl className="profile-credentials">{content.credentials.map((item) => <div key={item.title}><dt>{item.title}</dt><dd>{item.text}</dd></div>)}</dl>
      </section>
      <section className="profile-explore" aria-labelledby="explore-title">
        <h2 id="explore-title">{content.exploreTitle}</h2>
        <Link to={href(lang, '/blog')}>{content.blogLink} <span aria-hidden="true">↗</span></Link>
      </section>
    </article>
  );
}
