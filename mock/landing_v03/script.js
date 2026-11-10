const themeButton = document.getElementById('theme-toggle');
const menuButton = document.getElementById('menu-toggle');
const menuLabel = document.getElementById('menu-label');
const header = document.querySelector('.header-inner');
const navigation = document.getElementById('navigation');

themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'Helle Darstellung' : 'Dunkle Darstellung');
});

function setMenu(open, restoreFocus = false) {
  // Match the shared cimt navigation's CSS state; no persistent preferences.
  navigation.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'Schließen' : 'Menü';
  if (restoreFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) setMenu(false);
});
document.addEventListener('focusin', event => {
  if (!header.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
matchMedia('(min-width: 651px)').addEventListener('change', event => {
  if (event.matches) setMenu(false);
});
