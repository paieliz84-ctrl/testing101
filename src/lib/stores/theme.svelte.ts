import { browser } from '$app/environment';

type Theme = 'dark' | 'light';

// Create reactive theme state
function createThemeStore() {
  let currentTheme = $state<Theme>('dark');

  function init() {
    if (!browser) return;
    
    const saved = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    currentTheme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(currentTheme);
  }

  function applyTheme(theme: Theme) {
    if (!browser) return;
    
    const html = document.documentElement;
    
    if (theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
    
    localStorage.setItem('theme', theme);
    currentTheme = theme;
  }

  function toggle() {
    const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  function set(theme: Theme) {
    applyTheme(theme);
  }

  return {
    get current() { return currentTheme; },
    init,
    toggle,
    set
  };
}

export const theme = createThemeStore();
