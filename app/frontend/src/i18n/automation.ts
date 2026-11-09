import type { Lang } from '../lib/lang';

/** Slug der Themenseite „Prozessautomatisierung“ (Ticket #77). */
export const AUTOMATION_TOPIC = 'prozessautomatisierung';

interface Benefit {
  title: string;
  text: string;
  /** Nummern der belegenden Quellen (Index + 1 in `sources`). */
  sources: number[];
}

interface Source {
  title: string;
  url: string;
}

interface AutomationContent {
  eyebrow: string;
  title: string;
  sub: string;
  benefits: Benefit[];
  note: string;
  sourcesTitle: string;
  sources: Source[];
}

// Alle Quellen wurden am 9. November 2026 abgerufen. Die Titel sind die Seitentitel der n8n-Dokumentation.
const SOURCES: Source[] = [
  { title: 'n8n – Key concept glossary', url: 'https://docs.n8n.io/key-concept-glossary.md' },
  { title: 'n8n – Build your first workflow', url: 'https://docs.n8n.io/build-your-first-workflow.md' },
  { title: 'n8n – Nodes', url: 'https://docs.n8n.io/integrations/' },
  { title: 'n8n – HTTP Request', url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/' },
  { title: 'n8n – Host n8n', url: 'https://docs.n8n.io/hosting/' },
  { title: 'n8n – Code node', url: 'https://docs.n8n.io/code/code-node/' },
  { title: 'n8n – Integrate AI', url: 'https://docs.n8n.io/build/integrate-ai.md' },
  { title: 'n8n – Human-in-the-loop for tools', url: 'https://docs.n8n.io/build/integrate-ai/ai-examples/human-in-the-loop-for-tools.md' },
  { title: 'n8n – Community license', url: 'https://docs.n8n.io/n8n-community-license/community-license.md' },
  { title: 'n8n – Workflow templates', url: 'https://n8n.io/workflows/' },
];

/** Vorteile von n8n auf der Themenseite „Prozessautomatisierung“, mit Quellen aus der Herstellerdokumentation. */
export const automation: Record<Lang, AutomationContent> = {
  de: {
    eyebrow: 'n8n',
    title: 'Was für n8n spricht',
    sub: 'Sechs Vorteile des Automatisierungswerkzeugs n8n, belegt mit der Dokumentation des Herstellers.',
    benefits: [
      {
        title: 'Abläufe visuell bauen',
        text: 'Workflows entstehen in einem visuellen Editor, in dem Bausteine, sogenannte Nodes, miteinander verbunden werden. Für einen ersten einfachen Workflow sind laut n8n keine Programmierkenntnisse nötig.',
        sources: [1, 2],
      },
      {
        title: 'Viele Anwendungen anbinden',
        text: 'n8n bringt Hunderte fertige Nodes für verbreitete Anwendungen mit. Fehlt einer, ruft der HTTP-Request-Node jede Anwendung mit REST-API direkt auf.',
        sources: [3, 4],
      },
      {
        title: 'Selbst betreiben, Daten kontrollieren',
        text: 'n8n läuft als n8n Cloud oder auf eigener Infrastruktur, vor Ort oder in einer privaten Cloud. Im Eigenbetrieb bestimmen Sie, wo n8n Ihre Daten verarbeitet; das hilft bei der DSGVO, ersetzt aber nicht die Prüfung jedes Datenflusses.',
        sources: [1, 5],
      },
      {
        title: 'Code, wenn nötig',
        text: 'Wo fertige Bausteine nicht reichen, führt der Code-Node eigenes JavaScript oder Python als Schritt im Workflow aus.',
        sources: [6],
      },
      {
        title: 'KI-Modelle und Agenten einbinden',
        text: 'Workflows können Sprachmodelle verschiedener Anbieter nutzen und KI-Agenten mit Werkzeugen ausstatten. Bevor ein Agent ein bestimmtes Werkzeug ausführt, kann n8n die Freigabe durch einen Menschen verlangen.',
        sources: [7, 8],
      },
      {
        title: 'Offener Quellcode und Community',
        text: 'n8n stellt seinen Quellcode nach dem Fair-Code-Modell bereit; die Lizenz schränkt die Nutzung ein und ist keine Open-Source-Lizenz im engeren Sinn. Die Community teilt eigene Nodes und Tausende Workflow-Vorlagen.',
        sources: [9, 1, 10],
      },
    ],
    note: 'Die Angaben stammen aus der Dokumentation von n8n, abgerufen am 9. November 2026. Sie beschreiben Funktionen, keinen garantierten Nutzen. Ob eine Automatisierung Zeit spart, zeigt erst der konkrete Prozess.',
    sourcesTitle: 'Quellen zu n8n',
    sources: SOURCES,
  },
  en: {
    eyebrow: 'n8n',
    title: 'Why n8n',
    sub: 'Six advantages of the automation tool n8n, backed by the vendor’s documentation.',
    benefits: [
      {
        title: 'Build workflows visually',
        text: 'Workflows are built in a visual editor by connecting building blocks called nodes. According to n8n, a first simple workflow needs no coding experience.',
        sources: [1, 2],
      },
      {
        title: 'Connect many applications',
        text: 'n8n ships with hundreds of ready-made nodes for common applications. If one is missing, the HTTP Request node calls any application with a REST API directly.',
        sources: [3, 4],
      },
      {
        title: 'Self-host and control your data',
        text: 'n8n runs as n8n Cloud or on your own infrastructure, on-premises or in a private cloud. When self-hosting, you decide where n8n processes your data, which helps with the GDPR but does not replace reviewing every data flow.',
        sources: [1, 5],
      },
      {
        title: 'Code when you need it',
        text: 'Where ready-made nodes are not enough, the Code node runs your own JavaScript or Python as a step in the workflow.',
        sources: [6],
      },
      {
        title: 'Use AI models and agents',
        text: 'Workflows can use language models from different providers and equip AI agents with tools. Before an agent runs a specific tool, n8n can require approval by a human.',
        sources: [7, 8],
      },
      {
        title: 'Available source code and community',
        text: 'n8n makes its source code available under the fair-code model; the licence restricts use and is not an open-source licence in the strict sense. The community shares its own nodes and thousands of workflow templates.',
        sources: [9, 1, 10],
      },
    ],
    note: 'The information comes from the n8n documentation, retrieved on 9 November 2026. It describes features, not guaranteed benefits. Whether an automation saves time only shows in the actual process.',
    sourcesTitle: 'Sources on n8n',
    sources: SOURCES,
  },
};
