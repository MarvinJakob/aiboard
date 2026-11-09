import type { Lang } from '../lib/lang';

/** Eine Quelle aus der Liste am Ende der Startseite. Die Nummer ist der Index + 1. */
interface Source {
  label: string;
  title: string;
  url: string;
  note?: string;
}

interface HomeContent {
  description: string;
  eyebrow: string;
  display1: string;
  display2: string;
  lead: string;
  ctaAudit: string;
  ctaWhat: string;
  lensLabel: string;
  lensCore: string;
  lensNote: string;
  lensTopic: string;
  lens: Record<string, { line1: string; line2: string }>;
  source: string;
  factsTitle: string;
  facts: { value: number; text: string; source: number }[];
  factsCaption: string;
  factsSources: string;
  whatEyebrow: string;
  whatTitle: string;
  whatText: string;
  definition: string;
  definitionSource: string;
  tasksLabel: string;
  taskOf: string;
  example: string;
  tasks: { name: string; what: string; example: string; source: number }[];
  limitsLabel: string;
  limits: { title: string; text: string; sources: number[] }[];
  topicsEyebrow: string;
  topicsTitle: string;
  topicsText: string;
  auditEyebrow: string;
  auditTitle: string;
  auditText: string;
  dimensionsLabel: string;
  auditNote: string;
  auditCta: string;
  auditCtaFor: string;
  blogEyebrow: string;
  blogTitle: string;
  personEyebrow: string;
  personQuote: string;
  personText: string;
  personLink: string;
  portraitAlt: string;
  sourcesTitle: string;
  sources: Source[];
}

// Quellen und Belege: research/2026-11-09 Was ist KI und was man damit machen kann.md.
// Reihenfolge der Quellen wie im Landing-Page-Entwurf mock/landing/index.html, die Nummern verweisen darauf.
const SOURCES: Omit<Source, 'note'>[] = [
  {
    label: 'OECD (2024)',
    title: 'Explanatory memorandum on the updated OECD definition of an AI system',
    url: 'https://www.oecd.org/en/publications/explanatory-memorandum-on-the-updated-oecd-definition-of-an-ai-system_623da898-en.html',
  },
  {
    label: 'Europäische Kommission (2025)',
    title: 'Guidelines on the definition of an artificial intelligence system (AI Act)',
    url: 'https://ai-act-service-desk.ec.europa.eu/sites/default/files/2025-08/commission_guidelines_on_the_definition_of_an_artificial_intelligence_system_established_by_regulation_eu_20241689_ai_actenglish_nf2skcqfrtjdfggjavcodopcwz4_112455.PDF',
  },
  {
    label: 'Statistisches Bundesamt (2025)',
    title: 'Unternehmen mit Nutzung von KI nach Beschäftigtengrößenklassen',
    url: 'https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/IKT-in-Unternehmen-IKT-Branche/Tabellen/ikti-unternehmen-kuenstliche-intelligenz.html',
  },
  {
    label: 'Eurostat (2026)',
    title: 'The use of AI technologies in the European Union',
    url: 'https://ec.europa.eu/eurostat/documents/7870049/23260410/KS-01-26-009-EN-N.pdf/37d063cb-28cf-3b4e-91f3-c3784c970842',
  },
  {
    label: 'MASAI-Studie (2025), The Lancet Digital Health',
    title: 'AI-supported mammography screening',
    url: 'https://doi.org/10.1016/S2589-7500%2824%2900267-X',
  },
  {
    label: 'ECMWF (2025)',
    title: 'ECMWF’s ensemble AI forecasts become operational',
    url: 'https://www.ecmwf.int/en/about/media-centre/news/2025/ecmwfs-ensemble-ai-forecasts-become-operational',
  },
  {
    label: 'Brynjolfsson, Li, Raymond (2025), QJE',
    title: 'Generative AI at Work',
    url: 'https://doi.org/10.1093/qje/qjae044',
  },
  {
    label: 'Degrave et al. (2022), Nature',
    title: 'Magnetic control of tokamak plasmas through deep reinforcement learning',
    url: 'https://www.nature.com/articles/s41586-021-04301-9',
  },
  {
    label: 'BSI (2025)',
    title: 'Generative KI-Modelle – Chancen und Risiken',
    url: 'https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/KI/Generative_KI-Modelle.pdf?__blob=publicationFile&v=5',
  },
  {
    label: 'Bastani et al. (2025), PNAS',
    title: 'Generative AI without guardrails can harm learning',
    url: 'https://doi.org/10.1073/pnas.2422633122',
  },
];

