import cartridgesData from './data/showcase_cartridges.json';

export interface ShowcaseCartridge {
  slug: string;
  id: string;
  cartridge: string;
  title: string;
  badge: string;
  prompt: string;
  result: string;
  videoWebm: string;
  videoMp4: string;
  poster: string;
}

export const CARTRIDGES: ShowcaseCartridge[] = cartridgesData as ShowcaseCartridge[];

export function initShowcaseCarousel(): {
  getCurrentIndex: () => number;
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
} {
  let currentIndex = 0;

  const badgeEl = document.getElementById('showcase-badge');
  const titleEl = document.getElementById('showcase-title');
  const resultEl = document.getElementById('showcase-result');
  const promptEl = document.getElementById('showcase-prompt');
  const videoEl = document.getElementById('demo-showcase-video') as HTMLVideoElement | null;
  const copyBtn = document.getElementById('copy-prompt-btn');
  const prevBtn = document.getElementById('showcase-prev');
  const nextBtn = document.getElementById('showcase-next');
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.showcase-tab'));
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.carousel-dot'));
  const promptCard = document.querySelector<HTMLElement>('.prompt-card');
  const typedEl = promptCard?.querySelector<HTMLElement>('.prompt-typed');

  function updateSlide(index: number): void {
    if (index < 0 || index >= CARTRIDGES.length) return;
    currentIndex = index;
    const item = CARTRIDGES[currentIndex];

    // Update text content
    if (badgeEl) badgeEl.textContent = item.badge;
    if (titleEl) titleEl.textContent = item.title;
    if (resultEl) resultEl.textContent = item.result;
    if (promptEl) {
      promptEl.textContent = item.prompt;
    }

    // Cancel typing animation if active and mark complete
    if (promptCard) {
      promptCard.classList.remove('is-typing');
      promptCard.classList.add('is-complete');
    }
    if (typedEl) {
      typedEl.textContent = '';
    }

    // Update video sources and poster (ensuring relative paths strictly adhered to)
    if (videoEl) {
      const isPaused = videoEl.paused;
      videoEl.setAttribute('poster', item.poster);
      videoEl.poster = item.poster;

      const webmSource = videoEl.querySelector<HTMLSourceElement>('source[type="video/webm"]');
      const mp4Source = videoEl.querySelector<HTMLSourceElement>('source[type="video/mp4"]');

      if (webmSource) {
        webmSource.setAttribute('src', item.videoWebm);
        webmSource.src = item.videoWebm;
      }
      if (mp4Source) {
        mp4Source.setAttribute('src', item.videoMp4);
        mp4Source.src = item.videoMp4;
      }

      videoEl.load();
      if (!isPaused) {
        videoEl.play().catch(() => {});
      }
    }

    // Update tabs
    tabs.forEach((tab, i) => {
      const isActive = i === currentIndex;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.tabIndex = isActive ? 0 : -1;
    });

    // Update dots
    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    // Dispatch custom event for listeners
    document.dispatchEvent(
      new CustomEvent('tokigen:showcasechange', {
        detail: { index: currentIndex, cartridge: item },
      })
    );
  }

  // Prev / Next button listeners
  prevBtn?.addEventListener('click', () => {
    const nextIdx = (currentIndex - 1 + CARTRIDGES.length) % CARTRIDGES.length;
    updateSlide(nextIdx);
  });

  nextBtn?.addEventListener('click', () => {
    const nextIdx = (currentIndex + 1) % CARTRIDGES.length;
    updateSlide(nextIdx);
  });

  // Tab button listeners
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      updateSlide(i);
    });

    // Keyboard navigation (ArrowLeft / ArrowRight)
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIdx = (i + 1) % tabs.length;
        tabs[nextIdx]?.focus();
        updateSlide(nextIdx);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIdx = (i - 1 + tabs.length) % tabs.length;
        tabs[prevIdx]?.focus();
        updateSlide(prevIdx);
      }
    });
  });

  // Dot button listeners
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      updateSlide(i);
    });
  });

  // Copy prompt button listener
  let copyTimeout = 0;
  copyBtn?.addEventListener('click', async () => {
    const textToCopy = promptEl?.textContent || CARTRIDGES[currentIndex].prompt;
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }

    copyBtn.classList.add('is-copied');
    const copyText = copyBtn.querySelector<HTMLElement>('.copy-text');
    const copyIcon = copyBtn.querySelector<HTMLElement>('.copy-icon');
    const checkIcon = copyBtn.querySelector<HTMLElement>('.check-icon');
    const originalText = copyText?.dataset.defaultText || copyText?.textContent || 'Copy Prompt';

    if (copyText) {
      if (!copyText.dataset.defaultText) {
        copyText.dataset.defaultText = originalText;
      }
      copyText.textContent = 'Copied!';
    }
    if (copyIcon) copyIcon.style.display = 'none';
    if (checkIcon) checkIcon.style.display = 'inline-block';

    window.clearTimeout(copyTimeout);
    copyTimeout = window.setTimeout(() => {
      copyBtn.classList.remove('is-copied');
      if (copyText) {
        copyText.textContent = copyText.dataset.defaultText || 'Copy Prompt';
      }
      if (copyIcon) copyIcon.style.display = 'inline-block';
      if (checkIcon) checkIcon.style.display = 'none';
    }, 2000);
  });

  return {
    getCurrentIndex: () => currentIndex,
    goToSlide: (index: number) => updateSlide(index),
    nextSlide: () => updateSlide((currentIndex + 1) % CARTRIDGES.length),
    prevSlide: () => updateSlide((currentIndex - 1 + CARTRIDGES.length) % CARTRIDGES.length),
  };
}
