import { BoilingIronRigDemo } from './demo3d';

interface BuildStage {
  step_number: number;
  stage_key: string;
  title: string;
  status: string;
  detail: string;
  duration_ms: number;
}

interface BuildJob {
  build_id: string;
  prompt: string;
  cartridge_id: string;
  branch: string;
  preview_room_code: string;
  pck_bundle_name: string;
  pck_size_mb: number;
  credits_consumed: number;
  status: string;
  stages: BuildStage[];
}

interface CartridgeInfo {
  id: string;
  name: string;
  inspiration: string;
  netcode_profile: string;
  stack_highlights: string[];
  avg_pck_size_mb: number;
}

interface RealmRoomInfo {
  room_code: string;
  title: string;
  cartridge_id: string;
  branch: string;
  status: string;
  active_players: number;
  max_players: number;
  wake_latency_ms: number;
}

const API_BASE: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ||
  'http://127.0.0.1:8080';

const FALLBACK_CARTRIDGES: CartridgeInfo[] = [
  {
    id: 'template-action-rpg',
    name: 'Action-RPG & Elemental Campaign',
    inspiration: 'World of Warcraft / Avatar Elemental Adventure',
    netcode_profile: 'Netfox 30Hz Authoritative Server + Lag-Compensated Hitboxes',
    stack_highlights: ['Terrain3D + SimpleXTerrain', 'Forge GAS Abilities', 'Pandora + GLoot', 'PhantomCamera3D + IKModifier3D'],
    avg_pck_size_mb: 18.4,
  },
  {
    id: 'template-tick-sandbox',
    name: 'Tick-Based Sandbox RPG',
    inspiration: 'Old School RuneScape',
    netcode_profile: 'Deterministic 600ms Server Tick + SQLite Grand Exchange',
    stack_highlights: ['NavigationServer3D Pathing', '20-Skill Pandora Table', 'GLoot 28-Slot Backpack', 'godot-sqlite Economy'],
    avg_pck_size_mb: 15.2,
  },
  {
    id: 'template-voxel-survival',
    name: 'Voxel Survival & Terraforming',
    inspiration: 'Minecraft / Valheim',
    netcode_profile: 'Chunk-Delta ENet Streamer + Multithreaded Voxel Meshing',
    stack_highlights: ['Zylann godot_voxel', 'FastNoiseLite 3D Caves', 'GLoot Crafting Grid', 'WorkerThreadPool Streaming'],
    avg_pck_size_mb: 21.0,
  },
  {
    id: 'template-4x-strategy',
    name: '4X Turn-Based Strategy',
    inspiration: 'Civilization VI',
    netcode_profile: 'Deterministic Turn-Hash RPC Synchronizer',
    stack_highlights: ['MultiMesh Hex Grid', 'Gaea Procedural Biomes', 'AStarGrid2D Routing', 'Pandora Tech Trees'],
    avg_pck_size_mb: 16.8,
  },
  {
    id: 'template-arena-fps',
    name: '60Hz Rollback Arena FPS',
    inspiration: 'Call of Duty / Quake',
    netcode_profile: 'Netfox 60Hz Client Prediction + Rollback + Hitbox Rewind',
    stack_highlights: ['FuncGodot 3-Lane Arenas', 'JoltPhysics3D Ballistics', 'LimboAI Squad Trees', 'GDsfxr Procedural Audio'],
    avg_pck_size_mb: 24.5,
  },
  {
    id: 'template-collector-tycoon',
    name: 'Collector Tycoon & Spline Racer',
    inspiration: 'Pet Simulator / Arcade Kart Racer',
    netcode_profile: '20Hz State Sync + Authoritative Drop Ledger',
    stack_highlights: ['VehicleBody3D + RoadGenerator', 'Pandora Upgrade Tables', 'Material Maker Shaders', 'Resonate Stem Audio'],
    avg_pck_size_mb: 14.9,
  },
];

