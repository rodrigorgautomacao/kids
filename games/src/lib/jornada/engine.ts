// Laço da "A Grande Jornada": timestep fixo 60 FPS, câmera, entidades e eventos.
// O estado do mundo vive AQUI (dentro do laço) — nunca em `useState` do React.

import {
  BUG_FLEE_DIST,
  BUG_FLEE_SPEED,
  CAMERA_LERP,
  COMUNHAO_DRAIN,
  COMUNHAO_DRAIN_SMALL_KIDS,
  LIGHT_BASE,
  LIGHT_MAX,
  LIGHT_PER_SEED,
  PLAYER_H,
  PLAYER_W,
  RUN_MAX,
  RUN_MAX_SMALL_KIDS,
  SEEDS_TO_BREAK,
  SPIKE_SPEED,
  STOMP_BOUNCE,
  TILE,
  VIEW_H,
  VIEW_W,
} from './constants';
import { createPlayer, stepPlayer } from './physics';
import { isSolid, parseMap, type TileMap } from './tiles';
import type { EngineEvent, EnemyState, InputState, PlatformerLevel, PlayerState } from './types';
import { drawScene, type Scene } from './render';

const FIXED_DT = 1 / 60;

interface Pickup {
  x: number;
  y: number;
  got: boolean;
}

export interface EngineOptions {
  smallKids: boolean;
  reducedMotion: boolean;
  onEvent: (e: EngineEvent) => void;
}

export class JornadaEngine {
  private map: TileMap;
  private player: PlayerState;
  private enemies: EnemyState[] = [];
  private seeds: Pickup[] = [];
  private shields: Pickup[] = [];
  private rocksUsed = new Set<string>();
  private checkpointsDone = new Set<string>();
  private detourSeen = false;
  private checkpoint: { x: number; y: number };
  private seedCount = 0;
  private comunhao = 1;
  private lightLevel = 1;
  private camX = 0;
  private camY = 0;
  private input: InputState = { left: false, right: false, jump: false, jumpPressed: false };
  private raf = 0;
  private last = 0;
  private acc = 0;
  private running = false;
  private paused = false;
  private finished = false;
  private flash = 0;
  private readonly opts: EngineOptions;
  readonly level: PlatformerLevel;
  /** A casca React cola o canvas aqui (sem re-render por frame). */
  canvas: HTMLCanvasElement | null = null;

  constructor(level: PlatformerLevel, opts: EngineOptions) {
    this.level = level;
    this.opts = opts;
    this.map = parseMap(level.map);
    this.checkpoint = this.map.checkpoints[0]
      ? { x: this.map.checkpoints[0].x, y: this.map.checkpoints[0].y }
      : { x: TILE * 2, y: TILE * 2 };
    // Pés exatamente no chão — o herói NUNCA cai do céu ao nascer.
    this.player = createPlayer(this.checkpoint.x, groundTopBelow(this.map, this.checkpoint.x, this.checkpoint.y) - PLAYER_H);
    // O primeiro Marco já é o ponto de partida — não dispara evento ao nascer.
    this.checkpointsDone.add(`${this.checkpoint.x},${this.checkpoint.y}`);
    this.enemies = this.map.spawns.map((s) => ({
      kind: s.kind,
      x: s.x + 3,
      y: s.y,
      vx: s.kind === 'spike' ? SPIKE_SPEED : 0,
      w: s.kind === 'despair' ? TILE * 1.6 : TILE * 0.85,
      h: s.kind === 'despair' ? TILE * 2.2 : TILE * 0.8,
      transformed: false,
      timer: 0,
      grow: 0,
    }));
    this.seeds = this.map.seeds.map((s) => ({ x: s.x, y: s.y, got: false }));
    this.shields = this.map.shields.map((s) => ({ x: s.x, y: s.y, got: false }));
    this.camX = clamp(this.player.x, VIEW_W / 2, this.pixelWidth() - VIEW_W / 2);
    this.camY = clamp(this.player.y, VIEW_H / 2, this.pixelHeight() - VIEW_H / 2);
  }

