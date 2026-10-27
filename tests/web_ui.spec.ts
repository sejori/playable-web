import { test, expect } from '@playwright/test';

test.describe('playable-web UI & Auth Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept backend API calls with deterministic fixtures (zero inference billing)
    await page.route('**/api/cartridges', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'template-action-rpg', name: 'Action-RPG & Elemental Campaign' },
          { id: 'template-tick-sandbox', name: 'Tick-Based Sandbox RPG (600ms)' },
        ]),
      })
    );

    await page.route('**/api/rooms', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            room_code: 'TEST-4821',
            zone_title: 'The Boiling Iron Rig',
            active_players: 1,
            max_players: 8,
            wake_latency_ms: 280,
          },
        ]),
      })
    );

    await page.route('**/api/builds', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          build_id: 'bld_mock_999',
          prompt: 'Mock build prompt',
          cartridge_id: 'template-action-rpg',
          branch: 'feat/test',
          preview_room_code: 'TEST-9999',
          pck_bundle_name: 'patch_test.pck',
          pck_size_mb: 18.2,
          credits_consumed: 3,
          status: 'COMPLETED',
          stages: [],
        }),
      });
    });

    await page.route('**/api/ledger', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          credits_remaining: 120,
          plan_tier: 'Creator Pro',
          total_builds: 14,
          credits_used: 30,
          active_realms: 2,
          doubleword_connected: true,
        }),
      })
    );

    await page.route('**/api/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_mock_123',
          email: 'creator@playable.gg',
          name: 'Creator Pro',
          credits_remaining: 120,
        }),
      })
    );

    await page.route('**/api/auth/google', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock_jwt_token_123',
          token_type: 'Bearer',
          user: {
            id: 'usr_mock_123',
            email: 'creator_guest@playable.gg',
            name: 'Playable Tester (creator_guest)',
            credits_remaining: 150,
          },
        }),
      })
    );

    // Block Google accounts script to keep tests deterministic
    await page.route('https://accounts.google.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: 'window.google = window.google || {};',
      })
    );
  });

  test('Shows login modal when unauthenticated user attempts to build', async ({ page }) => {
    await page.goto('./');
    await page.getByPlaceholder(/Describe your realm/i).fill('Add fire dragons');
    await page.getByRole('button', { name: /Build Realm/i }).click();
    await expect(page.getByText(/Sign in with Google to build/i)).toBeVisible();
  });

  test('Mocked authentication unlocks creator studio', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('playable_token', 'mock_jwt_token_123');
    });
    await page.goto('./');
    await expect(page.getByText('120 Credits Remaining')).toBeVisible();
    await expect(page.getByText(/🪙 120 Credits/i)).toBeVisible();
  });

  test('Surfaces HTTP 402 Insufficient Credits toast', async ({ page }) => {
    await page.route('**/api/builds', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 402,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Insufficient workspace credits',
            credits_remaining: 0,
            required: 3,
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('playable_token', 'mock_jwt_token_123');
    });
    await page.goto('./');
    await page.getByRole('button', { name: /Build Realm/i }).click();
    await expect(page.getByText(/Insufficient workspace credits/i).first()).toBeVisible();
  });

  test('Instant Creator Demo pill logs in user with credits', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Instant Creator Demo/i }).click();
    await expect(page.getByText('Sign Out')).toBeVisible();
    await expect(page.locator('#nav-credits-badge')).toBeVisible();
    await expect(page.locator('#nav-credits-badge')).toHaveText(/150 Credits/);
  });

  test('Guards Voice Architect action when unauthenticated', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Hold L1: Voice Architect/i }).click();
    await expect(page.getByText(/Sign in with Google to build/i)).toBeVisible();
  });

  test('Guards Commercial Eject action when unauthenticated', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Preview Commercial Eject/i }).click();
    await expect(page.getByText(/Sign in with Google to build/i)).toBeVisible();
  });

  test('Video showcase container and engine overlay badge render correctly', async ({ page }) => {
    await page.goto('./');
    const showcaseContainer = page.locator('.video-showcase-container');
    await expect(showcaseContainer).toBeVisible();
    await expect(page.locator('.video-overlay-badge')).toBeVisible();
    await expect(page.locator('#demo-showcase-video')).toBeVisible();
  });

  test('Native client download CTAs for Windows, macOS, Linux and CLI command are available', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('a[download="PlayableLauncher-win64.exe"]')).toBeVisible();
    await expect(page.locator('a[download="PlayableLauncher-macOS.dmg"]')).toBeVisible();
    await expect(page.locator('a[download="PlayableLauncher-x86_64.AppImage"]')).toBeVisible();
    await expect(page.locator('#cli-launch-command')).toBeVisible();
  });

  test('Sign out clears session and restores login controls', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('playable_token', 'mock_jwt_token_123');
    });
    await page.goto('./');
    await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible();
    await page.getByRole('button', { name: /Sign Out/i }).click();
    await expect(page.getByRole('button', { name: /Instant Creator Demo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign Out/i })).not.toBeVisible();
  });
});