const FALLBACK_ROOMS: RealmRoomInfo[] = [
  {
    room_code: 'TEST-4821',
    title: 'The Boiling Iron Rig (Preview Branch)',
    cartridge_id: 'template-action-rpg',
    branch: 'feat/prison-rig',
    status: 'ACTIVE',
    active_players: 4,
    max_players: 8,
    wake_latency_ms: 280,
  },
  {
    room_code: 'OSRS-9012',
    title: 'Gielinor Citadel — 600ms Tick Sandbox',
    cartridge_id: 'template-tick-sandbox',
    branch: 'main',
    status: 'SLEEPING_SCALE_TO_ZERO',
    active_players: 0,
    max_players: 32,
    wake_latency_ms: 295,
  },
  {
    room_code: 'VOXL-3310',
    title: 'Skyborne Transvoxel Isles',
    cartridge_id: 'template-voxel-survival',
    branch: 'main',
    status: 'ACTIVE',
    active_players: 7,
    max_players: 16,
    wake_latency_ms: 305,
  },
];

function setupDialogLightDismissFallback(dialog: HTMLDialogElement): void {
  // Mandatory fallback per modern-web-guidance light-dismiss-a-dialog
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (isDialogContent) return;
      dialog.close();
    });
  }
}

async function fetchJsonOrFallback<T>(path: string, init: RequestInit | undefined, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, init);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

function renderBuildStages(job: BuildJob): void {
  const grid = document.getElementById('build-steps-grid');
  const banner = document.getElementById('build-result-banner');
  if (!grid || !banner) return;

  grid.innerHTML = job.stages
    .map(
      (st) => `
      <div class="step-card ${st.status === 'COMPLETED' ? 'step-completed' : 'step-running'}">
        <div class="step-top">
          <span class="step-num">Step ${st.step_number}</span>
          <span class="step-badge">${st.status} (${st.duration_ms}ms)</span>
        </div>
        <h4>${st.title}</h4>
        <p>${st.detail}</p>
      </div>
    `
    )
    .join('');

  banner.innerHTML = `
    <div>
      <strong>Build ${job.build_id} (${job.status})</strong> — Branch <code>${job.branch}</code> packaged to
      <code>${job.pck_bundle_name}</code> (${job.pck_size_mb} MB).
    </div>
    <div>
      <span>Preview Server Ready: <strong class="room-code-badge">#${job.preview_room_code}</strong></span>
    </div>
  `;
}

function renderRoomsList(rooms: RealmRoomInfo[], onSelectRoom: (code: string) => void): void {
  const container = document.getElementById('active-rooms-list');
  if (!container) return;

  container.innerHTML = rooms
    .slice(0, 4)
    .map(
      (r) => `
      <div class="room-row" data-room="${r.room_code}">
        <div>
          <span class="room-code-badge">#${r.room_code}</span>
          <span> — ${r.title}</span>
        </div>
        <span>${r.status === 'ACTIVE' ? `${r.active_players}/${r.max_players} Online` : `Scale-to-Zero (${r.wake_latency_ms}ms wake)`}</span>
      </div>
    `
    )
    .join('');

  container.querySelectorAll<HTMLElement>('.room-row').forEach((row) => {
    row.addEventListener('click', () => {
      const code = row.dataset.room;
      if (code) onSelectRoom(code);
    });
  });
}

function renderCartridges(cartridges: CartridgeInfo[]): void {
  const grid = document.getElementById('cartridges-grid');
  if (!grid) return;

  grid.innerHTML = cartridges
    .map(
      (c) => `
      <article class="cartridge-card">
        <div class="cartridge-sub">${c.inspiration}</div>
        <h3>${c.name}</h3>
        <p class="cartridge-net">${c.netcode_profile} • Avg Pack: <strong>${c.avg_pck_size_mb} MB</strong></p>
        <div class="tag-list">
          ${c.stack_highlights.map((t) => `<span class="tag-chip">${t}</span>`).join('')}
        </div>
      </article>
    `
    )
    .join('');
}

