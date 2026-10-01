// Motor de plataforma — loop 60 FPS com timestep fixo, física AABB por eixo,
// câmera com folga, input de teclado + toque e eventos para a casca React.
//
// Fora do React de propósito (`GAME_DESIGN.md` §6.1): o mundo vive no closure do
// motor; o React só recebe eventos (encontro, portão, queda). Assim o HUD não
// re-renderiza por frame e o jogo não trava.

import { buildLevel, HERO_H, WORLD_H } from './level';
import {
  drawFrame,
  makeAmbientParticles,
  MAX_PARTICLES,
  PALETTES,
  type Ctx,
  type Particle,
} from './render';
import type { BiomeId, HeroRuntime, LevelGeom, NpcLookCanvas, NpcRuntime, Palette, Rect } from './types';

const DT = 1 / 60;
// ── Feel derivado de sensação (skill `jogos-game-feel` §2) ──────────────
// Altura do pulo ≈ 161 px; arco ≈ 0,67 s; alcance ≈ 224 px (> maior vão 164 px,
// com folga ≥ 20% — garantido pelo teste `clearability.test.ts`).
const GRAVITY = 2350;
/** Queda mais pesada que a subida (1,5–2×) — fim do pulo flutuante. */
const FALL_MULT = 1.55;
/** Perto do ápice a gravidade cai → "hang" para mirar o pouso. */
const APEX_HANG = 0.62;
const APEX_SPEED = 95;
const MAX_FALL = 1250;
const RUN_ACCEL = 3100;
const AIR_ACCEL = 1900;
const FRICTION = 2700;
const MAX_SPEED = 335;
const JUMP_VEL = 870;
const JUMP_CUT = 380; // velocidade mínima mantida ao soltar cedo (pulo variável)
const COYOTE = 0.1;
const JUMP_BUFFER = 0.12;
/** Correção de quina: empurra até 8 px para pousar em plataforma quase alcançada. */
const CORNER_FIX = 8;

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface NpcView {
  id: string;
  x: number;
  guardiao: boolean;
  look: NpcLookCanvas;
}

export interface PlatformerEvents {
  onEncounter?: (id: string) => void;
  onReachFinish?: () => void;
  onFall?: () => void;
  onJump?: () => void;
  onLand?: () => void;
  onStep?: () => void;
}

export interface PlatformerOptions {
  biome: BiomeId;
  levelIndex: number;
  easy: boolean;
  reducedMotion: boolean;
  npcs: NpcView[];
  events?: PlatformerEvents;
}

export interface PlatformerHandle {
  setInput(patch: Partial<InputState>): void;
  setDefeated(id: string): void;
  setFinishOpen(open: boolean): void;
  setHeroHappy(on: boolean): void;
  pause(): void;
  resume(): void;
  reset(): void;
  destroy(): void;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Existe chão firme (não plataforma) cobrindo este x? Serve de rede de retomada. */
function hasFirmGround(geom: LevelGeom, x: number): boolean {
  return geom.solids.some((s) => s.y >= geom.groundY - 2 && x >= s.x && x <= s.x + s.w);
}

/**
 * x com chão firme: o preferido, senão o mais perto.
 * Garante que o herói NUNCA nasce/respawna sobre o vazio — sem loop de queda.
 */
function safeSpawnX(geom: LevelGeom, preferred: number): number {
  if (hasFirmGround(geom, preferred)) return preferred;
  for (let d = 24; d < geom.width; d += 24) {
    if (hasFirmGround(geom, preferred + d)) return Math.min(geom.width - 40, preferred + d);
    if (hasFirmGround(geom, preferred - d)) return Math.max(30, preferred - d);
  }
  return 120;
}

export function createPlatformer(canvas: HTMLCanvasElement, opts: PlatformerOptions): PlatformerHandle {
  const ctx = canvas.getContext('2d');
  if (!ctx) return noopHandle();

  const pal: Palette = PALETTES[opts.biome];
  let geom: LevelGeom = buildLevel(opts.levelIndex, opts.easy);

  const hero: HeroRuntime = {
    x: safeSpawnX(geom, 120),
    y: geom.groundY,
    vx: 0,
    vy: 0,
    onGround: true,
    facing: 1,
    state: 'idle',
    walkPhase: 0,
    breathe: 0,
    squash: 1,
  };

  const input: InputState = { left: false, right: false, jump: false };
  let jumpBuffered = 0;
  let coyote = 0;
  let stepTimer = 0;
  let camX = 0;
  let camKick = 0;
  let time = 0;
  let suspended = false;
  let destroyed = false;
  let raf = 0;
  let lastTs = 0;
  let acc = 0;
  let finishOpen = false;
  let finishFired = false;
  let happyOverride = false;
  let safeX = hero.x;
  let logicalW = 800;
  let scale = 1;

  const defeated = new Set<string>();
  const particles: Particle[] = makeAmbientParticles(geom.width, geom.groundY, pal, Math.random);
  const npcs: NpcRuntime[] = opts.npcs.map((n, i) => ({
    id: n.id,
    x: geom.npcs[i]?.x ?? n.x,
    guardiao: n.guardiao,
    defeated: false,
    anim: 'thinking',
    look: n.look,
    phase: i * 1.3,
  }));

  /* --------------------------------- resize -------------------------------- */

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth || 640;
    const cssH = canvas.clientHeight || 480;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    scale = cssH / WORLD_H;
    logicalW = cssW / scale;
    (ctx as Ctx).setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();

  /* ---------------------------------- input -------------------------------- */

  function onKeyDown(e: KeyboardEvent) {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') {
      input.left = true;
      e.preventDefault();
    } else if (k === 'arrowright' || k === 'd') {
      input.right = true;
      e.preventDefault();
    } else if (k === ' ' || k === 'arrowup' || k === 'w') {
      if (!input.jump) jumpBuffered = JUMP_BUFFER;
      input.jump = true;
      e.preventDefault();
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') input.left = false;
    else if (k === 'arrowright' || k === 'd') input.right = false;
    else if (k === ' ' || k === 'arrowup' || k === 'w') input.jump = false;
  }
  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);