  /* ------------------------------ ciclo de vida ---------------------------- */

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.last = performance.now();
  }

  restart() {
    const fresh = new JornadaEngine(this.level, this.opts);
    this.map = fresh.map;
    this.player = fresh.player;
    this.enemies = fresh.enemies;
    this.seeds = fresh.seeds;
    this.shields = fresh.shields;
    this.rocksUsed.clear();
    this.checkpointsDone.clear();
    this.detourSeen = false;
    this.checkpoint = fresh.checkpoint;
    this.seedCount = 0;
    this.comunhao = 1;
    this.lightLevel = 1;
    this.finished = false;
    this.flash = 0;
    this.camX = fresh.camX;
    this.camY = fresh.camY;
    this.emit({ type: 'message', text: 'De novo, sem pressa — cada passo conta!' });
  }

  /* --------------------------------- input -------------------------------- */

  setMove(left: boolean, right: boolean) {
    this.input.left = left;
    this.input.right = right;
  }

  setJump(down: boolean) {
    if (down && !this.input.jump) this.input.jumpPressed = true;
    this.input.jump = down;
  }

  /** Oração: 1 toque = 100% da Comunhão (sem mash, sem custo). */
  pray() {
    if (this.finished) return;
    this.comunhao = 1;
    this.lightLevel = 1;
    this.emit({ type: 'pray' });
    this.emit({ type: 'message', text: 'A luz acendeu! Agora dá para enxergar o caminho.' });
  }

  /** Canto (Jericó): derruba "O Muro que Cai" por perto. Nunca por oração. */
  canto() {
    if (this.finished) return;
    this.emit({ type: 'canto' });
    const px = this.player.x + PLAYER_W / 2;
    const py = this.player.y + PLAYER_H / 2;
    let dropped = false;
    for (let ty = 0; ty < this.map.height; ty++) {
      for (let tx = 0; tx < this.map.width; tx++) {
        if (this.map.grid[ty][tx] !== 'w') continue;
        const cx = tx * TILE + TILE / 2;
        const cy = ty * TILE + TILE / 2;
        if (Math.abs(cx - px) < TILE * 2.5 && Math.abs(cy - py) < TILE * 2.5) {
          this.map.grid[ty][tx] = '.';
          dropped = true;
        }
      }
    }
    if (dropped) {
      this.flash = 1;
      this.emit({ type: 'muro' });
      this.emit({ type: 'message', text: 'O muro caiu com o canto! (Jos 6.4-5)' });
    }
  }

  getSeedCount() {
    return this.seedCount;
  }

  /* --------------------------------- laço --------------------------------- */

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    const dtMs = Math.min(now - this.last, 100);
    this.last = now;
    if (this.paused || this.finished) {
      this.paint();
      return;
    }
    this.acc += dtMs / 1000;
    while (this.acc >= FIXED_DT) {
      this.step(FIXED_DT);
      this.acc -= FIXED_DT;
      this.input.jumpPressed = false;
    }
    this.paint();
  };

  private step(dt: number) {
    const maxSpeed = this.opts.smallKids ? RUN_MAX_SMALL_KIDS : RUN_MAX;

    // Modo pequeninos: pula sozinho quando há parede à frente.
    if (this.opts.smallKids && this.player.onGround && (this.input.left || this.input.right)) {
      const aheadX = this.player.x + (this.input.right ? PLAYER_W + 6 : -6);
      if (isSolid(this.map, aheadX, this.player.y + PLAYER_H - 8)) {
        this.input.jumpPressed = true;
      }
    }
    // Modo pequeninos: a oração é automática (ninguém é punido por não entender).
    if (this.opts.smallKids && this.comunhao < 0.5) this.pray();

    const res = stepPlayer(this.map, this.player, this.input, dt, maxSpeed);
    this.player = res.player;

    if (res.headBonk) this.bumpRock();

    // Comunhão esvazia devagar (o "Sono do Coração" apaga a luz, nunca tira nada).
    const drain = this.opts.smallKids ? COMUNHAO_DRAIN_SMALL_KIDS : COMUNHAO_DRAIN;
    this.comunhao = Math.max(0, this.comunhao - drain * dt);
    const targetLight = this.comunhao > 0.02 ? 1 : 0;
    this.lightLevel += (targetLight - this.lightLevel) * Math.min(1, dt * 2.2);

    this.stepEnemies(dt);
    this.pickups();
    this.triggers();
    this.camera(dt);

    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2);
    if (res.landed && this.player.vy === 0) this.flash = Math.max(this.flash, 0.12);
  }

  /* -------------------------------- entidades ------------------------------ */

  private stepEnemies(dt: number) {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.transformed) {
        e.timer += dt;
        continue;
      }
      if (e.kind === 'spike') {
        e.x += e.vx * dt;
        const frontX = e.x + (e.vx > 0 ? e.w + 2 : -2);
        const wall = isSolid(this.map, frontX, e.y + e.h / 2);
        const edge = !isSolid(this.map, frontX, e.y + e.h + 6);
        if (wall || edge) {
          e.vx *= -1;
          e.x += e.vx * dt * 2;
        }
      } else if (e.kind === 'bug') {
        const dx = e.x - p.x;
        if (Math.abs(dx) < BUG_FLEE_DIST && Math.abs(e.y - p.y) < TILE * 2) {
          e.vx = Math.sign(dx || 1) * BUG_FLEE_SPEED;
          e.x += e.vx * dt;
          if (isSolid(this.map, e.x + (e.vx > 0 ? e.w + 2 : -2), e.y + e.h / 2)) e.vx = 0;
        } else {
          e.vx *= 0.9;
        }
      } else if (e.kind === 'despair') {
        // Senta na estrada e cresce quando a criança hesita (perto e parada).
        const near = Math.abs(e.x - p.x) < TILE * 4;
        const still = Math.abs(p.vx) < 12;
        e.grow = clamp(e.grow + (near && still ? dt * 0.35 : -dt * 0.25), 0, 1);
        // Passagem: com Escudo ou com luz (2+ sementes) — nunca com força.
        // Quem pula POR CIMA passa livre (nunca trancar a criança — sem soft-lock).
        const overTop = p.y + PLAYER_H <= e.y + e.h * 0.4;
        const touching =
          !overTop && overlap(p.x, p.y, PLAYER_W, PLAYER_H, e.x, e.y, e.w, e.h + e.grow * 20);
        if (touching) {
          if (p.shield) {
            p.shield = false;
            e.transformed = true;
            this.emit({ type: 'shield' });
            this.emit({ type: 'message', text: 'O Escudo da Fé guardou você! (Ef 6.16)' });
          } else if (this.seedCount >= SEEDS_TO_BREAK) {
            e.transformed = true;
            this.emit({ type: 'message', text: 'A luz mostrou a passagem. Continue firme!' });
          } else {
            p.vx = 0;
            this.emit({
              type: 'message',
              text: 'Quase parou, mas não parou! Procure a Semente (a luz) para passar.',
            });
          }
        }
      }

      // Contato: o que "vence" é obstáculo neutro — volta ao Marco, sem perder nada.
      if (!e.transformed && e.kind !== 'snake' && e.kind !== 'despair') {
        const touching = overlap(p.x, p.y, PLAYER_W, PLAYER_H, e.x, e.y, e.w, e.h);
        if (!touching) continue;
        const stomp = p.vy > 40 && p.y + PLAYER_H - e.y < e.h * 0.75;
        if (stomp) {
          e.transformed = true;
          e.timer = 0;
          p.vy = STOMP_BOUNCE;
          this.flash = 0.8;
          this.emit({ type: 'stomp' });
          this.emit(e.kind === 'spike' ? { type: 'flower' } : { type: 'stomp' });
        } else if (p.shield) {
          p.shield = false;
          e.timer = 2.5; // o espinho "dorme" um pouco
          this.emit({ type: 'shield' });
          this.emit({ type: 'message', text: 'O Escudo da Fé guardou você! (Ef 6.16)' });
        } else {
          this.fall('Um tropeço! Volta um pouquinho e tenta de novo — sem pressa.');
        }
      }
    }
  }

  private bumpRock() {
    // "A Rocha que Responde": bater por baixo dá exatamente o que falta (uma vez).
    const px = this.player.x + PLAYER_W / 2;
    const headY = this.player.y - 2;
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(headY / TILE);
    if (ty < 0 || tx < 0 || ty >= this.map.height || tx >= this.map.width) return;
    const key = `${tx},${ty}`;
    if (this.map.grid[ty][tx] !== '?' || this.rocksUsed.has(key)) return;
    this.rocksUsed.add(key);
    this.map.grid[ty][tx] = '#';
    if (!this.player.shield) {
      this.player.shield = true;
      this.emit({ type: 'shield' });
    } else {
      this.addSeed();
    }
    this.emit({ type: 'rocha' });
    this.emit({
      type: 'message',
      text: 'A Rocha que Responde! Você recebeu o que faltava. (Êx 17.1-7)',
    });
  }

  private pickups() {
    const p = this.player;
    for (const s of this.seeds) {
      if (s.got) continue;
      if (overlap(p.x, p.y, PLAYER_W, PLAYER_H, s.x + 4, s.y + 4, TILE - 8, TILE - 8)) {
        s.got = true;
        this.addSeed();
      }
    }
    for (const s of this.shields) {
      if (s.got) continue;
      if (overlap(p.x, p.y, PLAYER_W, PLAYER_H, s.x + 4, s.y + 4, TILE - 8, TILE - 8)) {
        s.got = true;
        this.player.shield = true;
        this.flash = 0.6;
        this.emit({ type: 'shield' });
        this.emit({ type: 'message', text: 'Escudo da Fé! Ele guarda um passo seu. (Ef 6.16)' });
      }
    }
  }

  private addSeed() {
    this.seedCount += 1;
    this.comunhao = Math.min(1, this.comunhao + 0.25);
    this.flash = 0.7;
    this.emit({ type: 'seed', total: this.seedCount });
  }

  private triggers() {
    const p = this.player;

    // Queda na vala: volta ao Marco, sem perder semente/selo/estrela.
    if (p.y > this.pixelHeight() + 40) {
      this.fall('A vala abriu! Você volta ao Marco — nada do que você pegou foi perdido.');
      return;
    }

    for (const c of this.map.checkpoints) {
      const key = `${c.x},${c.y}`;
      if (this.checkpointsDone.has(key)) continue;
      if (overlap(p.x, p.y, PLAYER_W, PLAYER_H, c.x, c.y, TILE, TILE)) {
        this.checkpointsDone.add(key);
        this.checkpoint = { x: c.x, y: c.y };
        this.emit({ type: 'checkpoint' });
        this.emit({ type: 'message', text: 'Rocha do Marco! Seu caminho fica guardado. (Gn 28.18-22)' });
      }
    }

    // A Cancelinha: aparece com a luz; entrar é permitido, voltar é sem custo.
    if (!this.detourSeen && this.lightLevel > 0.5) {
      for (const d of this.map.detours) {
        if (overlap(p.x, p.y, PLAYER_W, PLAYER_H, d.x, d.y, TILE, TILE)) {
          this.detourSeen = true;
          this.emit({ type: 'detour' });
          this.emit({
            type: 'message',
            text: 'Esse caminho termina onde não tem caminho. Volta para a Estrada — e leva suas sementes junto.',
          });
          break;
        }
      }
    }

    // O Portão — fim de etapa.
    if (
      this.map.gate &&
      overlap(p.x, p.y, PLAYER_W, PLAYER_H, this.map.gate.x, this.map.gate.y, TILE, TILE * 1.5)
    ) {
      this.finished = true;
      this.emit({ type: 'gate' });
    }
  }

  private fall(message: string) {
    const p = this.player;
    if (p.shield) {
      // Escudo: segura o golpe, só recua um passo (punição única).
      p.shield = false;
      p.vy = -220;
      this.emit({ type: 'shield' });
      this.emit({ type: 'message', text: 'O Escudo da Fé segurou! Continue de onde você está.' });
      return;
    }
    p.x = this.checkpoint.x;
    p.y = groundTopBelow(this.map, p.x, this.checkpoint.y) - PLAYER_H;
    p.vx = 0;
    p.vy = 0;
    this.comunhao = Math.max(this.comunhao, 0.35);
    this.emit({ type: 'fall' });
    this.emit({ type: 'message', text: message });
  }

  private camera(dt: number) {
    const tx = clamp(this.player.x + PLAYER_W / 2, VIEW_W / 2, this.pixelWidth() - VIEW_W / 2);
    const ty = clamp(this.player.y + PLAYER_H / 2, VIEW_H / 2, this.pixelHeight() - VIEW_H / 2);
    const k = Math.min(1, CAMERA_LERP * (dt * 60));
    this.camX += (tx - this.camX) * k;
    this.camY += (ty - this.camY) * k;
  }

  private paint() {
    const canvas = this.canvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scene: Scene = {
      level: this.level,
      map: this.map,
      player: this.player,
      enemies: this.enemies,
      seeds: this.seeds,
      shields: this.shields,
      camX: this.camX,
      camY: this.camY,
      lightRadius: Math.min(LIGHT_MAX, LIGHT_BASE + this.seedCount * LIGHT_PER_SEED),
      lightLevel: this.lightLevel,
      comunhao: this.comunhao,
      seedCount: this.seedCount,
      flash: this.flash,
      time: performance.now() / 1000,
      reducedMotion: this.opts.reducedMotion,
    };
    drawScene(ctx, canvas.width, canvas.height, scene);
  }

  private pixelWidth() {
    return this.map.width * TILE;
  }

  private pixelHeight() {
    return this.map.height * TILE;
  }

  private emit(e: EngineEvent) {
    this.opts.onEvent(e);
  }
}

/* --------------------------------- util ---------------------------------- */

function overlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Topo do primeiro sólido abaixo de (x, fromY) — para o herói nascer em pé no chão. */
function groundTopBelow(map: TileMap, x: number, fromY: number): number {
  const tx = Math.floor((x + PLAYER_W / 2) / TILE);
  for (let ty = Math.max(0, Math.floor(fromY / TILE)); ty < map.height; ty++) {
    const ch = map.grid[ty]?.[tx];
    if (ch === '#' || ch === 'x' || ch === 'w') return ty * TILE;
  }
  return fromY;
}
