import { applyLanguage, detectLanguage, getLanguage, isLang, t } from './i18n';

const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------------ */
/* Language selector                                                   */
/* ------------------------------------------------------------------ */
function initLanguage(): void {
  const select = document.getElementById('lang-select') as HTMLSelectElement | null;
  const lang = detectLanguage();
  applyLanguage(lang);
  if (select) {
    select.value = lang;
    select.addEventListener('change', () => {
      if (isLang(select.value)) applyLanguage(select.value, true);
    });
  }
}

/* ------------------------------------------------------------------ */
/* Colour scheme: strictly defaults to system theme; toggle pins an   */
/* override, or clears it when returning to match the system scheme.   */
/* ------------------------------------------------------------------ */
const THEME_KEY = 'tokigen_theme';

function initThemeToggle(): void {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  const darkQuery = matchMedia('(prefers-color-scheme: dark)');
  const getSystemTheme = () => (darkQuery.matches ? 'dark' : 'light');
  const getEffectiveTheme = () => root.dataset.theme || getSystemTheme();

  button.addEventListener('click', () => {
    const current = getEffectiveTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    const system = getSystemTheme();

    if (next === system) {
      // Revert to system default: remove override
      delete root.dataset.theme;
      try {
        localStorage.removeItem(THEME_KEY);
      } catch {}
    } else {
      // Explicit override
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
    }
  });

  // Keep multiple open tabs in sync.
  window.addEventListener('storage', (event) => {
    if (event.key === THEME_KEY) {
      if (event.newValue === 'dark' || event.newValue === 'light') {
        root.dataset.theme = event.newValue;
      } else {
        delete root.dataset.theme;
      }
    }
  });
}

/* ------------------------------------------------------------------ */
/* Mobile menu (popover): close after picking a destination            */
/* ------------------------------------------------------------------ */
function initMenu(): void {
  const menu = document.getElementById('site-menu');
  if (!menu || typeof menu.hidePopover !== 'function') return;
  menu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
      if (menu.matches(':popover-open')) menu.hidePopover();
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Download cards: highlight the visitor's OS                          */
/* ------------------------------------------------------------------ */
type OS = 'windows' | 'macos' | 'linux';

function detectOS(): OS | null {
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const source = `${uaData?.platform ?? ''} ${navigator.userAgent}`.toLowerCase();
  if (/android|iphone|ipad|ipod/.test(source)) return null; // no mobile launcher yet
  if (source.includes('win')) return 'windows';
  if (source.includes('mac')) return 'macos';
  if (source.includes('linux') || source.includes('x11') || source.includes('cros')) return 'linux';
  return null;
}

function initDownloads(): void {
  const os = detectOS();
  if (!os) return;
  document.querySelector<HTMLElement>(`.download-card[data-os="${os}"]`)?.classList.add('is-recommended');
}

/* ------------------------------------------------------------------ */
/* Showcase prompt: typewriter effect, then light up pipeline steps    */
/* ------------------------------------------------------------------ */
function initPromptTyping(): void {
  const card = document.querySelector<HTMLElement>('.prompt-card');
  const typed = card?.querySelector<HTMLElement>('.prompt-typed');
  if (!card || !typed) return;

  let timer = 0;
  let started = false;

  const finish = () => {
    window.clearTimeout(timer);
    card.classList.remove('is-typing');
    card.classList.add('is-complete');
    typed.textContent = '';
  };

  const run = () => {
    started = true;
    if (prefersReducedMotion.matches) return finish();
    const text = t('showcase.prompt');
    // Iterate by code point so Japanese / emoji never split mid-character.
    const chars = Array.from(text);
    const step = getLanguage() === 'ja' ? 55 : 22;
    let i = 0;
    card.classList.remove('is-complete');
    card.classList.add('is-typing');
    const tick = () => {
      typed.textContent = chars.slice(0, ++i).join('');
      if (i < chars.length) timer = window.setTimeout(tick, step);
      else timer = window.setTimeout(finish, 400);
    };
    tick();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        run();
      }
    },
    { threshold: 0.4 },
  );
  observer.observe(card);

  // Switching language mid-animation: just show the full translated prompt.
  document.addEventListener('tokigen:languagechange', () => {
    if (started) finish();
  });
}

/* ------------------------------------------------------------------ */
/* Showcase video: play only while visible, never fight a user pause   */
/* ------------------------------------------------------------------ */
function initShowcaseVideo(): void {
  const video = document.getElementById('demo-showcase-video') as HTMLVideoElement | null;
  if (!video) return;
  let userPaused = false;
  let autoPausing = false;

  video.addEventListener('pause', () => {
    if (!autoPausing) userPaused = true;
    autoPausing = false;
  });
  video.addEventListener('play', () => {
    userPaused = false;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!userPaused && !prefersReducedMotion.matches && video.paused) {
          video.play().catch(() => {
            /* autoplay blocked: poster + controls remain */
          });
        }
      } else if (!video.paused) {
        autoPausing = true;
        video.pause();
      }
    },
    { threshold: 0.5 },
  );
  observer.observe(video);
}

initLanguage();
initThemeToggle();
initMenu();
initDownloads();
initPromptTyping();
initShowcaseVideo();
