// Setzt die Darstellung vor dem ersten Zeichnen, damit die Seite nicht kurz hell aufblitzt (Ticket #20).
// Gespeicherte Wahl, sonst Systemeinstellung, sonst hell. Als eigene Datei, weil die CSP Inline-Skripte verbietet.
(function () {
  var theme = null;
  try {
    theme = localStorage.getItem('ki-perspektiven.theme');
  } catch (e) {
    /* privat oder blockiert */
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
