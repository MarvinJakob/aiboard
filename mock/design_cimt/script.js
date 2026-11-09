'use strict';

const topics = {
  software: {
    label: 'Softwareentwicklung',
    title: 'KI schreibt mit. Ihr Team entscheidet.',
    description: 'Code-Assistenten können Entwürfe, Tests und Dokumentation unterstützen. Entscheidend bleiben klare Anforderungen, nachvollziehbare Änderungen und ein sorgfältiges Review durch das Team.',
  },
  data: {
    label: 'Data & Analytics',
    title: 'Aus Daten wird erst mit Kontext eine Erkenntnis.',
    description: 'KI kann bei der Erkundung, Aufbereitung und Interpretation von Daten unterstützen. Die Grundlage sind verlässliche Daten, eindeutige Kennzahlen und Menschen, die Ergebnisse fachlich prüfen.',
  },
  automation: {
    label: 'Prozessautomatisierung',
    title: 'Nicht nur schneller. Sondern nachvollziehbar.',
    description: 'Regeln, Schnittstellen und KI können in einem Workflow zusammenspielen. Klare Zuständigkeiten, menschliche Freigaben und sichtbare Fehler sorgen dafür, dass der Prozess kontrollierbar bleibt.',
  },
  adoption: {
    label: 'KI im Arbeitsalltag',
    title: 'Ein Werkzeug entfaltet Wirkung, wenn Menschen es nutzen können.',
    description: 'Geeignete Anwendungsfälle, freigegebene Werkzeuge und gemeinsame Regeln schaffen Orientierung. Mit Schulung, Austausch und überprüfbaren Ergebnissen wird aus Ausprobieren ein sinnvoller Arbeitsalltag.',
  },
};

