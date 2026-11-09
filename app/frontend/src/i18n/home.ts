import type { Lang } from '../lib/lang';
import { localizeSources, type RichText, type Source } from './sources';

/** Pfad der ausführlichen Einordnung zu KI-Einsatzfeldern (Seite AiUses). */
export const AI_USES_PATH = '/ki-einsatzfelder';

/** Eine Themenkarte im Abschnitt „Aktuell im Fokus“. */
export interface FocusTopic {
  /** Slug der Themenseite unter /{lang}/themen/{slug}. */
  slug: string;
  title: string;
  /** Aufhänger: eine Frage oder eine überraschende Zahl, fett hervorgehoben. */
  hook: RichText;
  text: RichText;
  link: string;
}

interface HomeContent {
  description: string;
  hook: RichText;
  display1: string;
  display2: string;
  lead: string;
  ctaTopics: string;
  ctaAudit: string;
  focusEyebrow: string;
  focusTitle: string;
  focusText: string;
  topics: FocusTopic[];
  basicsEyebrow: string;
  basicsTitle: string;
  basicsText: RichText;
  checkTitle: string;
  checkText: RichText[];
  limitsTitle: string;
  limitsText: RichText;
  limits: { title: string; text: RichText }[];
  moreText: string;
  moreLink: string;
  sourcesTitle: string;
  sources: Source[];
}

// Belege für Zahlen und Studienaussagen der Textvorlage content/Landingpage.md (Stand 2026-11-09):
// 1–3, 5: research/2026-11-09 Was ist KI und was man damit machen kann.md
// 4: research/2026-11-05 Kosten von KI aus Nutzersicht.md, Quelle 15
// 6: content/KI Tipps und Tricks.md, Quelle 19 (= frontend/src/content/topics/ki-tipps-und-tricks.de.md)
// 7: research/2026-11-09 Modelle und Kosten - Preis und Leistung vergleichen.md, Quelle 8 (gpt-6-luna und gpt-6-astra)
const SOURCES: Omit<Source, 'note'>[] = [
  {
    label: 'Statistisches Bundesamt (2025)',
    title: 'Unternehmen mit Nutzung von KI nach Beschäftigtengrößenklassen',
    url: 'https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/IKT-in-Unternehmen-IKT-Branche/Tabellen/ikti-unternehmen-kuenstliche-intelligenz.html',
  },
  {
    label: 'OECD (2024)',
    title: 'Explanatory memorandum on the updated OECD definition of an AI system',
    url: 'https://www.oecd.org/en/publications/explanatory-memorandum-on-the-updated-oecd-definition-of-an-ai-system_623da898-en.html',
  },
  {
    label: 'Europäische Kommission (2025)',
    title: 'Leitlinien zur Definition eines KI-Systems (AI Act)',
    url: 'https://ai-act-service-desk.ec.europa.eu/sites/default/files/2025-08/commission_guidelines_on_the_definition_of_an_artificial_intelligence_system_established_by_regulation_eu_20241689_ai_actenglish_nf2skcqfrtjdfggjavcodopcwz4_112455.PDF',
  },
  {
    label: 'METR (2025)',
    title: 'Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity',
    url: 'https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/',
  },
  {
    label: 'BSI (2025)',
    title: 'Generative KI-Modelle – Chancen und Risiken',
    url: 'https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/KI/Generative_KI-Modelle.pdf?__blob=publicationFile&v=5',
  },
  {
    label: 'Li et al. (2026), Preprint',
    title: 'SkillsBench, Version 4',
    url: 'https://arxiv.org/abs/2602.12670v4',
  },
  {
    label: 'OpenAI (2026)',
    title: 'API Pricing',
    url: 'https://developers.openai.com/api/docs/pricing',
  },
];