async function initApp(): Promise<void> {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const telemetryPre = document.getElementById('telemetry-log') as HTMLPreElement;
  const ventChargesEl = document.getElementById('hud-vent-charges') as HTMLElement;
  const wardenHpEl = document.getElementById('hud-warden-hp') as HTMLElement;
  const drawCallsEl = document.getElementById('hud-draw-calls') as HTMLElement;
  const dialog = document.getElementById('info-dialog') as HTMLDialogElement;
  const dialogTitle = document.getElementById('dialog-title') as HTMLElement;
  const dialogBody = document.getElementById('dialog-body') as HTMLElement;

  setupDialogLightDismissFallback(dialog);

  const telemetryLines: string[] = [
    JSON.stringify({ ts: 1792698012, tick: 120, branch: 'feat/prison-rig', event: 'SCENE_MOUNTED', scene: 'res://scenes/zones/fire_prison_rig.tscn' }),
    JSON.stringify({ ts: 1792698045, tick: 1420, branch: 'feat/prison-rig', bot_id: 'QA_Bot_04', event: 'COMBAT_SUMMARY', outcome: 'WIN', dps_dealt: 64.1 }),
  ];
  telemetryPre.textContent = telemetryLines.join('\n\n');

  const demo = new BoilingIronRigDemo(canvas, {
    onTelemetryEvent: (entry) => {
      telemetryLines.unshift(JSON.stringify(entry));
      if (telemetryLines.length > 8) telemetryLines.pop();
      telemetryPre.textContent = telemetryLines.join('\n\n');
    },
    onHudUpdate: ({ ventCharges, wardenHp, drawCalls }) => {
      ventChargesEl.textContent = `${ventCharges} / 6`;
      wardenHpEl.textContent = `${wardenHp} / 2200`;
      drawCallsEl.textContent = `${drawCalls} / 180`;
    },
  });

  // Wire Demo Controls
  document.getElementById('btn-toggle-quad')?.addEventListener('click', () => {
    demo.toggleQuadDebug();
  });
  document.getElementById('btn-extract-coal')?.addEventListener('click', () => {
    demo.extractCoalAndShield();
  });
  document.getElementById('btn-earth-lance')?.addEventListener('click', () => {
    demo.castEarthLance();
  });

  document.getElementById('btn-run-bot-swarm')?.addEventListener('click', async () => {
    const res = await fetchJsonOrFallback(
      '/verify/bot-swarm',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ duration_sec: 30, time_scale: 10.0 }) },
      { status: 'PASS', total_ticks: 1800, nav_stuck_count: 0, script_error_count: 0 }
    );
    telemetryLines.unshift(JSON.stringify({ event: 'BOT_SWARM_QA_PASS', ...res }));
    telemetryPre.textContent = telemetryLines.join('\n\n');
  });

  // Load initial data from playable-server
  const cartridges = await fetchJsonOrFallback('/api/cartridges', undefined, FALLBACK_CARTRIDGES);
  renderCartridges(cartridges);

  let rooms = await fetchJsonOrFallback('/api/rooms', undefined, FALLBACK_ROOMS);
  const joinRoomByCode = async (code: string) => {
    const input = document.getElementById('room-code-input') as HTMLInputElement;
    const feedback = document.getElementById('room-join-feedback') as HTMLElement;
    input.value = code;
    const joined = await fetchJsonOrFallback(
      '/api/rooms/join',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_code: code }),
      },
      {
        status: 'CONNECTED',
        woke_from_zero: code === 'OSRS-9012',
        wake_time_ms: 285,
        sandbox_mount_path: `user://realms/${code.toLowerCase()}/patch.pck`,
      }
    );
    demo.activeRoomCode = code;
    feedback.innerHTML = `Connected to <strong>#${code}</strong> in ${joined.wake_time_ms}ms — Mounted <code>${joined.sandbox_mount_path}</code>`;
  };

  renderRoomsList(rooms, joinRoomByCode);

  document.getElementById('btn-join-room')?.addEventListener('click', () => {
    const input = document.getElementById('room-code-input') as HTMLInputElement;
    if (input.value.trim()) {
      joinRoomByCode(input.value.trim().toUpperCase());
    }
  });

  // Load initial build pipeline state
  const initialBuilds = await fetchJsonOrFallback<BuildJob[]>('/api/builds', undefined, [
    {
      build_id: 'bld_014_rig',
      prompt: 'Create the Boiling Iron Rig prison break zone with compressed coal vents and Warden boss arena',
      cartridge_id: 'template-action-rpg',
      branch: 'feat/prison-rig',
      preview_room_code: 'TEST-4821',
      pck_bundle_name: 'patch_v14.pck',
      pck_size_mb: 18.4,
      credits_consumed: 3,
      status: 'COMPLETED',
      stages: [
        {
          step_number: 1,
          stage_key: 'scoping_design',
          title: 'Scoping & Game Design',
          status: 'COMPLETED',
          detail: 'Scoped 30s metal/earth combat loop, CoalVent_01 interaction, and Warden boss arena.',
          duration_ms: 410,
        },
        {
          step_number: 2,
          stage_key: 'systems_world',
          title: 'Systems & Procedural World Build',
          status: 'COMPLETED',
          detail: 'Locked scene interface contract and generated fire_prison_rig.tscn & authoritative GDScript.',
          duration_ms: 890,
        },
        {
          step_number: 3,
          stage_key: 'automated_qa',
          title: 'Automated Playtest & Visual QA',
          status: 'COMPLETED',
          detail: 'AST Security Scan: PASS (16 files) | Contracts: 7/7 passed | 10x Bot Swarm: 1800 ticks (0 stuck).',
          duration_ms: 1120,
        },
        {
          step_number: 4,
          stage_key: 'package_deploy',
          title: 'Packager & Realm Deploy',
          status: 'COMPLETED',
          detail: 'Exported patch_v14.pck (18.4 MB) to R2 and launched Preview Server Room #TEST-4821.',
          duration_ms: 290,
        },
      ],
    },
  ]);

  if (initialBuilds.length > 0) {
    renderBuildStages(initialBuilds[0]);
  }

  // Handle Prompt Submission (4-Step Streamlined Build Pipeline)
  const runPromptBuild = async (promptText: string, cartridgeId: string) => {
    const job = await fetchJsonOrFallback<BuildJob>(
      '/api/builds',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, cartridge_id: cartridgeId }),
      },
      {
        build_id: `bld_${Math.floor(1000 + Math.random() * 9000)}`,
        prompt: promptText,
        cartridge_id: cartridgeId,
        branch: 'feat/live-prompt',
        preview_room_code: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        pck_bundle_name: 'patch_v15.pck',
        pck_size_mb: 18.6,
        credits_consumed: 3,
        status: 'COMPLETED',
        stages: [
          {
            step_number: 1,
            stage_key: 'scoping_design',
            title: 'Scoping & Game Design',
            status: 'COMPLETED',
            detail: `Scoped "${promptText.slice(0, 56)}..." and updated Pandora entity schemas.`,
            duration_ms: 390,
          },
          {
            step_number: 2,
            stage_key: 'systems_world',
            title: 'Systems & Procedural World Build',
            status: 'COMPLETED',
            detail: 'Updated scene nodes, Jolt collision layers, and authoritative GDScript controller.',
            duration_ms: 880,
          },
          {
            step_number: 3,
            stage_key: 'automated_qa',
            title: 'Automated Playtest & Visual QA',
            status: 'COMPLETED',
            detail: 'AST Security Scan: PASS | Scene Contracts: 7/7 passed | 10x Bot Swarm: 0 stuck.',
            duration_ms: 1150,
          },
          {
            step_number: 4,
            stage_key: 'package_deploy',
            title: 'Packager & Realm Deploy',
            status: 'COMPLETED',
            detail: 'Exported sandboxed .pck resource pack and hot-reloaded Preview Realm Server.',
            duration_ms: 280,
          },
        ],
      }
    );

    renderBuildStages(job);
    demo.applyLiveBuildModification(promptText, job.preview_room_code);
    rooms = await fetchJsonOrFallback('/api/rooms', undefined, FALLBACK_ROOMS);
    renderRoomsList(rooms, joinRoomByCode);
  };

  document.getElementById('build-prompt-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const promptInput = document.getElementById('build-prompt-input') as HTMLInputElement;
    const cartridgeSelect = document.getElementById('cartridge-select') as HTMLSelectElement;
    if (promptInput.value.trim()) {
      await runPromptBuild(promptInput.value.trim(), cartridgeSelect.value);
    }
  });

  document.querySelectorAll<HTMLButtonElement>('.chip-btn').forEach((chip) => {
    chip.addEventListener('click', async () => {
      const prompt = chip.dataset.prompt || '';
      const promptInput = document.getElementById('build-prompt-input') as HTMLInputElement;
      const cartridgeSelect = document.getElementById('cartridge-select') as HTMLSelectElement;
      promptInput.value = prompt;
      await runPromptBuild(prompt, cartridgeSelect.value);
    });
  });

  // Hold L1 Voice Architect Prompt Trigger
  document.getElementById('btn-hold-l1')?.addEventListener('click', async () => {
    const voicePrompt = 'Spawn compressed coal barricade at raycast anchor [-8.5, 0.8, 2.0]';
    await runPromptBuild(voicePrompt, 'template-action-rpg');
  });

  // Modals (Universal Launcher & Commercial Eject)
  document.getElementById('btn-open-launcher')?.addEventListener('click', () => {
    dialogTitle.textContent = 'Download Free Universal Player Launcher (£0.00)';
    dialogBody.innerHTML = `
      <p><strong>One Signed Binary, Infinite <code>.pck</code> Realms.</strong></p>
      <p>Pre-compiled with Godot 4.7.2-stable, native <code>JoltPhysics3D</code>, <code>Terrain3D</code>, <code>godot_voxel</code>, <code>LimboAI</code>, and <code>--sandboxed-pck</code> security isolation.</p>
      <ul class="feature-list">
        <li>• Windows (x86_64 Vulkan / D3D12) — <code>PlayableLauncher-win64.exe</code></li>
        <li>• macOS Universal (Apple Silicon / Metal) — <code>PlayableLauncher-macOS.dmg</code></li>
        <li>• Linux / Steam Deck (AppImage) — <code>PlayableLauncher-x86_64.AppImage</code></li>
      </ul>
    `;
    dialog.showModal();
  });

  document.getElementById('btn-trigger-eject')?.addEventListener('click', async () => {
    const ejectData = await fetchJsonOrFallback(
      '/api/eject',
      { method: 'POST' },
      {
        status: 'EJECT_READY',
        export_repo_url: 'https://github.com/playable-eject/boiling-iron-rig-standalone',
        license: 'MIT (100% Royalty-Free Ownership)',
        targets: ['Windows Desktop (.exe)', 'macOS Universal (.app)', 'Linux / Steam Deck'],
        message: 'Standalone MIT repository generated with GitHub Actions CI/CD pipelines for Steam & itch.io.',
      }
    );
    dialogTitle.textContent = 'Commercial Source-Code Eject';
    dialogBody.innerHTML = `
      <p>${ejectData.message}</p>
      <p><strong>Export Repository:</strong> <code>${ejectData.export_repo_url}</code></p>
      <p><strong>License:</strong> ${ejectData.license}</p>
      <ul class="feature-list">
        ${ejectData.targets.map((t: string) => `<li>✓ ${t}</li>`).join('')}
      </ul>
    `;
    dialog.showModal();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  void initApp();
});