const articles = {
  software: {
    title: 'KI im Team: Unterstützung ist noch keine Verantwortung.',
    sections: [
      ['Mit einer klaren Aufgabe beginnen', 'Ein hilfreicher Einstieg ist eine kleine, überprüfbare Änderung: ein Testfall, ein verständlicherer Funktionsname oder ein erster Dokumentationsentwurf. Beschreiben Sie vorab, welches Verhalten unverändert bleiben muss und woran Sie ein gutes Ergebnis erkennen.'],
      ['Den Entwurf als Entwurf behandeln', 'Auch plausibel wirkender Code kann Fehler enthalten. Prüfen Sie Anforderungen, Randfälle und den Umgang mit Daten. Führen Sie die relevanten Tests aus und lassen Sie Änderungen nachvollziehbar durch das Team prüfen. Eine überzeugende Erklärung ersetzt keine funktionierende Umsetzung.'],
      ['Verantwortung bleibt beim Team', 'Legen Sie fest, welche Werkzeuge und Daten erlaubt sind und wer eine Änderung freigibt. Vergleichen Sie nicht nur die Zeit bis zum ersten Entwurf, sondern auch den Aufwand für Review, Korrekturen und Betrieb. So wird aus einem schnellen Vorschlag ein bewusster Einsatz.'],
    ],
  },
  automation: {
    title: 'Vom einzelnen Prompt zum verlässlichen Workflow.',
    sections: [
      ['Erst den Ablauf verstehen', 'Nehmen Sie einen überschaubaren Prozess: Eine Anfrage trifft ein, wird eingeordnet und an die zuständige Person weitergegeben. Klären Sie die Eingaben, die beteiligten Systeme und das gewünschte Ergebnis, bevor Sie einen KI-Schritt ergänzen.'],
      ['Regeln und KI bewusst trennen', 'Feste Regeln eignen sich für eindeutige Entscheidungen. KI kann dort unterstützen, wo unstrukturierte Inhalte eingeordnet oder zusammengefasst werden. Für kritische Schritte braucht es bewusste Freigaben und eine klare Zuständigkeit.'],
      ['Auch den Fehlerfall gestalten', 'Was passiert, wenn Angaben fehlen, die Einordnung unsicher ist oder ein Zielsystem nicht antwortet? Planen Sie sichtbare Fehlermeldungen, kontrollierte Wiederholungen und die Übergabe an einen Menschen. Erst dann ist der gesamte Ablauf beschrieben.'],
    ],
    source: { label: 'Fachliche Anknüpfung: cimt über n8n, Agentic AI und menschliche Freigaben', url: 'https://www.cimt-ag.de/n8n-beratung/' },
  },
  data: {
    title: 'Gute Antworten beginnen mit guten Daten.',
    sections: [
      ['Die fachliche Frage zuerst', 'Eine Datenanalyse braucht eine konkrete Frage. Welche Entscheidung soll vorbereitet werden? Für welchen Zeitraum und welche Zielgruppe? Ohne diesen Kontext kann auch eine technisch korrekte Auswertung in die falsche Richtung führen.'],
      ['Die Grundlage prüfen', 'Prüfen Sie Herkunft, Aktualität und Vollständigkeit der Daten. Klären Sie Definitionen und Berechtigungen. Ein Sprachmodell kann bei Abfragen und Erklärungen helfen, kennt aber die fachlichen Besonderheiten Ihrer Kennzahlen nicht automatisch.'],
      ['Ergebnisse nachvollziehbar machen', 'Vergleichen Sie KI-gestützte Ergebnisse mit bekannten Werten und kleinen Kontrollrechnungen. Halten Sie Annahmen und Grenzen fest. Besonders bei wichtigen Entscheidungen müssen andere Menschen verstehen können, wie das Ergebnis zustande gekommen ist.'],
    ],
  },
  adoption: {
    title: 'Ein KI-Zugang allein verändert noch keinen Arbeitsalltag.',
    sections: [
      ['Mit einer alltäglichen Aufgabe starten', 'Suchen Sie gemeinsam mit dem Team nach einer wiederkehrenden Aufgabe: einen Text strukturieren, ein Dokument zusammenfassen oder einen ersten Entwurf vorbereiten. Vereinbaren Sie, woran die Beteiligten eine tatsächliche Verbesserung erkennen.'],
      ['Einen sicheren Rahmen schaffen', 'Klären Sie, welche Werkzeuge freigegeben sind, welche Informationen eingegeben werden dürfen und wer bei Fragen hilft. Die konkrete Zulässigkeit hängt von Daten, Konfiguration, Verträgen und dem jeweiligen Anwendungsfall ab. Ein Produktname allein ist keine Datenschutzprüfung.'],
      ['Lernen zum Teil der Arbeit machen', 'Teilen Sie hilfreiche Beispiele ebenso wie Fehler. Prüfen Sie Ergebnisse und holen Sie Rückmeldungen ein. So können Teams ein gemeinsames Verständnis dafür entwickeln, wann KI nützlich ist und wann ein anderer Weg besser funktioniert.'],
    ],
    source: { label: 'Fachliche Anknüpfung: cimt über KI-Adoption mit Langdock', url: 'https://www.cimt-ag.de/langdock-beratung/' },
  },
};

const menuToggle = document.querySelector('#menu-toggle');
const navigation = document.querySelector('#navigation');
const menuLabel = document.querySelector('#menu-label');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'Schließen' : 'Menü';
  navigation.classList.toggle('is-open', open);
}

menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) setMenu(false);
});
document.querySelector('.site-header').addEventListener('focusout', (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) setMenu(false);
});
window.matchMedia('(min-width: 651px)').addEventListener('change', () => setMenu(false));

const themeToggle = document.querySelector('#theme-toggle');
themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Helle Darstellung' : 'Dunkle Darstellung');
});

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const posts = [...document.querySelectorAll('.post-card')];

function filterPosts(category) {
  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  });
  let visible = 0;
  posts.forEach((post) => {
    post.hidden = category !== 'all' && post.dataset.category !== category;
    if (!post.hidden) visible += 1;
  });
  document.querySelector('#filter-status').textContent = `${visible} ${visible === 1 ? 'Beispielbeitrag' : 'Beispielbeiträge'}`;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => filterPosts(button.dataset.filter));
});

