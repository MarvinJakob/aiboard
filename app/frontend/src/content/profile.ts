import type { Lang } from '../lib/lang';

interface ProfileContent {
  title: string;
  description: string;
  label: string;
  intro: string;
  experienceTitle: string;
  experience: { title: string; text: string }[];
  topicsTitle: string;
  topicsIntro: string;
  topics: { slug: string; title: string; text: string; link: string }[];
}

// Berufliche Angaben: ausgewählte Stationen aus dem lokalen Lebenslauf.
// Die KI-Fragen beschreiben heutige Interessen, keine damaligen KI-Projekte.
export const profile: Record<Lang, ProfileContent> = {
  de: {
    title: 'Marvin Jakob – Profil',
    description: 'Marvin Jakob: IT-Berater und Full-Stack-Entwickler. Mein Hintergrund und meine Fragen zu KI in Softwareentwicklung, Data Analytics und AI Audit.',
    label: 'Profil · IT-Berater & Full-Stack-Entwickler',
    intro: 'Ich bin Marvin Jakob. Als IT-Berater und Full-Stack-Entwickler beschäftige ich mich damit, wie aus fachlichen Anforderungen verlässliche Software wird. Bei KI interessieren mich dieselben Fragen: Welches Problem lösen wir damit? Wie prüfen wir die Ergebnisse? Und was braucht es, damit eine Lösung im Alltag funktioniert?',
    experienceTitle: 'Was meine Perspektive prägt',
    experience: [
      {
        title: 'Personaldisposition: Weiterentwicklung, Betrieb und Cloud-Migration',
        text: '2023 bis 2024 war ich in der Luft- und Raumfahrt als IT Service Owner und Projektleiter an einem Personaldispositionssystem tätig. Zu meinen Aufgaben gehörten die Weiterentwicklung und der Betrieb, die Cloud-Migration sowie der Aufbau stabiler Prozesse. Diese Erfahrung prägt meinen Blick auf KI: Neben der technischen Lösung zählen für mich klare Verantwortlichkeiten, ein verlässlicher Betrieb und der Nutzen für die Menschen, die damit arbeiten.',
      },
      {
        title: 'Telematik: Softwarearchitektur und APIs',
        text: '2019 bis 2020 arbeitete ich in der Entsorgungslogistik als Full-Stack-Entwickler, Softwarearchitekt und Product Owner an einer Microservice-Infrastruktur zur Auswertung und Darstellung von Telematik-Daten. Ich konzipierte und entwickelte Softwarearchitektur, entwickelte und integrierte APIs und arbeitete an Java-/Spring-Boot-Anwendungen. Daher schaue ich auch bei KI genau auf Schnittstellen, Datenflüsse und die Frage, wie sich ein Baustein sinnvoll in ein Gesamtsystem einfügt.',
      },
    ],
    topicsTitle: 'Meine Fragen zu KI',
    topicsIntro: 'Auf KI Perspektiven knüpfe ich an diese Projekterfahrungen an. Heute beschäftigen mich vor allem drei Themen:',
    topics: [
      { slug: 'softwareentwicklung', title: 'KI in der Softwareentwicklung', text: 'Wie können Teams KI beim Entwickeln einsetzen und dabei Codequalität und Wartbarkeit prüfen? Mich interessiert, wie sich KI-generierter Code nachvollziehbar testen, verstehen und in bestehende Software integrieren lässt.', link: 'Zur KI in der Softwareentwicklung' },
      { slug: 'data-analytics', title: 'KI in Data Analytics', text: 'Wie werden aus Daten belastbare Antworten auf fachliche Fragen? Ich beschäftige mich damit, wie Datenqualität und die Prüfung von KI-Auswertungen zusammenwirken, damit Ergebnisse als Grundlage für Entscheidungen taugen.', link: 'Zur KI in Data Analytics' },
      { slug: 'ai-audit', title: 'AI Audit', text: 'Wie erkennt ein Unternehmen, ob es für einen konkreten KI-Einsatz vorbereitet ist? Mich interessiert, wie sich Daten, Kompetenzen, Verantwortlichkeiten und Betrieb gemeinsam bewerten lassen, um sinnvolle nächste Schritte abzuleiten.', link: 'Zur AI-Audit-Übersicht' },
    ],
  },
  en: {
    title: 'Marvin Jakob – Profile',
    description: 'Marvin Jakob: IT consultant and full-stack developer. My background and questions about AI in software development, data analytics and AI audit.',
    label: 'Profile · IT consultant & full-stack developer',
    intro: 'I am Marvin Jakob. As an IT consultant and full-stack developer, I work on turning business requirements into reliable software. AI raises the same questions for me: What problem are we solving? How do we check the results? And what does it take for a solution to work in everyday use?',
    experienceTitle: 'What shapes my perspective',
    experience: [
      {
        title: 'Workforce scheduling: development, operations and cloud migration',
        text: 'From 2023 to 2024, I worked on a workforce scheduling system in the aerospace industry as an IT Service Owner and project manager. My responsibilities included further development and operations, cloud migration and establishing stable processes. This experience shapes how I look at AI: alongside the technical solution, I value clear responsibilities, reliable operations and benefits for the people who use it.',
      },
      {
        title: 'Telematics: software architecture and APIs',
        text: 'From 2019 to 2020, I worked in waste logistics as a full-stack developer, software architect and Product Owner on a microservice infrastructure for analysing and presenting telematics data. I designed and developed software architecture, developed and integrated APIs, and worked on Java and Spring Boot applications. This is why I also look closely at interfaces, data flows and how an AI component fits into a wider system.',
      },
    ],
    topicsTitle: 'My questions about AI',
    topicsIntro: 'On KI Perspektiven, I build on these project experiences. Today, I am particularly interested in three topics:',
    topics: [
      { slug: 'softwareentwicklung', title: 'AI in software development', text: 'How can teams use AI in development while checking code quality and maintainability? I am interested in how AI-generated code can be tested transparently, understood and integrated into existing software.', link: 'Explore AI in software development' },
      { slug: 'data-analytics', title: 'AI in data analytics', text: 'How can data provide reliable answers to business questions? I explore how data quality and the validation of AI analyses work together to make results useful for decision-making.', link: 'Explore AI in data analytics' },
      { slug: 'ai-audit', title: 'AI audit', text: 'How can a company assess whether it is ready for a specific use of AI? I am interested in evaluating data, skills, responsibilities and operations together to identify useful next steps.', link: 'Explore the AI audit overview' },
    ],
  },
};