/** Texte der Startseite nach content/Landingpage.md, Stand 9. November 2026 (Ticket #78). */
export const home: Record<Lang, HomeContent> = {
  de: {
    description:
      'KI Perspektiven ordnet künstliche Intelligenz verständlich ein: was sie kann, wo ihre Grenzen liegen und wie Unternehmen ihren KI-Reifegrad einschätzen.',
    hook: ['Jedes vierte Unternehmen in Deutschland nutzt bereits KI.', 1, ' Die spannende Frage ist: wofür – und wie gut?'],
    display1: 'KI verstehen.',
    display2: 'Sinnvoll einsetzen.',
    lead: 'Einordnungen und Erfahrungen für Unternehmen, die künstliche Intelligenz verantwortungsvoll nutzen wollen. Ohne Hype, mit Substanz.',
    ctaTopics: 'Themen entdecken',
    ctaAudit: 'KI-Reifegrad einschätzen',
    focusEyebrow: 'Aktuell im Fokus',
    focusTitle: 'Was KI gerade spannend macht.',
    focusText: 'Sechs Themen, die uns gerade beschäftigen. Jedes beginnt mit einer Frage, die sich lohnt. Die Auswahl wechselt.',
    topics: [
      {
        slug: 'ai-audit',
        title: 'AI Audit',
        hook: ['Acht Dimensionen. Drei Reifegrade. Wo steht Ihr Unternehmen?'],
        text: [
          'Von Strategie und Wirtschaftlichkeit bis Sicherheit: Beantworten Sie einfache Ja/Nein-Fragen und sehen Sie sofort, wo Ihr Unternehmen steht und wo blinde Flecken liegen. Die Fragen der nächsten Stufe werden zu Ihrer To-do-Liste.',
        ],
        link: 'Selbsteinschätzung starten',
      },
      {
        slug: 'prozessautomatisierung',
        title: 'Prozessautomatisierung',
        hook: ['Welche Aufgabe würden Sie nie wieder von Hand erledigen?'],
        text: [
          'Daten abtippen, Anfragen weiterleiten, Berichte zusammenstellen: n8n verbindet Ihre Anwendungen zu automatischen Abläufen. KI kommt nur dort dazu, wo sie messbar hilft. Und bevor ein KI-Agent eine Nachricht versendet oder Daten ändert, gibt ein Mensch die Aktion frei.',
        ],
        link: 'Humans in the Loop mit n8n',
      },
      {
        slug: 'softwareentwicklung',
        title: 'Softwareentwicklung',
        hook: ['Ein Verbot im Prompt verhindert noch keinen Zugriff.'],
        text: [
          'Dateien wie ',
          { code: 'AGENTS.md' },
          ' geben KI-Agenten Ziele, Arbeitsabläufe und Grenzen mit. Doch das Modell kann Regeln missverstehen oder übergehen. Verbindlich werden Grenzen erst durch passende Zugriffsrechte, Tests und Reviews. So leiten Sie KI-Assistenten mit Guardrails an.',
        ],
        link: 'KI-Assistenten mit Guardrails anleiten',
      },
      {
        slug: 'data-analytics',
        title: 'Data Analytics',
        hook: ['Was genau ist eigentlich „der Umsatz im letzten Monat“?'],
        text: [
          'Mit oder ohne Retouren? Welcher Monat, welches Buchungsdatum? KI beantwortet Datenfragen in Alltagssprache, schreibt Analysecode und erstellt Prognosen. Belastbar wird die Antwort aber erst, wenn Ihre Kennzahlen eindeutig definiert sind und Ergebnisse mit den Quelldaten abgeglichen werden.',
        ],
        link: 'Daten verstehen und auswerten',
      },
      {
        slug: 'ki-tipps-und-tricks',
        title: 'KI-Tipps und Tricks',
        hook: ['50,5 statt 33,9 Prozent.', 6],
        text: [
          'So viel mehr Aufgaben lösten KI-Agenten in einer Studie, wenn sie kuratierte Skills nutzen konnten. Skills halten wiederkehrende Arbeitsabläufe fest, etwa für eine Excel-Auswertung oder die systematische Fehlersuche. Aber nicht jeder Skill hilft: Kleine, fokussierte Skills schneiden besser ab als umfangreiche Sammlungen.',
        ],
        link: 'Skills, die Sie kennen sollten',
      },
      {
        slug: 'modelle-und-kosten',
        title: 'Modelle und Kosten',
        hook: ['4,50 oder 450 US-Dollar?', 7],
        text: [
          'So weit liegen die Kosten für dieselben 10.000 Textaufrufe je nach Modell auseinander. Trotzdem ist das günstigste Modell nicht automatisch die beste Wahl: Ein teureres Modell kann insgesamt weniger kosten, wenn es Korrekturarbeit spart. Entscheidend sind die Gesamtkosten je akzeptiertem Ergebnis.',
        ],
        link: 'Das beste Preis-Leistungs-Verhältnis finden',
      },
    ],
    basicsEyebrow: 'Grundlagen',
    basicsTitle: 'Was ist KI – und was kann man damit machen?',
    basicsText: [
      'KI-Systeme leiten aus ihren Eingaben selbst ab, wie sie ein Ergebnis erzeugen: eine Vorhersage, einen Text, eine Empfehlung oder eine Entscheidung.',
      2,
      ' Das unterscheidet sie von Software, die nur Regeln abarbeitet, die Menschen vorgegeben haben.',
      3,
    ],
    checkTitle: 'KI hilft dort, wo sich Ergebnisse prüfen lassen.',
    checkText: [
      [
        'Programmieren ist dafür ein gutes Beispiel. Ob ein Vorschlag der KI funktioniert, zeigen automatische Tests, Code-Reviews und Prüfungen, bevor der Code übernommen wird. Viele Fehler fallen so früh auf.',
      ],
      [
        'Prüfbar heißt aber nicht automatisch schneller. In einer randomisierten Studie brauchten erfahrene Entwicklerinnen und Entwickler mit KI-Werkzeugen aus dem Frühjahr 2025 sogar 19 Prozent länger.',
        4,
        ' Ob KI Ihnen Zeit spart, zeigt deshalb erst eine Messung in Ihrem eigenen Arbeitsablauf.',
      ],
    ],
    limitsTitle: 'Wer versteht, wie KI funktioniert, erkennt ihre Grenzen.',
    limitsText: [
      'KI-Assistenten wie Chatbots basieren auf großen Sprachmodellen. Ein solches Modell erzeugt Text, indem es anhand gelernter Wahrscheinlichkeiten vorhersagt, welches Wort als Nächstes folgen könnte.',
      5,
      ' Daraus ergeben sich typische Grenzen:',
    ],
    limits: [
      {
        title: 'Glaubwürdig heißt nicht richtig.',
        text: ['Ein Sprachmodell kann Inhalte erfinden, die überzeugend klingen, bis hin zu erfundenen Literaturangaben.', 5],
      },
      {
        title: 'Wissen hat ein Ablaufdatum.',
        text: ['Ohne Zugriff auf aktuelle Daten kennt ein Modell nur den Stand seiner Trainingsdaten.', 5],
      },
      {
        title: 'Nicht jede Aufgabe braucht ein Sprachmodell.',
        text: ['Für Prognosen gibt es spezialisierte Modelle. Abläufe mit festen Regeln lassen sich ganz ohne KI automatisieren.', 3],
      },
    ],
    moreText: 'Sie möchten wissen, wofür KI heute schon eingesetzt wird?',
    moreLink: 'Zur ausführlichen Einordnung',
    sourcesTitle: 'Quellen',
    sources: localizeSources(SOURCES, {
      1: '26 % der Unternehmen nutzten 2025 KI.',
      2: 'Definition eines KI-Systems.',
      3: 'Abgrenzung zu Software, die nur von Menschen vorgegebene Regeln ausführt.',
      4: 'Randomisierte Studie: 19 % längere Bearbeitungszeit mit KI-Werkzeugen aus dem Frühjahr 2025.',
      5: 'Funktionsweise von Sprachmodellen, Halluzinieren, Wissensstand.',
      6: 'Erfolgsquote ohne kuratierte Skills 33,9 %, mit kuratierten Skills 50,5 %; kleine, fokussierte Skills schneiden besser ab.',
      7: 'Preise von gpt-6-luna und gpt-6-astra, Stand 9. November 2026. Eigene Rechnung: 10.000 Aufrufe mit je 2.000 Eingabe- und 500 Ausgabetokens.',
    }),
  },
  en: {
    description:
      'KI Perspektiven explains artificial intelligence in plain terms: what it can do, where its limits are and how companies assess their AI maturity.',
    hook: ['One in four companies in Germany already uses AI.', 1, ' The exciting question is: for what – and how well?'],
    display1: 'Understand AI.',
    display2: 'Use it wisely.',
    lead: 'Perspectives and experience for companies that want to use artificial intelligence responsibly. No hype, just substance.',
    ctaTopics: 'Explore topics',
    ctaAudit: 'Assess your AI maturity',
    focusEyebrow: 'Currently in focus',
    focusTitle: 'What makes AI exciting right now.',
    focusText: 'Six topics we are currently working on. Each one starts with a question worth asking. The selection changes.',
    topics: [
      {
        slug: 'ai-audit',
        title: 'AI Audit',
        hook: ['Eight dimensions. Three maturity levels. Where does your company stand?'],
        text: [
          'From strategy and cost-effectiveness to security: answer simple yes/no questions and see straight away where your company stands and where its blind spots are. The questions of the next level become your to-do list.',
        ],
        link: 'Start self-assessment',
      },
      {
        slug: 'prozessautomatisierung',
        title: 'Process Automation',
        hook: ['Which task would you never want to do by hand again?'],
        text: [
          'Typing up data, forwarding requests, compiling reports: n8n connects your applications into automated workflows. AI is only added where it measurably helps. And before an AI agent sends a message or changes data, a person approves the action.',
        ],
        link: 'Humans in the loop with n8n',
      },
      {
        slug: 'softwareentwicklung',
        title: 'Software Development',
        hook: ['A ban in the prompt does not prevent access.'],
        text: [
          'Files such as ',
          { code: 'AGENTS.md' },
          ' give AI agents goals, workflows and boundaries. But the model can misunderstand or disregard rules. Boundaries only become binding through suitable access permissions, tests and reviews. This is how you guide AI assistants with guardrails.',
        ],
        link: 'Guide AI assistants with guardrails',
      },
      {
        slug: 'data-analytics',
        title: 'Data Analytics',
        hook: ['What exactly is “last month’s revenue”?'],
        text: [
          'Including or excluding returns? Which month, which booking date? AI answers data questions in everyday language, writes analysis code and produces forecasts. But the answer only becomes reliable once your metrics are clearly defined and results are checked against the source data.',
        ],
        link: 'Understand and analyse data',
      },
      {
        slug: 'ki-tipps-und-tricks',
        title: 'AI Tips and Tricks',
        hook: ['50.5 instead of 33.9 percent.', 6],
        text: [
          'That is how much more often AI agents solved tasks in a study when they could use curated skills. Skills capture recurring workflows, for example for an Excel analysis or systematic debugging. But not every skill helps: small, focused skills perform better than extensive collections.',
        ],
        link: 'Skills you should know',
      },
      {
        slug: 'modelle-und-kosten',
        title: 'Models and Costs',
        hook: ['4.50 or 450 US dollars?', 7],
        text: [
          'That is how far apart the costs of the same 10,000 text requests can be, depending on the model. Even so, the cheapest model is not automatically the best choice: a more expensive model can cost less overall if it saves correction work. What matters is the total cost per accepted result.',
        ],
        link: 'Find the best value for money',
      },
    ],
    basicsEyebrow: 'Basics',
    basicsTitle: 'What is AI – and what can you do with it?',
    basicsText: [
      'AI systems infer from their inputs how to generate an output: a prediction, a text, a recommendation or a decision.',
      2,
      ' That sets them apart from software that only follows rules defined by people.',
      3,
    ],
    checkTitle: 'AI helps where results can be checked.',
    checkText: [
      [
        'Programming is a good example. Automated tests, code reviews and checks show whether an AI suggestion works before the code is accepted. This way, many errors are caught early.',
      ],
      [
        'But checkable does not automatically mean faster. In a randomised study, experienced developers using AI tools from early 2025 actually took 19 percent longer.',
        4,
        ' That is why only a measurement in your own workflow shows whether AI saves you time.',
      ],
    ],
    limitsTitle: 'Understanding how AI works means recognising its limits.',
    limitsText: [
      'AI assistants such as chatbots are based on large language models. Such a model generates text by using learned probabilities to predict which word could come next.',
      5,
      ' This leads to typical limits:',
    ],
    limits: [
      {
        title: 'Plausible does not mean correct.',
        text: ['A language model can invent content that sounds convincing, right down to made-up references.', 5],
      },
      {
        title: 'Knowledge has an expiry date.',
        text: ['Without access to current data, a model only knows the state of its training data.', 5],
      },
      {
        title: 'Not every task needs a language model.',
        text: ['There are specialised models for forecasts. Processes with fixed rules can be automated without any AI at all.', 3],
      },
    ],
    moreText: 'Would you like to know what AI is already being used for today?',
    moreLink: 'Read the detailed overview',
    sourcesTitle: 'Sources',
    sources: localizeSources(
      SOURCES,
      {
        1: '26% of companies used AI in 2025.',
        2: 'Definition of an AI system.',
        3: 'Distinction from software that only executes rules defined by people.',
        4: 'Randomised study: 19% longer completion time with AI tools from early 2025.',
        5: 'How language models work, hallucinations, knowledge cut-off.',
        6: 'Success rate 33.9% without and 50.5% with curated skills; small, focused skills perform better.',
        7: 'Prices of gpt-6-luna and gpt-6-astra as of 9 November 2026. Own calculation: 10,000 requests with 2,000 input and 500 output tokens each.',
      },
      {
        1: { label: 'Federal Statistical Office of Germany (2025)', title: 'Enterprises using AI by size class (in German)' },
        3: { label: 'European Commission (2025)', title: 'Guidelines on the definition of an AI system (AI Act)' },
        5: { title: 'Generative AI models – opportunities and risks (in German)' },
      },
    ),
  },
};