let selectedTopic = 'software';
document.querySelectorAll('[data-topic]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedTopic = button.dataset.topic;
    const topic = topics[selectedTopic];
    document.querySelectorAll('[data-topic]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelector('#topic-label').textContent = `IM FOKUS / ${topic.label.toLocaleUpperCase('de-DE')}`;
    document.querySelector('#topic-title').textContent = topic.title;
    document.querySelector('#topic-description').textContent = topic.description;
  });
});
document.querySelector('#topic-link').addEventListener('click', () => {
  filterPosts(selectedTopic);
});

function bindDialog(dialog) {
  dialog.querySelectorAll('.close-dialog').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });
  // Ein Klick in die vom Dialog selbst gezeichnete Fläche darf ihn nicht schließen.
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    )) dialog.close();
  });
}

const articleDialog = document.querySelector('#article-dialog');
bindDialog(articleDialog);
document.querySelectorAll('[data-article]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.article;
    const article = articles[id];
    document.querySelector('#article-title').textContent = article.title;
    document.querySelector('#article-category').textContent = topics[id].label;
    const content = document.querySelector('#article-content');
    content.replaceChildren();
    article.sections.forEach(([heading, text]) => {
      const title = document.createElement('h3');
      title.textContent = heading;
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      content.append(title, paragraph);
    });
    if (article.source) {
      const paragraph = document.createElement('p');
      const link = document.createElement('a');
      link.href = article.source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = `${article.source.label} (externe Website, neuer Tab)`;
      paragraph.append(link);
      content.append(paragraph);
    }
    articleDialog.showModal();
    articleDialog.scrollTop = 0;
  });
});

const checkDialog = document.querySelector('#check-dialog');
const checkForm = document.querySelector('#check-form');
const checkResult = document.querySelector('#check-result');
bindDialog(checkDialog);

function resetCheck() {
  checkForm.reset();
  checkForm.hidden = false;
  checkResult.hidden = true;
  checkResult.replaceChildren();
}

document.querySelector('#start-check').addEventListener('click', () => {
  resetCheck();
  checkDialog.showModal();
  checkDialog.scrollTop = 0;
});
checkDialog.addEventListener('close', resetCheck);

const checkPrompts = {
  goals: 'Ziele: Wählen Sie einen kleinen Anwendungsfall und vereinbaren Sie ein messbares Erfolgskriterium.',
  data: 'Daten: Klären Sie mit den zuständigen Personen, welche Informationen im gewählten System verarbeitet werden dürfen.',
  ownership: 'Verantwortung: Benennen Sie eine Person, die Ergebnisse fachlich prüft und notwendige Freigaben erteilt.',
};

checkForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const answers = new FormData(checkForm);
  const openTopics = Object.keys(checkPrompts).filter((key) => answers.get(key) !== 'yes');
  checkResult.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = openTopics.length ? 'Hier können Sie ansetzen.' : 'Drei gute Ausgangspunkte.';
  const introduction = document.createElement('p');
  introduction.textContent = openTopics.length
    ? 'Aus Ihren Antworten ergeben sich folgende Impulse für ein Gespräch im Team:'
    : 'Sie haben alle drei Beispielfragen mit Ja beantwortet. Prüfen Sie als Nächstes, ob die Vereinbarungen im Alltag gelebt werden und wie Sie ihre Wirkung messen.';
  checkResult.append(title, introduction);
  if (openTopics.length) {
    const list = document.createElement('ul');
    openTopics.forEach((key) => {
      const item = document.createElement('li');
      item.textContent = checkPrompts[key];
      list.append(item);
    });
    checkResult.append(list);
  }
  const note = document.createElement('p');
  note.textContent = 'Dieser Demo-Check vergibt bewusst keinen Reifegrad. Drei Antworten reichen nicht für eine belastbare Bewertung.';
  const restart = document.createElement('button');
  restart.type = 'button';
  restart.className = 'quiet-link';
  restart.textContent = 'Erneut ausprobieren ↗';
  restart.addEventListener('click', () => {
    resetCheck();
    checkForm.querySelector('input').focus();
  });
  checkResult.append(note, restart);
  checkForm.hidden = true;
  checkResult.hidden = false;
  checkResult.focus();
});