/** Quellen einer Sprache: Hinweise und übersetzte Angaben je Quellennummer. */
const sources = (notes: Record<number, string>, local: Record<number, Partial<Source>>): Source[] =>
  SOURCES.map((s, i) => ({ ...s, ...local[i + 1], note: notes[i + 1] }));

/** Texte der Startseite nach mock/landing/index.html (Ticket #73). */
export const home: Record<Lang, HomeContent> = {
  de: {
    description:
      'KI Perspektiven ordnet künstliche Intelligenz verständlich ein: was sie kann, wo ihre Grenzen liegen und wie Unternehmen ihren KI-Reifegrad einschätzen.',
    eyebrow: 'Wissen und Praxis rund um KI',
    display1: 'KI verstehen.',
    display2: 'Sinnvoll einsetzen.',
    lead: 'Einordnungen, Erfahrungen und ein KI-Audit für Teams, die künstliche Intelligenz verantwortungsvoll nutzen wollen – ohne Hype, mit Quellen.',
    ctaAudit: 'KI-Reifegrad einschätzen',
    ctaWhat: 'Was ist KI eigentlich?',
    lensLabel: 'Drei Perspektiven auf KI',
    lensCore: 'KI',
    lensNote: 'Drei Perspektiven – ein Thema antippen',
    lensTopic: 'Thema: {{title}}',
    lens: {
      softwareentwicklung: { line1: 'Software-', line2: 'entwicklung' },
      'ai-audit': { line1: 'AI Audit', line2: 'für Unternehmen' },
      'data-analytics': { line1: 'Data', line2: 'Analytics' },
    },
    source: 'Quelle {{n}}',
    factsTitle: 'KI in Deutschland in Zahlen',
    facts: [
      { value: 26, text: 'der Unternehmen in Deutschland nutzten 2025 KI.', source: 3 },
      { value: 57, text: 'sind es bei Unternehmen mit mehr als 250 Beschäftigten.', source: 3 },
      { value: 32.3, text: 'der 16- bis 74-Jährigen nutzten generative KI.', source: 4 },
    ],
    factsCaption: 'KI in Deutschland, Berichtsjahr 2025',
    factsSources: 'Quellen: Destatis, Eurostat',
    whatEyebrow: 'Grundlagen',
    whatTitle: 'Was ist KI – und was kann man damit machen?',
    whatText:
      'KI-Systeme leiten aus ihren Eingaben selbst ab, wie sie ein Ergebnis erzeugen. Das unterscheidet sie von Software, die nur von Menschen vorgegebene Regeln abarbeitet.',
    definition:
      'Ein KI-System erzeugt aus Eingaben Vorhersagen, Inhalte, Empfehlungen oder Entscheidungen, die physische oder virtuelle Umgebungen beeinflussen können.',
    definitionSource: 'Sinngemäß nach der OECD-Definition von 2023',
    tasksLabel: 'Sieben typische Aufgaben von KI',
    taskOf: 'Aufgabe {{i}} von {{n}}',
    example: 'Beispiel',
    tasks: [
      {
        name: 'Erkennen',
        what: 'Bilder, Videos, Ton oder Texte einordnen und Objekte darin finden.',
        example: 'In der schwedischen MASAI-Studie wurden bei KI-unterstützter Mammografie 6,4 statt 5,0 Krebsfälle je 1.000 Untersuchungen entdeckt.',
        source: 5,
      },
      { name: 'Auffälligkeiten entdecken', what: 'Muster und Ausreißer in großen Datenmengen finden.', example: 'Betrugserkennung in Transaktionsdaten.', source: 2 },
      {
        name: 'Vorhersagen',
        what: 'Aus bisherigem Verhalten künftige Entwicklungen ableiten.',
        example: 'Das Europäische Zentrum für mittelfristige Wettervorhersage betreibt seit 2025 Ensemble-Vorhersagen mit einem KI-Modell.',
        source: 6,
      },
      {
        name: 'Personalisieren',
        what: 'Ein Profil einer Person erstellen und Ausgaben daran anpassen.',
        example: 'Empfehlungssysteme, die die Vorlieben einzelner Nutzerinnen und Nutzer nach und nach eingrenzen.',
        source: 1,
      },
      {
        name: 'Interaktion unterstützen',
        what: 'Sprache und andere Inhalte verstehen und erzeugen, etwa im Gespräch zwischen Mensch und Maschine.',
        example: 'Mit einem KI-Assistenten lösten Supportbeschäftigte im Durchschnitt 15 Prozent mehr Anliegen pro Stunde.',
        source: 7,
      },
      {
        name: 'Zielgerichtet optimieren',
        what: 'Die beste Lösung für ein vorgegebenes Ziel suchen.',
        example: 'Ein mit Reinforcement Learning trainiertes System regelte das Plasma im Fusionsreaktor TCV.',
        source: 8,
      },
      {
        name: 'Mit Wissen schlussfolgern',
        what: 'Neue Ergebnisse ableiten, die so nicht in den Daten stehen – etwa durch Modellierung und Simulation.',
        example: 'Expertensysteme, die aus Symptomen auf eine Diagnose schließen.',
        source: 2,
      },
    ],
    limitsLabel: 'Was KI nicht garantiert',
    limits: [
      { title: 'Keine richtigen Ergebnisse garantiert', text: 'Sprachmodelle können Inhalte erfinden, die glaubwürdig wirken – auch Literaturangaben.', sources: [9] },
      { title: 'Kein aktuelles Wissen', text: 'Ohne Anbindung an aktuelle Daten kennt ein Modell nur den Stand seiner Trainingsdaten.', sources: [9] },
      { title: 'Kein gewünschtes Verhalten', text: 'Ziele lassen sich schwer vollständig festlegen. Der Nutzen hängt von der Gestaltung des Einsatzes ab.', sources: [1, 10] },
    ],
    topicsEyebrow: 'Themen',
    topicsTitle: 'Drei Schwerpunkte als Einstieg.',
    topicsText: 'Jedes Thema hat eine Einführung und passende Beiträge.',
    auditEyebrow: 'KI-Audit',
    auditTitle: 'Wie bereit ist Ihr Unternehmen für KI?',
    auditText:
      'Acht Dimensionen, drei Reifegrade. Ein Reifegrad gilt nur, wenn alle darunterliegenden erfüllt sind. Die Fragen der nächsten Stufe werden zu Ihrer To-do-Liste.',
    dimensionsLabel: 'Dimension auswählen',
    auditNote: 'Ja/Nein-Fragen je Dimension · Ihre Antworten bleiben im Browser und werden nicht übertragen.',
    auditCta: 'Selbsteinschätzung starten',
    auditCtaFor: 'Selbsteinschätzung: {{title}}',
    blogEyebrow: 'Blog',
    blogTitle: 'Neu im Blog.',
    personEyebrow: 'Hinter KI Perspektiven',
    personQuote: '„Der Maßstab für sinnvolle KI: ein klares Problem, geeignete Daten und eine Lösung, die im Arbeitsalltag funktioniert.“',
    personText: 'Marvin Jakob verbindet Softwareentwicklung, Cloud-Architektur und Business Analyse – seit 2011 in Software-Projekten.',
    personLink: 'Zum Profil',
    portraitAlt: 'Illustratives Porträt von Marvin Jakob',
    sourcesTitle: 'Quellen',
    sources: sources(
      {
        1: 'Definition, sieben Aufgaben, Personalisieren, Zielfestlegung.',
        2: 'Abgrenzung zu regelbasierter Software, Betrugserkennung, Expertensysteme.',
        3: '26 % und 57 %.',
        4: '32,3 % nutzen generative KI.',
        9: 'Halluzinieren, Wissensstand.',
      },
      {
        2: { title: 'Leitlinien zur Definition eines KI-Systems (AI Act)' },
        5: { title: 'KI-unterstützte Mammografie' },
      },
    ),
  },
  en: {
    description:
      'KI Perspektiven explains artificial intelligence in plain terms: what it can do, where its limits are and how companies assess their AI maturity.',
    eyebrow: 'Knowledge and practice around AI',
    display1: 'Understand AI.',
    display2: 'Use it wisely.',
    lead: 'Perspectives, experiences and an AI audit for teams who want to use artificial intelligence responsibly – no hype, with sources.',
    ctaAudit: 'Assess your AI maturity',
    ctaWhat: 'What is AI, actually?',
    lensLabel: 'Three perspectives on AI',
    lensCore: 'AI',
    lensNote: 'Three perspectives – tap a topic',
    lensTopic: 'Topic: {{title}}',
    lens: {
      softwareentwicklung: { line1: 'Software', line2: 'development' },
      'ai-audit': { line1: 'AI Audit', line2: 'for companies' },
      'data-analytics': { line1: 'Data', line2: 'Analytics' },
    },
    source: 'Source {{n}}',
    factsTitle: 'AI in Germany in figures',
    facts: [
      { value: 26, text: 'of companies in Germany used AI in 2025.', source: 3 },
      { value: 57, text: 'among companies with more than 250 employees.', source: 3 },
      { value: 32.3, text: 'of people aged 16 to 74 used generative AI.', source: 4 },
    ],
    factsCaption: 'AI in Germany, reference year 2025',
    factsSources: 'Sources: Destatis, Eurostat',
    whatEyebrow: 'Basics',
    whatTitle: 'What is AI – and what can you do with it?',
    whatText:
      'AI systems infer from their inputs how to generate an output. That sets them apart from software that only follows rules defined by people.',
    definition:
      'An AI system generates outputs such as predictions, content, recommendations or decisions from the input it receives, which can influence physical or virtual environments.',
    definitionSource: 'Paraphrased from the 2023 OECD definition',
    tasksLabel: 'Seven typical tasks of AI',
    taskOf: 'Task {{i}} of {{n}}',
    example: 'Example',
    tasks: [
      {
        name: 'Recognise',
        what: 'Classify images, video, audio or text and find objects in them.',
        example: 'In the Swedish MASAI study, AI-supported mammography detected 6.4 instead of 5.0 cancers per 1,000 screenings.',
        source: 5,
      },
      { name: 'Detect anomalies', what: 'Find patterns and outliers in large amounts of data.', example: 'Fraud detection in transaction data.', source: 2 },
      {
        name: 'Predict',
        what: 'Derive future developments from past behaviour.',
        example: 'Since 2025, the European Centre for Medium-Range Weather Forecasts has been running ensemble forecasts with an AI model.',
        source: 6,
      },
      {
        name: 'Personalise',
        what: 'Build a profile of a person and adapt outputs to it.',
        example: 'Recommender systems that gradually narrow down the preferences of individual users.',
        source: 1,
      },
      {
        name: 'Support interaction',
        what: 'Understand and generate language and other content, for example in conversations between people and machines.',
        example: 'With an AI assistant, support agents resolved 15 percent more issues per hour on average.',
        source: 7,
      },
      {
        name: 'Optimise for a goal',
        what: 'Search for the best solution for a given goal.',
        example: 'A system trained with reinforcement learning controlled the plasma in the TCV fusion reactor.',
        source: 8,
      },
      {
        name: 'Reason with knowledge',
        what: 'Derive new results that are not directly in the data – for example through modelling and simulation.',
        example: 'Expert systems that infer a diagnosis from symptoms.',
        source: 2,
      },
    ],
    limitsLabel: 'What AI does not guarantee',
    limits: [
      { title: 'No guarantee of correct results', text: 'Language models can invent content that looks credible – including references.', sources: [9] },
      { title: 'No up-to-date knowledge', text: 'Without access to current data, a model only knows the state of its training data.', sources: [9] },
      { title: 'No guaranteed intended behaviour', text: 'Goals are hard to specify completely. The benefit depends on how the use case is designed.', sources: [1, 10] },
    ],
    topicsEyebrow: 'Topics',
    topicsTitle: 'Three focus areas to get started.',
    topicsText: 'Each topic has an introduction and related articles.',
    auditEyebrow: 'AI audit',
    auditTitle: 'How ready is your company for AI?',
    auditText:
      'Eight dimensions, three maturity levels. A level only counts if all levels below it are met. The questions of the next level become your to-do list.',
    dimensionsLabel: 'Choose a dimension',
    auditNote: 'Yes/no questions per dimension · Your answers stay in your browser and are not transmitted.',
    auditCta: 'Start self-assessment',
    auditCtaFor: 'Self-assessment: {{title}}',
    blogEyebrow: 'Blog',
    blogTitle: 'New on the blog.',
    personEyebrow: 'Behind KI Perspektiven',
    personQuote: '“The yardstick for meaningful AI: a clear problem, suitable data and a solution that works in everyday work.”',
    personText: 'Marvin Jakob combines software development, cloud architecture and business analysis – working on software projects since 2011.',
    personLink: 'View profile',
    portraitAlt: 'Illustrative portrait of Marvin Jakob',
    sourcesTitle: 'Sources',
    sources: sources(
      {
        1: 'Definition, seven tasks, personalisation, setting objectives.',
        2: 'Distinction from rule-based software, fraud detection, expert systems.',
        3: '26% and 57%.',
        4: '32.3% use generative AI.',
        9: 'Hallucinations, knowledge cut-off.',
      },
      {
        2: { label: 'European Commission (2025)', title: 'Guidelines on the definition of an AI system (AI Act)' },
        5: { label: 'MASAI study (2025), The Lancet Digital Health', title: 'AI-supported mammography' },
        3: { label: 'Federal Statistical Office of Germany (2025)', title: 'Enterprises using AI by size class (in German)' },
        9: { label: 'BSI (2025)', title: 'Generative AI models – opportunities and risks (in German)' },
      },
    ),
  },
};

/** Ersetzt {{name}} durch den passenden Wert. */
export const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(vars[k] ?? ''));
