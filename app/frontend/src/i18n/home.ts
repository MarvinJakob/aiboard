import type { Lang } from '../lib/lang';

/**
 * Fließtext mit Auszeichnung: Texte stehen unverändert, `{ code }` wird zu <code>, `{ em }` zu <em>.
 * `{ em }` entspricht der Hervorhebung `*…*` der Textvorlage.
 */
export type RichText = (string | { code: string } | { em: string })[];

/** Pfad der ausführlichen Einordnung zu KI-Einsatzfeldern (Seite AiUses). */
export const AI_USES_PATH = '/ki-einsatzfelder';

/** Die drei Themen der Startseite; der Slug ist zugleich Sprungziel und Pfad der Themenseite. */
export type HomeTopicSlug = 'data-analytics' | 'softwareentwicklung' | 'modelle-und-kosten';

/** Ein ausführlicher Themenabschnitt: Leitfrage, alle Absätze der Vorlage und Artikel-Verweis. */
export interface HomeTopic {
  slug: HomeTopicSlug;
  title: string;
  /** Kurzzeile im Themenindex unter dem Hero. */
  teaser: string;
  question: string;
  paragraphs: RichText[];
  articleLink: string;
}

interface HomeContent {
  /** Seitentitel und Beschreibung; serverseitig gleichlautend in backend/internal/web/meta.go. */
  title: string;
  description: string;
  hook: string;
  display1: string;
  display2: string;
  lead: [string, string];
  ctaTopics: string;
  ctaNews: string;
  ctaAudit: string;
  ctaAbout: string;
  indexLabel: string;
  topicsEyebrow: string;
  topicsTitle: [string, string];
  topicsText: [string, string];
  topics: [HomeTopic, HomeTopic, HomeTopic];
  auditEyebrow: string;
  auditTitle: [string, string];
  auditText: string;
  auditCta: string;
  auditStepsLabel: string;
  auditSteps: [string, string, string];
  auditStepsText: [string, string];
  profileEyebrow: string;
  profileName: string;
  profileText: [string, string];
}

/**
 * Texte der Startseite (Ticket #101). Hero, Leitfragen, Absätze, Hervorhebungen und Artikel-Linktexte stammen
 * wortgleich aus content/Landingpage_v03.md, Stand 10. November 2026; app.test.tsx prüft die Übereinstimmung.
 * Zeichensetzung und Schreibweise der Vorlage bleiben bewusst unverändert. Zwischenüberschriften, Kurzzeilen
 * im Themenindex, KI-Reifegrad-Banner und Profil-Teaser folgen dem Mock mock/landing_v03/.
 */
