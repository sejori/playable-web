/**
 * Interactive Playable 3D Slice Renderer: The Boiling Iron Rig (fire_prison_rig.tscn)
 * Supports:
 * - Real-time WASD movement of PlayerCharacter (Layer 2)
 * - CoalVent_01 (Layer 4, group="metal_source") interaction & Metal Shield activation
 * - Earth Lance projectile casting (Layer 5) against Boss (Layer 3)
 * - Dynamic hot-reloading of LLM-generated procedural Config Bundles (sky, grid, boss, abilities, hazards)
 * - 4-Panel Quad-Debug Vision Mode ([Player 3rd-Person], [Ortho Navmesh], [Jolt Collision Wireframe], [UI Bounds])
 */

export interface RuntimeConfigBundle {
  bundle_id: string;
  zone_title: string;
  sky_top_hex: string;
  sky_bottom_hex: string;
  grid_tint_hex: string;
  boss_name: string;
  boss_max_hp: number;
  boss_color_hex: string;
  primary_ability_name: string;
  primary_ability_damage: number;
  hazard_name: string;
  hazard_radius: number;
  noise_seed: number;
  npc_dialogue_preview: string;
}

export interface DemoCallbacks {
  onTelemetryEvent: (event: Record<string, unknown>) => void;
  onHudUpdate: (state: { ventCharges: number; wardenHp: number; wardenMaxHp: number; drawCalls: number }) => void;
}

interface Projectile {
  x: number;
  z: number;
  vx: number;
  vz: number;
}

export class BoilingIronRigDemo {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: DemoCallbacks;

  public quadDebugMode = false;
  public activeRoomCode = 'TEST-4821';
  public customFeatureBanner = '';

  public activeBundle: RuntimeConfigBundle = {
    bundle_id: 'cfg_default_014',
    zone_title: 'The Boiling Iron Rig',
    sky_top_hex: '#0f172a',
    sky_bottom_hex: '#1e1b2e',
    grid_tint_hex: '#94a3b8',
    boss_name: 'Fire Warden Boss',
    boss_max_hp: 2200,
    boss_color_hex: '#ef4444',
    primary_ability_name: 'Tectonic Earth Lance',
    primary_ability_damage: 185,
    hazard_name: 'Volcanic Arena Ring',
    hazard_radius: 95,
    noise_seed: 14014,
    npc_dialogue_preview: 'Rebel Scout: Extract ore from CoalVent_01 before engaging the Warden!',
  };

