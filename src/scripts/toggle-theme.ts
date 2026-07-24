import { SITE } from '@/config/site.config';

const THEME_STORAGE_KEY = SITE.browserStorage.theme;

const getTheme = () => {
  return (
    localStorage.getItem(THEME_STORAGE_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light')
  );
};

const applyTheme = () => {
  const theme = getTheme();
  const isDark = theme === 'dark';

  document.documentElement.classList.toggle('dark', isDark);

  const bgColor = getComputedStyle(document.body).backgroundColor;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', bgColor);
};

const setupToggle = () => {
  const toggle = document.querySelector('#theme-toggle');
  if (!toggle) return;

  toggle.addEventListener(
    'click',
    () => {
      const currentTheme = getTheme();
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      applyTheme();
    },
    { once: false },
  );
};

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme();
    }
  });

applyTheme();
setupToggle();
