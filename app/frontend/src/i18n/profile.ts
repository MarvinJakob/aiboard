import type { Lang } from '../lib/lang';

interface ProfileContent {
  title: string;
  description: string;
  home: string;
  label: string;
  headline: string;
  headlineAccent: string;
  intro: string;
  focusLabel: string;
  tags: string[];
  discover: string;
  portraitAlt: string;
  caption: string;
  factsLabel: string;
  facts: { title: string; text: string }[];
  expertiseLabel: string;
  expertiseTitle: string;
  expertiseIntro: string;
  valueLabel: string;
  expertise: { label: string; title: string; text: string; value: string; link: string }[];
  approachLabel: string;
  approach: string;
  projectsLabel: string;
  projectsTitle: string;
  projectsIntro: string;
  projects: { period: string; title: string; role: string; text: string; tags: string[] }[];
  foundationLabel: string;
  foundationTitle: string;
  foundationText: string;
  credentials: { title: string; text: string }[];
  exploreTitle: string;
  blogLink: string;
}

// Texte und berufliche Angaben aus dem Profilentwurf mock/profil/index.html.
// Die Projekte beschreiben das berufliche Fundament, keine früheren KI-Projekte.
export const profile: Record<Lang, ProfileContent> = {
  de: {
    title: 'Marvin Jakob – Profil',
    description: 'Marvin Jakob: IT-Berater und Full-Stack-Entwickler. Mein Hintergrund und meine Fragen zu KI in Softwareentwicklung, Data Analytics und AI Audit.',
    home: 'Startseite',
    label: 'Die Person hinter der Perspektive',
    headline: 'Technologie verstehen.',
    headlineAccent: 'AI in die Praxis bringen.',
    intro: 'AI entfaltet ihren Wert dort, wo sie ein konkretes Problem löst. Marvin verbindet Softwareentwicklung, Cloud-Architektur und Business Analyse – mit einem klaren Blick dafür, was Unternehmen in der Praxis brauchen.',
    focusLabel: 'Schwerpunkte',
    tags: ['Applied AI', 'Software Engineering', 'Business Analyse'],
    discover: 'Meine Expertise entdecken',
    portraitAlt: 'Illustratives Porträt von Marvin Jakob vor einem farbigen Hintergrund',
    caption: 'Entwickler. Analytiker. Gestalter.',
    factsLabel: 'Erfahrung auf einen Blick',
    facts: [
      { title: 'Seit 2011', text: 'Projekterfahrung in der Softwareentwicklung' },
      { title: 'Technik & Fachlichkeit', text: 'Von der Anforderung bis zum Betrieb' },
      { title: 'Cloud & Daten', text: 'Architektur, Schnittstellen und Integration' },
    ],
    expertiseLabel: 'Warum Marvin für AI steht',
    expertiseTitle: 'AI braucht mehr als ein gutes Modell.',
    expertiseIntro: 'Marvins Perspektive auf angewandte AI beruht auf drei Stärken: Er versteht die Technologie, die Daten und die Abläufe dahinter. Diese Verbindung ist die Grundlage, um AI sinnvoll in Unternehmen einzusetzen.',
    valueLabel: 'Der Mehrwert für AI',
    expertise: [
      {
        label: '01 / Engineering', title: 'AI in bestehende Systeme integrieren.',
        text: 'Java, Spring Boot, Microservices und REST-APIs gehören zu Marvins Projekterfahrung. Er kennt die Arbeit an Schnittstellen, Cloud-Infrastrukturen und produktiven Anwendungen.',
        value: 'Eine technische Grundlage, um AI-Funktionen in nutzbare Software und bestehende Abläufe einzubinden.',
        link: 'Zur KI in der Softwareentwicklung',
      },
      {
        label: '02 / Business', title: 'Mit dem richtigen Problem beginnen.',
        text: 'Als Business Analyst und Projektleiter analysiert Marvin Anforderungen, modelliert Prozesse und stimmt Lösungen mit Fachbereichen ab. Der Ausgangspunkt ist der konkrete Bedarf.',
        value: 'Anwendungsfälle anhand ihres Nutzens und ihrer Umsetzbarkeit bewerten und verständlich beschreiben.',
        link: 'Zur AI-Audit-Übersicht',
      },
      {
        label: '03 / Data & Operations', title: 'Daten und Betrieb zusammendenken.',
        text: 'Telematik-Auswertung, Monitoring und der Betrieb einer Dispositionsplattform prägen Marvins Erfahrung. Dazu kommen Datenmodellierung, Testautomatisierung und Cloud-Migration.',
        value: 'Datenflüsse, Qualität und Betriebsanforderungen früh in die Planung einer AI-Anwendung einbeziehen.',
        link: 'Zur KI in Data Analytics',
      },
    ],
    approachLabel: 'Fachlicher Ansatz',
    approach: 'Der Maßstab für sinnvolle AI: ein klares Problem, geeignete Daten und eine Lösung, die im Arbeitsalltag funktioniert.',
    projectsLabel: 'Erfahrung, auf der das aufbaut',
    projectsTitle: 'Aus der Praxis.',
    projectsIntro: 'Ausgewählte Software- und Digitalisierungsprojekte aus Marvins Werdegang. Sie zeigen das fachliche und technische Fundament seiner Perspektive auf AI.',
    projects: [
      {
        period: '2023 – 2024', title: 'Eine Dispositionsplattform in die Cloud bringen',
        role: 'Luft- und Raumfahrt · IT Service Owner & Projektleiter',
        text: 'Betrieb, Weiterentwicklung und Cloud-Migration eines Personaldispositionssystems. Marvin koordinierte Provider und Projektarbeit und arbeitete am Aufbau stabiler Prozesse. Diese Erfahrung schärft den Blick für die Anforderungen an produktive Systeme.',
        tags: ['Azure', 'ITSM', 'Governance & IT-Sicherheit'],
      },
      {
        period: '2020 – 2022', title: 'Monitoring von der Konzeption bis zum Betrieb',
        role: 'Rechenzentren · Full Stack Entwickler & Technischer Lead',
        text: 'Planung und Implementierung von Monitoring-Systemen für Gebäudeautomatisierung und Energieaudit. Zu Marvins Aufgaben gehörten die Bewertung von Anforderungen, die Koordination internationaler Entwicklungsteams, REST-Services sowie Tests und Inbetriebnahme.',
        tags: ['Java & Spring Boot', 'Angular', 'SQL'],
      },
      {
        period: '2019 – 2020', title: 'Telematik-Daten nutzbar machen',
        role: 'Entsorgungslogistik · Softwarearchitekt, Entwickler & Product Owner',
        text: 'Konzeption und Entwicklung einer Microservice-Infrastruktur zur Auswertung und Darstellung von Telematik-Daten. Marvin verband Anforderungsanalyse und Priorisierung mit Softwarearchitektur, API-Entwicklung und Integration.',
        tags: ['Microservices', 'MongoDB & MSSQL', 'API-Integration'],
      },
    ],
    foundationLabel: 'Fachliches Fundament',
    foundationTitle: 'Technische Tiefe. Gemeinsames Verständnis.',
    foundationText: 'Marvin bringt Entwicklung und Fachbereiche zusammen. Seine Arbeit verbindet analytisches Denken mit Kommunikation, strukturierten Anforderungen und agiler Projektarbeit – damit aus einer Idee eine umsetzbare Lösung wird.',
    credentials: [
      { title: 'Studium', text: 'Softwaretechnik & Praktische Informatik · Duales Studium' },
      { title: 'Ausbildung', text: 'Fachinformatiker für Anwendungsentwicklung' },
      { title: 'Zertifizierung laut Lebenslauf', text: 'AWS Certified Cloud Practitioner' },
      { title: 'Arbeitsfelder', text: 'Business Analyse · Softwarearchitektur · Agiles Projektmanagement' },
    ],
    exploreTitle: 'Mehr Perspektiven auf AI.',
    blogLink: 'Zum Blog',
  },
  en: {
    title: 'Marvin Jakob – Profile',
    description: 'Marvin Jakob: IT consultant and full-stack developer. My background and questions about AI in software development, data analytics and AI audit.',
    home: 'Home',
    label: 'The person behind the perspective',
    headline: 'Understand technology.',
    headlineAccent: 'Put AI into practice.',
    intro: 'AI creates value when it solves a specific problem. Marvin combines software engineering, cloud architecture and business analysis – with a clear focus on what companies need in practice.',
    focusLabel: 'Focus areas',
    tags: ['Applied AI', 'Software Engineering', 'Business Analysis'],
    discover: 'Explore my expertise',
    portraitAlt: 'Illustrated portrait of Marvin Jakob against a colourful background',
    caption: 'Developer. Analyst. Creator.',
    factsLabel: 'Experience at a glance',
    facts: [
      { title: 'Since 2011', text: 'Project experience in software development' },
      { title: 'Technology & business', text: 'From requirements to operations' },
      { title: 'Cloud & data', text: 'Architecture, interfaces and integration' },
    ],
    expertiseLabel: 'What Marvin brings to AI',
    expertiseTitle: 'AI needs more than a good model.',
    expertiseIntro: 'Marvin’s perspective on applied AI rests on three strengths: understanding the technology, the data and the processes behind it. This combination is the foundation for using AI effectively in companies.',
    valueLabel: 'The value for AI',
    expertise: [
      {
        label: '01 / Engineering', title: 'Integrate AI into existing systems.',
        text: 'Java, Spring Boot, microservices and REST APIs are part of Marvin’s project experience. He is familiar with working on interfaces, cloud infrastructure and production applications.',
        value: 'A technical foundation for embedding AI features in usable software and existing workflows.',
        link: 'Explore AI in software development',
      },
      {
        label: '02 / Business', title: 'Start with the right problem.',
        text: 'As a business analyst and project manager, Marvin analyses requirements, models processes and aligns solutions with business teams. The starting point is a concrete need.',
        value: 'Assess use cases by their benefits and feasibility, and describe them clearly.',
        link: 'Explore the AI audit overview',
      },
      {
        label: '03 / Data & Operations', title: 'Consider data and operations together.',
        text: 'Telematics analysis, monitoring and operating a scheduling platform have shaped Marvin’s experience. Data modelling, test automation and cloud migration add to this background.',
        value: 'Include data flows, quality and operational requirements early when planning an AI application.',
        link: 'Explore AI in data analytics',
      },
    ],
    approachLabel: 'Professional approach',
    approach: 'The benchmark for useful AI: a clear problem, suitable data and a solution that works in everyday practice.',
    projectsLabel: 'The experience behind it',
    projectsTitle: 'From practice.',
    projectsIntro: 'Selected software and digitalisation projects from Marvin’s career. They show the business and technical foundations of his perspective on AI.',
    projects: [
      {
        period: '2023 – 2024', title: 'Moving a scheduling platform to the cloud',
        role: 'Aerospace · IT Service Owner & Project Manager',
        text: 'Operations, further development and cloud migration of a workforce scheduling system. Marvin coordinated providers and project work, and helped establish stable processes. This experience sharpens his understanding of the requirements of production systems.',
        tags: ['Azure', 'ITSM', 'Governance & IT Security'],
      },
      {
        period: '2020 – 2022', title: 'Monitoring from concept to operations',
        role: 'Data centres · Full Stack Developer & Technical Lead',
        text: 'Planning and implementing monitoring systems for building automation and energy audits. Marvin’s responsibilities included assessing requirements, coordinating international development teams, REST services, testing and commissioning.',
        tags: ['Java & Spring Boot', 'Angular', 'SQL'],
      },
      {
        period: '2019 – 2020', title: 'Making telematics data useful',
        role: 'Waste logistics · Software Architect, Developer & Product Owner',
        text: 'Designing and developing a microservice infrastructure for analysing and presenting telematics data. Marvin combined requirements analysis and prioritisation with software architecture, API development and integration.',
        tags: ['Microservices', 'MongoDB & MSSQL', 'API Integration'],
      },
    ],
    foundationLabel: 'Professional foundations',
    foundationTitle: 'Technical depth. Shared understanding.',
    foundationText: 'Marvin brings development and business teams together. His work combines analytical thinking with communication, structured requirements and agile project work – turning an idea into a solution that can be implemented.',
    credentials: [
      { title: 'Studies', text: 'Software Engineering & Applied Computer Science · Dual study programme' },
      { title: 'Vocational training', text: 'IT specialist in application development' },
      { title: 'Certification listed in CV', text: 'AWS Certified Cloud Practitioner' },
      { title: 'Areas of work', text: 'Business Analysis · Software Architecture · Agile Project Management' },
    ],
    exploreTitle: 'More perspectives on AI.',
    blogLink: 'Go to blog',
  },
};