  /* --------------------------------- física -------------------------------- */

  function stepPhysics(dt: number) {
    const accel = hero.onGround ? RUN_ACCEL : AIR_ACCEL;

    if (input.left && !input.right) {
      hero.vx -= accel * dt;
      hero.facing = -1;
    } else if (input.right && !input.left) {
      hero.vx += accel * dt;
      hero.facing = 1;
    } else if (hero.onGround) {
      const s = Math.sign(hero.vx);
      hero.vx -= s * FRICTION * dt;
      if (Math.sign(hero.vx) !== s) hero.vx = 0;
    }
    hero.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, hero.vx));

    if (jumpBuffered > 0) jumpBuffered -= dt;
    if (coyote > 0) coyote -= dt;

    if (jumpBuffered > 0 && (hero.onGround || coyote > 0)) {
      hero.vy = -JUMP_VEL;
      hero.onGround = false;
      coyote = 0;
      jumpBuffered = 0;
      hero.squash = 1.16; // stretch na decolagem
      opts.events?.onJump?.();
      emitDust(hero.x, hero.y, 5);
    }
    // Pulo variável: soltar cedo baixa o ápice.
    if (!input.jump && hero.vy < -JUMP_CUT) hero.vy = -JUMP_CUT;

    // Gravidade assimétrica + apex hang: cai mais rápido do que sobe e "paira"
    // um instante no topo para a criança mirar o pouso.
    const grav =
      GRAVITY *
      (hero.vy > 0 ? FALL_MULT : 1) *
      (Math.abs(hero.vy) < APEX_SPEED ? APEX_HANG : 1);
    hero.vy = Math.min(MAX_FALL, hero.vy + grav * dt);

    // Colisão horizontal.
    hero.x += hero.vx * dt;
    const boxW = 26;
    const boxH = HERO_H;
    let box: Rect = { x: hero.x - boxW / 2, y: hero.y - boxH, w: boxW, h: boxH };
    for (const s of geom.solids) {
      if (Math.abs(s.x + s.w / 2 - hero.x) > 260) continue;
      if (!rectsOverlap(box, s)) continue;
      if (hero.vx > 0) hero.x = s.x - boxW / 2;
      else if (hero.vx < 0) hero.x = s.x + s.w + boxW / 2;
      hero.vx = 0;
      box = { x: hero.x - boxW / 2, y: hero.y - boxH, w: boxW, h: boxH };
    }
    hero.x = Math.max(30, Math.min(geom.width - 40, hero.x));

    // Corner correction: se o pouso ia falhar por 1–8 px na quina de uma
    // plataforma, empurra para cima dela ("o jogo entendeu o que eu quis").
    if (hero.vy > 0) {
      for (const s of geom.solids) {
        if (Math.abs(s.x + s.w / 2 - hero.x) > 260) continue;
        const nearTop = hero.y >= s.y - 4 && hero.y <= s.y + 12;
        const boxL = hero.x - 13;
        const boxR = hero.x + 13;
        const overlaps = boxR > s.x && boxL < s.x + s.w;
        const almost = boxR > s.x - CORNER_FIX && boxL < s.x + s.w + CORNER_FIX;
        if (nearTop && almost && !overlaps) {
          const push = boxR <= s.x + s.w / 2 ? Math.min(CORNER_FIX, s.x - boxL) : -Math.min(CORNER_FIX, boxR - (s.x + s.w));
          hero.x += push;
          hero.y = Math.min(hero.y, s.y - 1);
          hero.vy = Math.max(hero.vy, 20);
          break;
        }
      }
    }

    // Colisão vertical.
    const wasGround = hero.onGround;
    const prevVy = hero.vy;
    hero.y += hero.vy * dt;
    hero.onGround = false;
    let landedOnFirmGround = false;
    box = { x: hero.x - boxW / 2, y: hero.y - boxH, w: boxW, h: boxH };
    for (const s of geom.solids) {
      if (Math.abs(s.x + s.w / 2 - hero.x) > 260) continue;
      if (!rectsOverlap(box, s)) continue;
      if (hero.vy > 0) {
        hero.y = s.y;
        hero.vy = 0;
        hero.onGround = true;
        // Só o CHÃO FIRME vira ponto de retomada — nunca plataforma sobre o vazio.
        if (s.y >= geom.groundY - 2) landedOnFirmGround = true;
      } else if (hero.vy < 0) {
        hero.y = s.y + s.h + boxH;
        hero.vy = 0;
      }
      box = { x: hero.x - boxW / 2, y: hero.y - boxH, w: boxW, h: boxH };
    }

    if (hero.onGround) {
      if (!wasGround && prevVy > 320) {
        hero.squash = prevVy > 820 ? 0.78 : 0.86; // squash no pouso
        if (prevVy > 700) camKick = 4.5; // kick só em queda grande (proporcional)
        opts.events?.onLand?.();
        emitDust(hero.x, hero.y, 7);
      }
      if (landedOnFirmGround) safeX = hero.x;
      coyote = COYOTE;
    } else if (wasGround) {
      coyote = COYOTE;
    }

    // Passos (som de caminhada).
    if (hero.onGround && Math.abs(hero.vx) > 60) {
      hero.walkPhase += dt * 12.5;
      stepTimer -= dt;
      if (stepTimer <= 0) {
        stepTimer = 0.3;
        opts.events?.onStep?.();
        if (Math.random() < 0.5) emitDust(hero.x - hero.facing * 10, hero.y, 1);
      }
    } else {
      hero.walkPhase = 0;
      stepTimer = 0;
    }

    // Queda no buraco: volta ao último ponto SEM punição, sem queda e sem loop.
    if (hero.y > geom.groundY + 220) {
      opts.events?.onFall?.();
      hero.x = safeSpawnX(geom, safeX);
      hero.y = geom.groundY;
      hero.vx = 0;
      hero.vy = 0;
      emitDust(hero.x, geom.groundY, 8);
    }

    // Recuperação elástica do squash (mola amortecida simples).
    hero.squash += (1 - hero.squash) * Math.min(1, dt * 11);
    if (Math.abs(hero.squash - 1) < 0.004) hero.squash = 1;

    // Pose do herói.
    if (happyOverride) hero.state = 'happy';
    else if (!hero.onGround) hero.state = hero.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(hero.vx) > 30) hero.state = 'walk';
    else hero.state = 'idle';

    // Encontros com NPCs (só quando não resolvidos).
    for (const n of npcs) {
      if (n.defeated) continue;
      // Duelo só com o herói FIRME no chão — nunca com ele caindo no buraco.
      if (Math.abs(n.x - hero.x) < 44 && hero.onGround && hero.y > geom.groundY - 110) {
        n.anim = 'thinking';
        suspended = true;
        hero.state = 'idle';
        hero.vx = 0;
        opts.events?.onEncounter?.(n.id);
        break;
      }
    }

    // Portão aberto: chegada.
    if (finishOpen && !finishFired && hero.x > geom.gateX - 54) {
      finishFired = true;
      hero.vx = 0;
      hero.state = 'happy';
      opts.events?.onReachFinish?.();
    }
  }

  /** Próximo alvo da jornada: NPC mais perto ainda não resolvido, senão o portão. */
  function nextTarget(): { x: number; y: number } | null {
    let best: NpcRuntime | null = null;
    let bestD = Infinity;
    for (const n of npcs) {
      if (n.defeated) continue;
      const d = Math.abs(n.x - hero.x);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    if (best) return { x: best.x, y: geom.groundY - 132 };
    if (finishOpen) return { x: geom.gateX, y: geom.groundY - 158 };
    return null;
  }

  function emitDust(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      particles.push({
        kind: 'dust',
        x: x + (Math.random() - 0.5) * 18,
        y: y - Math.random() * 8,
        vx: (Math.random() - 0.5) * 60,
        vy: -20 - Math.random() * 40,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        size: 2 + Math.random() * 3,
        rot: 0,
        spin: 0,
        color: '#fff',
      });
    }
  }

  function stepParticles(dt: number) {
    const t = time;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        if (p.kind === 'leaf' || p.kind === 'firefly') {
          // ambiente: recicla no início do ciclo
          p.life = p.maxLife;
          p.x = camX + Math.random() * (logicalW + 200) - 100;
          p.y = 30 + Math.random() * (geom.groundY - 120);
        } else {
          particles.splice(i, 1);
          continue;
        }
      }
      if (p.kind === 'leaf') {
        p.x += (p.vx + Math.sin(t * 1.2 + p.rot) * 18) * dt;
        p.y += p.vy * dt * 0.7;
        p.rot += p.spin * dt;
        if (p.y > geom.groundY - 6) {
          p.y = geom.groundY - 6;
          p.vy *= -0.25;
        }
      } else if (p.kind === 'firefly') {
        p.x += Math.sin(t * 0.9 + p.rot * 3) * 16 * dt;
        p.y += Math.cos(t * 1.1 + p.rot * 2) * 12 * dt;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
        p.rot += p.spin * dt;
      }
    }
  }

  /* ---------------------------------- loop --------------------------------- */

  function frame(ts: number) {
    if (destroyed) return;
    raf = requestAnimationFrame(frame);
    if (!lastTs) lastTs = ts;
    const real = Math.min(0.1, (ts - lastTs) / 1000);
    lastTs = ts;

    if (!suspended) {
      acc += real;
      let steps = 0;
      while (acc >= DT && steps < 5) {
        stepPhysics(DT);
        acc -= DT;
        steps++;
      }
    }
    if (!opts.reducedMotion) time += real;
    stepParticles(real);

    // Câmera segue com folga, suave e limitada ao mundo.
    const target = Math.max(0, Math.min(geom.width - logicalW, hero.x - logicalW * 0.36));
    camX += (target - camX) * Math.min(1, real * 7);
    camKick *= 0.86; // kick decai rápido (≤ 250 ms)

    const c = ctx as Ctx;
    drawFrame({
      ctx: c,
      w: logicalW,
      h: WORLD_H,
      t: time,
      camX: camX + camKick,
      geom,
      pal,
      hero,
      npcs,
      particles,
      finishOpen,
      reducedMotion: opts.reducedMotion,
      guide: suspended ? null : nextTarget(),
      biome: opts.biome,
    });
  }
  raf = requestAnimationFrame(frame);

  /* ---------------------------------- API ---------------------------------- */

  return {
    setInput(patch) {
      if (patch.jump && !input.jump) jumpBuffered = JUMP_BUFFER;
      Object.assign(input, patch);
    },
    setDefeated(id) {
      defeated.add(id);
      const n = npcs.find((v) => v.id === id);
      if (n) {
        n.defeated = true;
        n.anim = 'happy';
      }
      // O NPC vencido vira checkpoint.
      if (n) safeX = Math.max(safeX, n.x - 20);
    },
    setFinishOpen(open) {
      finishOpen = open;
    },
    setHeroHappy(on) {
      happyOverride = on;
    },
    pause() {
      suspended = true;
    },
    resume() {
      suspended = false;
      lastTs = 0;
    },
    reset() {
      geom = buildLevel(opts.levelIndex, opts.easy);
      hero.x = safeSpawnX(geom, 120);
      hero.y = geom.groundY;
      hero.vx = 0;
      hero.vy = 0;
      hero.state = 'idle';
      hero.facing = 1;
      safeX = hero.x;
      finishOpen = false;
      finishFired = false;
      happyOverride = false;
      defeated.clear();
      npcs.forEach((n, i) => {
        n.defeated = false;
        n.anim = 'thinking';
        n.x = geom.npcs[i]?.x ?? n.x;
      });
      suspended = false;
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
}

function noopHandle(): PlatformerHandle {
  return {
    setInput() {},
    setDefeated() {},
    setFinishOpen() {},
    setHeroHappy() {},
    pause() {},
    resume() {},
    reset() {},
    destroy() {},
  };
}
