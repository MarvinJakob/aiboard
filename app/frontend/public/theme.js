// Setzt die Darstellung vor dem ersten Zeichnen, damit keine andere Darstellung aufblitzt (Tickets #20, #53).
// Gespeicherte Wahl, sonst hell. Als eigene Datei, weil die CSP Inline-Skripte verbietet.
(function () {
  var theme = null;
  try {
    theme = localStorage.getItem('ki-perspektiven.theme');
  } catch (e) {
    /* privat oder blockiert */
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
