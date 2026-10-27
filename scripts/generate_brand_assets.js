import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateAssets() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. OG Image (1200x630)
  const ogHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Knewave&family=Yuji+Boku&family=Inter:wght@400;700;800;900&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1200px;
        height: 630px;
        background: #fbfaf7;
        font-family: 'Inter', sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 70px 80px;
        position: relative;
        overflow: hidden;
        color: #14161c;
      }
      /* Speed lines */
      .speedlines {
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          118deg,
          transparent 0 28px,
          rgba(31, 79, 216, 0.08) 28px 30px
        );
        mask-image: radial-gradient(ellipse 70% 80% at 85% 40%, #000 20%, transparent 80%);
        -webkit-mask-image: radial-gradient(ellipse 70% 80% at 85% 40%, #000 20%, transparent 80%);
      }
      /* Large Ensō brush circle in background */
      .enso {
        position: absolute;
        right: 40px;
        top: 50%;
        transform: translateY(-50%);
        width: 440px;
        height: 440px;
        border: 36px solid #d7261e;
        border-radius: 50%;
        opacity: 0.12;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 18px;
        z-index: 2;
      }
      .hanko-header {
        width: 48px;
        height: 48px;
        border: 3px solid #d7261e;
        border-radius: 9px;
        color: #d7261e;
        font-family: 'Yuji Boku', serif;
        font-size: 19px;
        display: flex;
        align-items: center;
        justify-content: center;
        writing-mode: vertical-rl;
        transform: rotate(-5deg);
        letter-spacing: -2px;
      }
      .brand-title {
        font-family: 'Knewave', cursive;
        font-size: 42px;
        color: #14161c;
        letter-spacing: 0.5px;
      }
      .brand-tld {
        color: #1f4fd8;
      }
      .tag-pill {
        margin-left: 20px;
        background: #e6ecfd;
        color: #1f4fd8;
        padding: 6px 16px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 14px;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .main {
        z-index: 2;
        max-width: 820px;
      }
      .headline {
        font-family: 'Knewave', cursive;
        font-size: 70px;
        line-height: 1.05;
        margin-bottom: 24px;
      }
      .hl-white { color: #14161c; }
      .hl-red { color: #d7261e; }
      .hl-blue { color: #1f4fd8; }
      .lead {
        font-size: 24px;
        line-height: 1.4;
        color: #4a4f5c;
        font-weight: 500;
      }
      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 2;
        border-top: 2px solid #e4e1d8;
        padding-top: 24px;
      }
      .footer-badges {
        display: flex;
        gap: 16px;
      }
      .badge {
        background: #ffffff;
        border: 1px solid #e4e1d8;
        border-radius: 999px;
        padding: 8px 18px;
        font-size: 15px;
        font-weight: 700;
        color: #4a4f5c;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
      .hanko-large {
        position: absolute;
        right: 90px;
        bottom: 120px;
        width: 140px;
        height: 140px;
        border: 8px solid #d7261e;
        border-radius: 20px;
        color: #d7261e;
        font-family: 'Yuji Boku', serif;
        font-size: 58px;
        display: flex;
        align-items: center;
        justify-content: center;
        writing-mode: vertical-rl;
        transform: rotate(8deg);
        opacity: 0.9;
        box-shadow: 0 4px 16px rgba(215, 38, 30, 0.15);
      }
    </style>
  </head>
  <body>
    <div class="speedlines"></div>
    <div class="enso"></div>
    <div class="hanko-large">起源</div>

    <div class="header">
      <div class="hanko-header">起源</div>
      <div class="brand-title">tokigen<span class="brand-tld">.gg</span></div>
      <div class="tag-pill">AI-Native Game Engine</div>
    </div>

    <div class="main">
      <div class="headline">
        <span class="hl-white">Your game,</span><br>
        <span class="hl-red">your rules,</span><br>
        <span class="hl-blue">your friends.</span>
      </div>
      <p class="lead">
        Describe the game you want to play. tokigen builds it, tests it and hosts it — then you jump in together.
      </p>
    </div>

    <div class="footer">
      <div class="footer-badges">
        <span class="badge">🎮 Open-Source Godot 4.7</span>
        <span class="badge">⚡ Custom Generative Systems</span>
        <span class="badge">🌐 Scale-to-Zero Multiplayer</span>
      </div>
      <div style="font-size: 18px; font-weight: 800; color: #d7261e; letter-spacing: 0.5px;">tokigen.gg</div>
    </div>
  </body>
  </html>
  `;

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(ogHtml, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(__dirname, '../public/og-image.png'), type: 'png' });
  console.log('✓ Created public/og-image.png');

  // 2. Favicon (64x64) - Hanko seal icon with 起源
  const favHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Yuji+Boku&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 64px;
        height: 64px;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stamp {
        width: 58px;
        height: 58px;
        background: #d7261e;
        border-radius: 12px;
        color: #ffffff;
        font-family: 'Yuji Boku', serif;
        font-size: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        writing-mode: vertical-rl;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        letter-spacing: -2px;
      }
    </style>
  </head>
  <body>
    <div class="stamp">起源</div>
  </body>
  </html>
  `;

  await page.setViewportSize({ width: 64, height: 64 });
  await page.setContent(favHtml, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(__dirname, '../public/favicon.png'), type: 'png', omitBackground: true });
  console.log('✓ Created public/favicon.png');

  // 3. Apple Touch Icon (180x180)
  const touchHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Yuji+Boku&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 180px;
        height: 180px;
        background: #fbfaf7;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stamp {
        width: 150px;
        height: 150px;
        background: #d7261e;
        border-radius: 32px;
        color: #ffffff;
        font-family: 'Yuji Boku', serif;
        font-size: 68px;
        display: flex;
        align-items: center;
        justify-content: center;
        writing-mode: vertical-rl;
        letter-spacing: -4px;
      }
    </style>
  </head>
  <body>
    <div class="stamp">起源</div>
  </body>
  </html>
  `;

  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(touchHtml, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(__dirname, '../public/apple-touch-icon.png'), type: 'png' });
  console.log('✓ Created public/apple-touch-icon.png');

  await browser.close();
}

generateAssets().catch((err) => {
  console.error(err);
  process.exit(1);
});
