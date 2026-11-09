import type { Lang } from '../lib/lang';
import { localizeSources, type Source } from './sources';

interface AiUsesContent {
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  backLink: string;
  factsTitle: string;
  facts: { value: number; text: string; source: number }[];
  factsCaption: string;
  factsSources: string;
  tasksEyebrow: string;
  tasksTitle: string;
  tasksText: string;
  definition: string;
  definitionSource: string;
  tasksLabel: string;
  taskOf: string;
  example: string;
  tasks: { name: string; what: string; example: string; source: number }[];
  sourcesTitle: string;
  sources: Source[];
}

// Quellen und Belege: research/2026-11-09 Was ist KI und was man damit machen kann.md.
// Bis Ticket #78 standen Kennzahlen und Aufgaben auf der Startseite; die Nummern sind unverändert.
const SOURCES: Omit<Source, 'note'>[] = [
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
    title: 'KI-unterstützte Mammografie',
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
];

/** Ausführliche Einordnung zu KI-Einsatzfeldern, verlinkt aus den Grundlagen der Startseite (Ticket #78). */
export const aiUses: Record<Lang, AiUsesContent> = {
  de: {
    title: 'Wofür KI heute eingesetzt wird',
    description: 'Sieben typische Aufgaben von KI mit belegten Beispielen und Zahlen zur KI-Nutzung in Deutschland.',
    eyebrow: 'Einordnung',
    lead: 'Wie verbreitet KI in Deutschland ist und welche sieben Aufgaben KI-Systeme typischerweise übernehmen – jeweils mit einem dokumentierten Beispiel.',
    backLink: 'Zur Startseite',
    factsTitle: 'KI in Deutschland in Zahlen',
    facts: [
      { value: 26, text: 'der Unternehmen in Deutschland nutzten 2025 KI.', source: 3 },
      { value: 57, text: 'sind es bei Unternehmen mit mehr als 250 Beschäftigten.', source: 3 },
      { value: 32.3, text: 'der 16- bis 74-Jährigen nutzten generative KI.', source: 4 },
    ],
    factsCaption: 'KI in Deutschland, Berichtsjahr 2025',
    factsSources: 'Quellen: Destatis, Eurostat',
    tasksEyebrow: 'Einsatzfelder',
    tasksTitle: 'Sieben typische Aufgaben von KI',
    tasksText:
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
    sourcesTitle: 'Quellen',
    sources: localizeSources(SOURCES, {
      1: 'Definition, sieben Aufgaben, Personalisieren.',
      2: 'Abgrenzung zu regelbasierter Software, Betrugserkennung, Expertensysteme.',
      3: '26 % und 57 %.',
      4: '32,3 % nutzen generative KI.',
    }),
  },
  en: {
    title: 'What AI is used for today',
    description: 'Seven typical tasks of AI with documented examples and figures on AI use in Germany.',
    eyebrow: 'Overview',
    lead: 'How widespread AI is in Germany and which seven tasks AI systems typically take on – each with a documented example.',
    backLink: 'Back to home page',
    factsTitle: 'AI in Germany in figures',
    facts: [
      { value: 26, text: 'of companies in Germany used AI in 2025.', source: 3 },
      { value: 57, text: 'among companies with more than 250 employees.', source: 3 },
      { value: 32.3, text: 'of people aged 16 to 74 used generative AI.', source: 4 },
    ],
    factsCaption: 'AI in Germany, reference year 2025',
    factsSources: 'Sources: Destatis, Eurostat',
    tasksEyebrow: 'Fields of use',
    tasksTitle: 'Seven typical tasks of AI',
    tasksText:
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
    sourcesTitle: 'Sources',
    sources: localizeSources(
      SOURCES,
      {
        1: 'Definition, seven tasks, personalisation.',
        2: 'Distinction from rule-based software, fraud detection, expert systems.',
        3: '26% and 57%.',
        4: '32.3% use generative AI.',
      },
      {
        2: { label: 'European Commission (2025)', title: 'Guidelines on the definition of an AI system (AI Act)' },
        3: { label: 'Federal Statistical Office of Germany (2025)', title: 'Enterprises using AI by size class (in German)' },
        5: { label: 'MASAI study (2025), The Lancet Digital Health', title: 'AI-supported mammography' },
      },
    ),
  },
};
