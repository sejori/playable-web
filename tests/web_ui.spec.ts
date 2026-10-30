import { test, expect } from '@playwright/test';

test.describe('tokigen.gg Web Suite', () => {
  test('Landing page loads with tokigen branding and hero copy', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/tokigen\.gg — Create a world. Write the rules. Bring your friends!/i);

    // Hero headline lines
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('Create a world.');
    await expect(heroTitle).toContainText('Write the rules.');
    await expect(heroTitle).toContainText('Bring your friends!');

    // Hero lead text mentions creating, sharing and joining
    const heroLead = page.locator('.hero-lead');
    await expect(heroLead).toContainText('create custom games');
    await expect(heroLead).toContainText('share room codes');

    // Kigen Hanko seal
    const heroHanko = page.locator('.hanko-hero');
    await expect(heroHanko).toBeVisible();
    await expect(heroHanko).toContainText('起源');
  });

  test('Showcase section appears before How it works in page flow', async ({ page }) => {
    await page.goto('./');
    const sections = page.locator('main > section');
    const ids = await sections.evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(['top', 'showcase', 'how', 'download']);
  });

  test('Hero CTA "Get Started Now" targets download section', async ({ page }) => {
    await page.goto('./');
    const cta = page.locator('#cta-get-started');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '#download');
    await expect(cta).toHaveText('Get Started Now');

    // Clicking CTA navigates to #download
    await cta.click();
    await expect(page.locator('#download')).toBeInViewport();
  });

  test('How it works section details open-source client, generative systems, multiplayer servers and starter templates', async ({ page }) => {
    await page.goto('./');
    const howSection = page.locator('#how');
    await expect(howSection).toBeVisible();

    // 3 Pillars
    await expect(howSection.getByRole('heading', { name: 'Open-source client' })).toBeVisible();
    await expect(howSection.getByRole('heading', { name: 'Custom generative systems' })).toBeVisible();
    await expect(howSection.getByRole('heading', { name: 'Multiplayer servers' })).toBeVisible();

    // Verification of MIT & engine details
    await expect(howSection.getByText(/Godot Engine 4/i).first()).toBeVisible();
    await expect(howSection.getByText(/Jolt Physics/i).first()).toBeVisible();

    // Starter templates moved to how-it-works
    const templates = howSection.locator('.templates');
    await expect(templates).toBeVisible();
    await expect(templates.getByText('Start from a template')).toBeVisible();
    await expect(templates.getByText('Action RPG')).toBeVisible();
    await expect(templates.getByText('Sandbox RPG')).toBeVisible();
    await expect(templates.getByText('Voxel survival')).toBeVisible();
    await expect(templates.getByText('4X strategy')).toBeVisible();
    await expect(templates.getByText('Arena shooter')).toBeVisible();
    await expect(templates.getByText('Tycoon & racer')).toBeVisible();
  });

  test('Showcase section displays interactive template carousel with relative sources', async ({ page }) => {
    await page.goto('./');
    const showcase = page.locator('#showcase');
    await expect(showcase).toBeVisible();

    // Template selector tabs
    const tabs = showcase.locator('.showcase-tab');
    await expect(tabs).toHaveCount(6);
    await expect(tabs.nth(0)).toHaveClass(/is-active/);
    await expect(tabs.nth(0)).toContainText('Action RPG');

    // Initial slide badge and prompt
    const badge = showcase.locator('#showcase-badge');
    await expect(badge).toHaveText('Action RPG');

    const title = showcase.locator('#showcase-title');
    await expect(title).toHaveText('Action-RPG Dungeon Crawler');

    const result = showcase.locator('#showcase-result');
    await expect(result).toHaveText('Result: Volcanic Golem Abyss');

    const promptBubble = showcase.locator('#showcase-prompt');
    await expect(promptBubble).toBeVisible();
    await expect(promptBubble).toContainText('dark volcanic cathedral abyss');

    // Video player initial sources (strictly relative per Rule 2.3)
    const video = page.locator('#demo-showcase-video');
    await expect(video).toBeVisible();
    await expect(video.locator('source[type="video/webm"]')).toHaveAttribute('src', './showcase/action-rpg.webm');
    await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute('src', './showcase/action-rpg.mp4');
    await expect(video).toHaveAttribute('poster', './showcase/action-rpg-poster.jpg');

    // Next button navigates to slide 2: Tick Sandbox
    const nextBtn = showcase.locator('#showcase-next');
    await nextBtn.click();

    await expect(tabs.nth(1)).toHaveClass(/is-active/);
    await expect(badge).toHaveText('Tick Sandbox');
    await expect(title).toHaveText('Tick-Based MMO Sandbox');
    await expect(result).toHaveText('Result: Medieval Lumbridge Square');
    await expect(promptBubble).toContainText('medieval village square');
    await expect(video.locator('source[type="video/webm"]')).toHaveAttribute('src', './showcase/tick-sandbox.webm');
    await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute('src', './showcase/tick-sandbox.mp4');
    await expect(video).toHaveAttribute('poster', './showcase/tick-sandbox-poster.jpg');

    // Switching via tab click: jump directly to Arena FPS (index 4)
    const arenaTab = showcase.locator('#tab-arena-fps');
    await arenaTab.click();

    await expect(arenaTab).toHaveClass(/is-active/);
    await expect(badge).toHaveText('Arena FPS');
    await expect(title).toHaveText('Arena Hero FPS');
    await expect(result).toHaveText('Result: Sci-Fi Bunker Arena');
    await expect(promptBubble).toContainText('high-octane 3-lane sci-fi industrial arena');
    await expect(video.locator('source[type="video/webm"]')).toHaveAttribute('src', './showcase/arena-fps.webm');
    await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute('src', './showcase/arena-fps.mp4');
    await expect(video).toHaveAttribute('poster', './showcase/arena-fps-poster.jpg');

    // Switching via dot click: jump to Collector Tycoon (index 5)
    const dots = showcase.locator('.carousel-dot');
    await expect(dots).toHaveCount(6);
    await dots.nth(5).click();

    await expect(dots.nth(5)).toHaveClass(/is-active/);
    await expect(badge).toHaveText('Collector Tycoon');
    await expect(result).toHaveText('Result: Neon Speedway Tycoon');
    await expect(video.locator('source[type="video/webm"]')).toHaveAttribute('src', './showcase/collector-tycoon.webm');

    // Previous button goes back to Arena FPS (index 4)
    const prevBtn = showcase.locator('#showcase-prev');
    await prevBtn.click();
    await expect(badge).toHaveText('Arena FPS');

    // Copy Prompt button copies prompt and gives visual feedback
    const copyBtn = showcase.locator('#copy-prompt-btn');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(copyBtn).toHaveClass(/is-copied/);
    await expect(copyBtn.locator('.copy-text')).toHaveText('Copied!');

    // Invariant Rule 2.3 check across all 6 templates: none use leading slash
    for (let i = 0; i < 6; i++) {
      await dots.nth(i).click();
      const webmSrc = await video.locator('source[type="video/webm"]').getAttribute('src');
      const mp4Src = await video.locator('source[type="video/mp4"]').getAttribute('src');
      const posterSrc = await video.getAttribute('poster');

      expect(webmSrc?.startsWith('./showcase/')).toBeTruthy();
      expect(webmSrc?.startsWith('/showcase/')).toBeFalsy();

      expect(mp4Src?.startsWith('./showcase/')).toBeTruthy();
      expect(mp4Src?.startsWith('/showcase/')).toBeFalsy();

      expect(posterSrc?.startsWith('./showcase/')).toBeTruthy();
      expect(posterSrc?.startsWith('/showcase/')).toBeFalsy();
    }
  });

  test('Download section offers TokigenLauncher for Windows, macOS, Linux', async ({ page }) => {
    await page.goto('./');
    const dlSection = page.locator('#download');
    await expect(dlSection).toBeVisible();

    // Windows card
    const winDl = dlSection.locator('a[download="TokigenLauncher-win64.exe"]');
    await expect(winDl).toBeVisible();
    await expect(winDl.locator('.os-name')).toHaveText('Windows');

    // macOS card
    const macDl = dlSection.locator('a[download="TokigenLauncher-macOS.dmg"]');
    await expect(macDl).toBeVisible();
    await expect(macDl.locator('.os-name')).toHaveText('macOS');

    // Linux card
    const linuxDl = dlSection.locator('a[download="TokigenLauncher-x86_64.AppImage"]');
    await expect(linuxDl).toBeVisible();
    await expect(linuxDl.locator('.os-name')).toHaveText('Linux');
  });

  test('Discord community links display "Coming soon" state', async ({ page }) => {
    await page.goto('./');
    const navDiscord = page.locator('.discord-link.is-soon');
    await expect(navDiscord).toBeVisible();
    await expect(navDiscord.locator('.soon-ribbon')).toContainText(/Coming soon/i);

    const communityCard = page.locator('.community-card.is-soon');
    await expect(communityCard).toBeVisible();
    await expect(communityCard.locator('.soon-banner')).toContainText(/Coming soon/i);
  });

  test('Language selector switches between English, Brazilian Portuguese and Japanese', async ({ page }) => {
    await page.goto('./');
    const langSelect = page.locator('#lang-select');
    await expect(langSelect).toBeVisible();

    // Switch to Japanese
    await langSelect.selectOption('ja');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page).toHaveTitle(/tokigen\.gg — 世界を創る。ルールを書く。仲間を呼ぼう！/i);
    await expect(page.locator('.hero-title')).toContainText('世界を創る。');
    await expect(page.locator('#cta-get-started')).toHaveText('今すぐ始める');

    // Switch to Brazilian Portuguese
    await langSelect.selectOption('pt-BR');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page).toHaveTitle(/tokigen\.gg — Crie um mundo. Escreva as regras. Traga seus amigos!/i);
    await expect(page.locator('.hero-title')).toContainText('Crie um mundo.');
    await expect(page.locator('#cta-get-started')).toHaveText('Comece agora');

    // Switch back to English
    await langSelect.selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.hero-title')).toContainText('Create a world.');
    await expect(page.locator('#cta-get-started')).toHaveText('Get Started Now');
  });

  test('Defaults to system theme and toggles user override', async ({ page }) => {
    // 1. Without click, html has no data-theme override (defaults strictly to system)
    await page.goto('./');
    const htmlEl = page.locator('html');
    await expect(htmlEl).not.toHaveAttribute('data-theme', /.+/);

    // 2. Emulating dark mode applies dark styling by default
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('.theme-to-light')).toBeVisible();

    // 3. Triggering theme toggle adds explicit user override
    const themeBtn = page.locator('#theme-toggle');
    await themeBtn.click();
    await expect(htmlEl).toHaveAttribute('data-theme', 'light');

    // 4. Triggering again reverts back to system default (removes data-theme)
    await themeBtn.click();
    await expect(htmlEl).not.toHaveAttribute('data-theme', /.+/);
  });

  test('Web Studio page is linked and displays Under Construction status', async ({ page }) => {
    await page.goto('./');
    const studioLink = page.locator('#nav-studio');
    await expect(studioLink).toBeVisible();
    await expect(studioLink).toHaveAttribute('href', './studio.html');

    // Navigate to studio page
    await page.goto('./studio.html');
    await expect(page).toHaveTitle(/Web Studio \(under construction\) — tokigen\.gg/i);
    await expect(page.getByRole('heading', { name: /Under construction/i })).toBeVisible();

    // Japanese "工事中" hanko seal on the studio page
    const studioHanko = page.locator('.hanko-hero');
    await expect(studioHanko).toBeVisible();
    await expect(studioHanko).toContainText('工事中');

    // Feature preview cards
    await expect(page.getByText('Game gallery')).toBeVisible();
    await expect(page.getByText('3D asset viewer')).toBeVisible();
    await expect(page.getByText('Share pages')).toBeVisible();
  });
});