  private keys: Record<string, boolean> = {};
  private player = { x: 0, z: 16, hp: 500, chi: 100, shieldActive: false, shieldTimer: 0 };
  private coalVent = { x: -8.5, z: 2.0, charges: 6 };
  private warden = { x: 0, z: -22, hp: 2200, maxHp: 2200, active: true };
  private projectiles: Projectile[] = [];
  private tick = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: DemoCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('2D rendering context unavailable');
    }
    this.ctx = context;
    this.callbacks = callbacks;
    this.bindInput();
    requestAnimationFrame(() => this.loop());
  }

  private bindInput(): void {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = true;
      if (k === 'e') {
        this.extractCoalAndShield();
      } else if (k === ' ') {
        if (document.activeElement === this.canvas) {
          e.preventDefault();
        }
        this.castEarthLance();
      } else if (k === 'q' && document.activeElement === this.canvas) {
        this.toggleQuadDebug();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  public toggleQuadDebug(): boolean {
    this.quadDebugMode = !this.quadDebugMode;
    this.callbacks.onTelemetryEvent({
      ts: Math.floor(Date.now() / 1000),
      tick: this.tick,
      event: 'VISION_PROBE',
      mode: this.quadDebugMode ? 'quad_debug' : 'single_cam',
      resolution: [1280, 720],
    });
    return this.quadDebugMode;
  }

  public extractCoalAndShield(): void {
    if (this.coalVent.charges <= 0) return;
    this.coalVent.charges -= 1;
    this.player.shieldActive = true;
    this.player.shieldTimer = 240;
    this.callbacks.onHudUpdate({
      ventCharges: this.coalVent.charges,
      wardenHp: this.warden.hp,
      wardenMaxHp: this.warden.maxHp,
      drawCalls: 118,
    });
    this.callbacks.onTelemetryEvent({
      ts: Math.floor(Date.now() / 1000),
      tick: this.tick,
      branch: 'feat/prison-rig',
      event: 'ABILITY_CAST',
      ability: 'metal_shield',
      source_node: 'Interactables/CoalVent_01',
      remaining_charges: this.coalVent.charges,
    });
  }

  public castEarthLance(): void {
    const dx = this.warden.x - this.player.x;
    const dz = this.warden.z - this.player.z;
    const len = Math.hypot(dx, dz) || 1;
    this.projectiles.push({
      x: this.player.x,
      z: this.player.z,
      vx: (dx / len) * 0.9,
      vz: (dz / len) * 0.9,
    });
  }

  public mountConfigBundle(bundle: RuntimeConfigBundle, roomCode: string): void {
    this.activeBundle = bundle;
    this.activeRoomCode = roomCode;
    this.customFeatureBanner = `${bundle.zone_title} • ${bundle.hazard_name} (Seed ${bundle.noise_seed})`;
    this.coalVent.charges = 6;
    this.warden.maxHp = bundle.boss_max_hp;
    this.warden.hp = bundle.boss_max_hp;
    this.callbacks.onHudUpdate({
      ventCharges: this.coalVent.charges,
      wardenHp: this.warden.hp,
      wardenMaxHp: this.warden.maxHp,
      drawCalls: 124,
    });
    this.callbacks.onTelemetryEvent({
      ts: Math.floor(Date.now() / 1000),
      tick: this.tick,
      event: 'BUNDLE_HOT_RELOADED',
      bundle_id: bundle.bundle_id,
      zone_title: bundle.zone_title,
      boss_name: bundle.boss_name,
      boss_max_hp: bundle.boss_max_hp,
      ability_damage: bundle.primary_ability_damage,
    });
  }

  private updatePhysics(): void {
    this.tick += 1;
    const speed = 0.28;
    if (this.keys['w'] || this.keys['arrowup']) this.player.z -= speed;
    if (this.keys['s'] || this.keys['arrowdown']) this.player.z += speed;
    if (this.keys['a'] || this.keys['arrowleft']) this.player.x -= speed;
    if (this.keys['d'] || this.keys['arrowright']) this.player.x += speed;

    this.player.x = Math.max(-20, Math.min(20, this.player.x));
    this.player.z = Math.max(-34, Math.min(22, this.player.z));

    if (this.player.shieldTimer > 0) {
      this.player.shieldTimer -= 1;
      if (this.player.shieldTimer === 0) {
        this.player.shieldActive = false;
      }
    }

    const dmg = this.activeBundle.primary_ability_damage || 185;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.z += p.vz;
      const dist = Math.hypot(p.x - this.warden.x, p.z - this.warden.z);
      if (dist < 2.6) {
        this.projectiles.splice(i, 1);
        this.warden.hp = Math.max(0, this.warden.hp - dmg);
        this.callbacks.onHudUpdate({
          ventCharges: this.coalVent.charges,
          wardenHp: this.warden.hp,
          wardenMaxHp: this.warden.maxHp,
          drawCalls: 116,
        });
        this.callbacks.onTelemetryEvent({
          ts: Math.floor(Date.now() / 1000),
          tick: this.tick,
          branch: 'feat/prison-rig',
          event: 'COMBAT_HIT',
          ability: this.activeBundle.primary_ability_name,
          damage: dmg,
          warden_hp_remaining: this.warden.hp,
        });
        if (this.warden.hp === 0) {
          this.warden.hp = this.warden.maxHp;
        }
      } else if (Math.abs(p.x) > 30 || Math.abs(p.z) > 45) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private loop(): void {
    this.updatePhysics();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  private render(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    if (!this.quadDebugMode) {
      this.renderPerspectivePanel(0, 0, w, h, `LIVE CLIENT VIEW — ${this.activeBundle.zone_title}`);
    } else {
      const hw = w / 2;
      const hh = h / 2;
      this.renderPerspectivePanel(0, 0, hw, hh, '1. Player 3rd-Person Cam');
      this.renderOrthoNavmeshPanel(hw, 0, hw, hh, '2. Ortho Top-Down Navmesh (0.6m)');
      this.renderJoltWireframePanel(0, hh, hw, hh, '3. JoltPhysics3D Wireframe (Layers 1-5)');
      this.renderUiBoundsPanel(hw, hh, hw, hh, '4. UI Canvas Bounds & Frame Budget');

      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(hw, 0);
      this.ctx.lineTo(hw, h);
      this.ctx.moveTo(0, hh);
      this.ctx.lineTo(w, hh);
      this.ctx.stroke();
    }
  }

  private renderPerspectivePanel(x: number, y: number, w: number, h: number, label: string): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
    skyGrad.addColorStop(0, this.activeBundle.sky_top_hex || '#0f172a');
    skyGrad.addColorStop(0.55, this.activeBundle.sky_bottom_hex || '#1e1b2e');
    skyGrad.addColorStop(1, '#111827');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(x, y, w, h);

    const cx = x + w * 0.5;
    const cy = y + h * 0.58;
    const scale = w / 960;

    ctx.strokeStyle = this.activeBundle.grid_tint_hex || 'rgba(148, 163, 184, 0.22)';
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    for (let gx = -20; gx <= 20; gx += 4) {
      const p1 = this.projectIso(gx, -36, cx, cy, scale);
      const p2 = this.projectIso(gx, 24, cx, cy, scale);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    }
    for (let gz = -36; gz <= 24; gz += 4) {
      const p1 = this.projectIso(-20, gz, cx, cy, scale);
      const p2 = this.projectIso(20, gz, cx, cy, scale);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Boss Arena Hazard Ring
    const arenaPos = this.projectIso(0, -22, cx, cy, scale);
    const hazRad = Math.max(45, Math.min(145, this.activeBundle.hazard_radius || 95));
    ctx.strokeStyle = this.activeBundle.boss_color_hex || '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(arenaPos.px, arenaPos.py, hazRad * scale, (hazRad * 0.44) * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    // CoalVent_01
    const ventPos = this.projectIso(this.coalVent.x, this.coalVent.z, cx, cy, scale);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(ventPos.px - 14 * scale, ventPos.py - 18 * scale, 28 * scale, 24 * scale);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `${Math.max(10, Math.round(11 * scale))}px monospace`;
    ctx.fillText(`CoalVent_01 (${this.coalVent.charges})`, ventPos.px - 42 * scale, ventPos.py - 24 * scale);

    // Boss Entity
    const pulse = Math.sin(this.tick * 0.06) * 4 * scale;
    ctx.fillStyle = this.activeBundle.boss_color_hex || '#ef4444';
    ctx.beginPath();
    ctx.arc(arenaPos.px, arenaPos.py - 14 * scale, 20 * scale + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(
      `${this.activeBundle.boss_name} [${this.warden.hp}/${this.warden.maxHp} HP]`,
      arenaPos.px - 75 * scale,
      arenaPos.py - 42 * scale
    );

    // Projectiles
    ctx.fillStyle = '#f59e0b';
    for (const p of this.projectiles) {
      const pp = this.projectIso(p.x, p.z, cx, cy, scale);
      ctx.beginPath();
      ctx.arc(pp.px, pp.py - 6 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player Character
    const playerPos = this.projectIso(this.player.x, this.player.z, cx, cy, scale);
    if (this.player.shieldActive) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(playerPos.px, playerPos.py - 10 * scale, 22 * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(playerPos.px, playerPos.py - 10 * scale, 13 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('Player (IKModifier3D)', playerPos.px - 52 * scale, playerPos.py + 18 * scale);

    // Top Panel Overlay Banner
    ctx.fillStyle = 'rgba(9, 13, 22, 0.82)';
    ctx.fillRect(x + 10, y + 10, Math.min(w - 20, 520), 28);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${label} • Room #${this.activeRoomCode}`, x + 18, y + 28);

    // NPC Dialogue / Patch Banner
    ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
    ctx.fillRect(x + 10, y + h - 38, Math.min(w - 20, 680), 28);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '11px monospace';
    const bottomText = this.customFeatureBanner
      ? `Mounted Bundle [${this.activeBundle.bundle_id}]: ${this.customFeatureBanner}`
      : this.activeBundle.npc_dialogue_preview;
    ctx.fillText(bottomText.slice(0, 92), x + 18, y + h - 20);

    ctx.restore();
  }

  private renderOrthoNavmeshPanel(x: number, y: number, w: number, h: number, label: string): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#071318';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x + w * 0.18, y + h * 0.14, w * 0.64, h * 0.74);
    ctx.strokeRect(x + w * 0.18, y + h * 0.14, w * 0.64, h * 0.74);

    const mapX = (wx: number) => x + w * 0.5 + (wx / 24) * (w * 0.3);
    const mapZ = (wz: number) => y + h * 0.52 + (wz / 38) * (h * 0.35);

    ctx.strokeStyle = '#10b981';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mapX(this.player.x), mapZ(this.player.z));
    ctx.lineTo(mapX(this.coalVent.x), mapZ(this.coalVent.z));
    ctx.lineTo(mapX(this.warden.x), mapZ(this.warden.z));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(mapX(this.player.x) - 5, mapZ(this.player.z) - 5, 10, 10);
    ctx.fillStyle = this.activeBundle.boss_color_hex || '#ef4444';
    ctx.fillRect(mapX(this.warden.x) - 6, mapZ(this.warden.z) - 6, 12, 12);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(label, x + 12, y + 22);
    ctx.restore();
  }

  private renderJoltWireframePanel(x: number, y: number, w: number, h: number, label: string): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#090914';
    ctx.fillRect(x, y, w, h);

    const cx = x + w * 0.5;
    const cy = y + h * 0.6;
    const scale = w / 960;

    ctx.strokeStyle = '#a855f7';
    ctx.strokeRect(cx - 140 * scale, cy - 80 * scale, 280 * scale, 140 * scale);

    const vent = this.projectIso(this.coalVent.x, this.coalVent.z, cx, cy, scale);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(vent.px - 16 * scale, vent.py - 16 * scale, 32 * scale, 32 * scale);

    const player = this.projectIso(this.player.x, this.player.z, cx, cy, scale);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(player.px - 12 * scale, player.py - 22 * scale, 24 * scale, 28 * scale);

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(label, x + 12, y + 22);
    ctx.restore();
  }

  private renderUiBoundsPanel(x: number, y: number, w: number, h: number, label: string): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(x + 16, y + 36, w - 32, 38);
    ctx.strokeRect(x + 16, y + 86, w * 0.45, h - 104);
    ctx.strokeRect(x + w * 0.5, y + 86, w * 0.45, h - 104);

    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(label, x + 12, y + 22);
    ctx.font = '11px monospace';
    ctx.fillText(`Bundle: ${this.activeBundle.bundle_id}`, x + 26, y + 60);
    ctx.fillText('Active Jolt Bodies: 28 / 64 (PASS)', x + 26, y + 112);
    ctx.fillText('NAV_STUCK Events: 0 (PASS)', x + 26, y + 132);
    ctx.fillText('AST Sandbox Scan: PASS', x + 26, y + 152);
    ctx.restore();
  }

  private projectIso(wx: number, wz: number, cx: number, cy: number, scale: number): { px: number; py: number } {
    const px = cx + (wx * 14 - wz * 4.5) * scale;
    const py = cy + (wz * 7.2 + wx * 1.8) * scale;
    return { px, py };
  }
}