export const home: Record<Lang, HomeContent> = {
  de: {
    title: 'KI verstehen. Sinnvoll einsetzen.',
    description: 'Praxiswissen für den professionellen Einsatz von KI. Mit klarem Blick auf Nutzen, Grenzen und Verantwortung.',
    hook: 'KI kann viel. Entscheidend ist, wie wir sie einsetzen.',
    display1: 'KI verstehen.',
    display2: 'Sinnvoll einsetzen.',
    lead: ['Praxiswissen für den professionellen Einsatz von KI.', 'Mit klarem Blick auf Nutzen, Grenzen und Verantwortung.'],
    ctaTopics: 'Themen entdecken',
    ctaNews: 'News',
    ctaAudit: 'KI Reifegrad einschätzen',
    ctaAbout: 'Über mich',
    indexLabel: 'Direkt zu den Themen',
    topicsEyebrow: 'Aktuell im Fokus',
    topicsTitle: ['Gute Fragen.', 'Neue Perspektiven.'],
    topicsText: ['Den Nutzen sehen. Die Grenzen kennen.', 'Und die richtigen Fragen stellen.'],
    topics: [
      {
        slug: 'data-analytics',
        title: 'Data Analytics',
        teaser: 'Unternehmenswissen nutzbar machen',
        question: 'Was musst du der KI immer wieder erklären, damit sie deine Arbeit versteht?',
        paragraphs: [
          ['Was eine Abkürzung bedeutet. Warum ein Prozess so läuft. Welche Ausnahme bei einem Kunden gilt. Vieles davon ist für uns selbstverständlich. Für die KI müssen wir es erst zugänglich machen.'],
          ['Dieses Unternehmenswissen steckt in Köpfen, Mails, Tickets und Dokumenten. Es ist über Jahre gewachsen und über viele Orte verteilt.'],
          ['Wie wichtig dieses Wissen ist, zeigt sich auch bei der Datenanalyse. Eine Auswertung zeigt zum Beispiel, dass die Bearbeitungszeit im Support steigt. Um mögliche Ursachen zu verstehen, brauchen wir mehr als die Kennzahl: Welche Probleme werden gemeldet? Wo fehlen Informationen? Welche Rückfragen wiederholen sich? Hinweise darauf stehen oft in den Tickets selbst.'],
          ['Hier wird Unternehmenswissen zum Kontext für Data Analytics.'],
          ['Mit KI können wir neben strukturierten Daten auch Texte aus Tickets, Mails und Dokumenten untersuchen und miteinander in Beziehung setzen. So lässt sich Wissen in die Analyse einbeziehen, das bisher nur schwer auszuwerten war.'],
          ['Damit daraus belastbare Erkenntnisse werden, müssen wir klären: Welche Quellen sind verlässlich? Wie aktuell sind sie? Wer darf darauf zugreifen? Und wie überprüfen wir die Ergebnisse?'],
          ['Was bedeutet das für die Art, wie wir Daten analysieren und fachliche Fragen beantworten?'],
        ],
        articleLink: 'Zum Artikel: Data Analytics mit KI',
      },
      {
        slug: 'softwareentwicklung',
        title: 'Softwareentwicklung',
        teaser: 'Mit Agenten zusammenarbeiten',
        question: 'Wenn KI uns die langweilige Arbeit abnimmt, wird Softwareentwicklung endlich kreativer?',
        paragraphs: [
          ['Weniger Routine, mehr Raum für gute Ideen: Das ist eines der großen Versprechen von KI.'],
          ['Wenn Code erstellen, Tests vorbereiten oder Dokumentation schreiben weniger Zeit kosten, könnten wir uns stärker darauf konzentrieren, Probleme zu verstehen, Lösungswege auszuprobieren und Software besser zu gestalten.'],
          ['Wenn wir jeden Schritt kontrollieren und jeden Vorschlag nacharbeiten müssen, verschiebt sich die Arbeit oft nur.'],
          ['Spannend wird es beim ', { em: 'Schritt vom KI-Assistenten zum KI-Agenten' }, '. Statt uns nur einzelne Vorschläge zu liefern, kann ein Agent zusammenhängende Aufgaben übernehmen'],
          ['Er erschließt bestehenden Code, entwickelt und vergleicht Lösungsansätze, setzt Änderungen um und prüft sie mithilfe von Tests und Code-Reviews.'],
          ['Diese Eigenständigkeit braucht Orientierung und Grenzen.'],
          ['Mit ', { em: 'Skills' }, ' geben wir der KI bewährte Vorgehensweisen mit und machen Fachwissen für die KI nutzbar.'],
          ['Durch ', { em: 'Guardrails' }, ' begrenzen wir ihren Handlungsspielraum um bei kritischen Aktionen die kontrolle zu behalten.'],
          ['Beides hilft uns, Aufgaben gezielt an die KI zu übertragen. Wir legen fest, was sie tun soll und darf, prüfen ihre Ergebnisse und entscheiden, welche Änderungen wir übernehmen.'],
          ['Die Verantwortung für das Ergebnis bleibt bei uns aber wir müssen nicht mehr jeden Arbeitsschritt selbst ausführen.'],
          ['So bleibt mehr Zeit, um die richtigen Herausforderungen zu verstehen und Software zu entwickeln, die echten Mehrwert schafft.'],
          ['Wie sieht diese Zusammenarbeit in der Praxis aus? Im Artikel ', { em: '„KI in der Softwareentwicklung“' }, ' gehen wir genauer darauf ein, welche Aufgaben KI-Agenten übernehmen können, wie Skills sie dabei unterstützen und wie wir mit Guardrails die Kontrolle behalten.'],
        ],
        articleLink: 'Zum Artikel: KI in der Softwareentwicklung',
      },
      {
        slug: 'modelle-und-kosten',
        title: 'Modelle und Kosten',
        teaser: 'Den Aufwand als Ganzes verstehen',
        question: 'Was kostet uns ein günstiges KI-Modell, wenn wir jedes Ergebnis nacharbeiten müssen?',
        paragraphs: [
          ['Ein Text ist schnell erstellt. Aber stimmt der Inhalt? Fehlen wichtige Angaben? Und wie lange brauchen wir, bis wir das Ergebnis verwenden können?'],
          ['Wer Modelle nur nach ihrem Preis vergleicht, übersieht leicht den Aufwand, der danach entsteht. Ein günstiger Aufruf kann teuer werden, wenn wir mehrere Versuche brauchen oder viel korrigieren müssen. Ein teureres Modell kann sich lohnen, wenn es uns diese Arbeit erspart.'],
          ['Entscheidend ist deshalb: ', { em: 'Was kostet eine erfolgreich erledigte Aufgabe in der Qualität, die wir brauchen?' }],
          ['Dazu gehören neben den Modellkosten auch Werkzeuge, Betrieb und unsere Zeit für Prüfung und Korrekturen.'],
          ['Welche Qualität nötig ist, hängt von der Aufgabe ab. Für einen ersten Textentwurf gelten andere Anforderungen als für das Auslesen von Rechnungsdaten.'],
          ['Öffentliche Ranglisten helfen uns, mögliche Modelle auszuwählen. Wie gut sie zu unserer Arbeit passen, zeigt sich aber erst an eigenen Aufgaben.'],
          ['Dafür legen wir fest, was ein brauchbares Ergebnis ausmacht, testen verschiedene Modelle mit denselben Fällen und vergleichen Qualität, Zeitaufwand und Gesamtkosten.'],
          ['So können wir erkennen, wo ein günstiges Modell ausreicht und wann sich ein leistungsfähigeres lohnt.'],
          ['Wie gehen wir dabei vor? Im Artikel ', { em: '„Modelle und Kosten“' }, ' zeigen wir, welche Kosten in den Vergleich gehören und wie wir mit eigenen Testaufgaben das passende Modell finden.'],
        ],
        articleLink: 'Zum Artikel: Modelle und Kosten',
      },
    ],
    auditEyebrow: 'Der nächste Schritt',
    auditTitle: ['KI-Reifegrad', 'einschätzen.'],
    auditText: 'Wo steht dein Unternehmen beim Einsatz von KI?',
    auditCta: 'Zum KI-Audit',
    auditStepsLabel: 'Drei Reifegrade',
    auditSteps: ['Einfach', 'Strukturiert', 'Intelligent'],
    auditStepsText: ['Den eigenen Stand verstehen.', 'Den nächsten Schritt erkennen.'],
    profileEyebrow: 'Die Perspektive dahinter',
    profileName: 'Marvin Jakob.',
    profileText: ['Softwareentwicklung, Cloud-Architektur und Business Analyse.', 'Ein praxisnaher Blick auf den professionellen Einsatz von KI.'],
  },
  en: {
    title: 'Understand AI. Use it wisely.',
    description: 'Practical knowledge for the professional use of AI. With a clear view of benefits, limits and responsibility.',
    hook: 'AI can do a lot. What matters is how we use it.',
    display1: 'Understand AI.',
    display2: 'Use it wisely.',
    lead: ['Practical knowledge for the professional use of AI.', 'With a clear view of benefits, limits and responsibility.'],
    ctaTopics: 'Explore topics',
    ctaNews: 'News',
    ctaAudit: 'Assess your AI maturity',
    ctaAbout: 'About me',
    indexLabel: 'Jump to the topics',
    topicsEyebrow: 'Currently in focus',
    topicsTitle: ['Good questions.', 'New perspectives.'],
    topicsText: ['See the benefits. Know the limits.', 'And ask the right questions.'],
    topics: [
      {
        slug: 'data-analytics',
        title: 'Data Analytics',
        teaser: 'Making company knowledge usable',
        question: 'What do you keep having to explain to AI so that it understands your work?',
        paragraphs: [
          ['What an abbreviation means. Why a process works the way it does. Which exception applies to a particular customer. Much of this is obvious to us. For AI, we first have to make it accessible.'],
          ['This company knowledge sits in people’s heads, emails, tickets and documents. It has grown over years and is spread across many places.'],
          ['How important this knowledge is also shows in data analysis. An evaluation shows, for example, that processing times in support are rising. To understand possible causes, we need more than the metric: Which problems are reported? Where is information missing? Which follow-up questions keep coming up? The clues are often in the tickets themselves.'],
          ['This is where company knowledge becomes context for data analytics.'],
          ['With AI, we can examine not only structured data but also texts from tickets, emails and documents and relate them to each other. This brings knowledge into the analysis that used to be hard to evaluate.'],
          ['For this to produce reliable insights, we need to clarify: Which sources are reliable? How up to date are they? Who may access them? And how do we check the results?'],
          ['What does this mean for the way we analyse data and answer business questions?'],
        ],
        articleLink: 'Read the article: Data Analytics with AI',
      },
      {
        slug: 'softwareentwicklung',
        title: 'Software Development',
        teaser: 'Working together with agents',
        question: 'If AI takes the boring work off our hands, will software development finally become more creative?',
        paragraphs: [
          ['Less routine, more room for good ideas: that is one of the big promises of AI.'],
          ['If writing code, preparing tests or documenting takes less time, we could focus more on understanding problems, trying out solutions and designing better software.'],
          ['If we have to check every step and rework every suggestion, the work often just shifts.'],
          ['It gets exciting with the ', { em: 'step from AI assistant to AI agent' }, '. Instead of only giving us individual suggestions, an agent can take on connected tasks.'],
          ['It explores existing code, develops and compares approaches, implements changes and checks them with tests and code reviews.'],
          ['This autonomy needs direction and limits.'],
          ['With ', { em: 'skills' }, ', we give AI proven ways of working and make expert knowledge usable for AI.'],
          ['With ', { em: 'guardrails' }, ', we limit its room for action so that we stay in control of critical actions.'],
          ['Both help us delegate tasks to AI in a targeted way. We define what it should and may do, check its results and decide which changes we accept.'],
          ['Responsibility for the result stays with us, but we no longer have to carry out every step ourselves.'],
          ['That leaves more time to understand the right challenges and build software that creates real value.'],
          ['What does this collaboration look like in practice? In the article ', { em: '“AI in Software Development”' }, ' we look more closely at which tasks AI agents can take on, how skills support them and how guardrails keep us in control.'],
        ],
        articleLink: 'Read the article: AI in Software Development',
      },
      {
        slug: 'modelle-und-kosten',
        title: 'Models and Costs',
        teaser: 'Seeing the effort as a whole',
        question: 'What does a cheap AI model cost us if we have to rework every result?',
        paragraphs: [
          ['A text is quickly created. But is the content correct? Is important information missing? And how long does it take until we can use the result?'],
          ['Anyone who compares models only by price easily overlooks the effort that follows. A cheap call can become expensive if we need several attempts or a lot of corrections. A more expensive model can pay off if it saves us this work.'],
          ['What matters is therefore: ', { em: 'What does a successfully completed task cost at the quality we need?' }],
          ['Besides model costs, this includes tools, operations and our time for reviews and corrections.'],
          ['The quality required depends on the task. A first text draft has different requirements than extracting invoice data.'],
          ['Public rankings help us shortlist possible models. How well they fit our work, however, only shows on our own tasks.'],
          ['To do this, we define what makes a result usable, test different models with the same cases and compare quality, time spent and total costs.'],
          ['This shows us where a cheap model is enough and when a more capable one pays off.'],
          ['How do we go about it? In the article ', { em: '“Models and Costs”' }, ' we show which costs belong in the comparison and how we find the right model with our own test tasks.'],
        ],
        articleLink: 'Read the article: Models and Costs',
      },
    ],
    auditEyebrow: 'The next step',
    auditTitle: ['Assess your', 'AI maturity.'],
    auditText: 'Where does your company stand in its use of AI?',
    auditCta: 'Go to the AI audit',
    auditStepsLabel: 'Three maturity levels',
    auditSteps: ['Basic', 'Structured', 'Intelligent'],
    auditStepsText: ['Understand where you stand.', 'Recognise the next step.'],
    profileEyebrow: 'The perspective behind it',
    profileName: 'Marvin Jakob.',
    profileText: ['Software development, cloud architecture and business analysis.', 'A practical view of the professional use of AI.'],
  },
};
