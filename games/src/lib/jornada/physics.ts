// Física do platformer — AABB por eixo (X depois Y) + pulo variável.
// Puro e testável: recebe estado, devolve estado novo (skill `jogos-platformer` §2).

import {
  APEX_HANG,
  APEX_SPEED,
  CORNER_NUDGE,
  COYOTE_TIME,
  FALL_GRAVITY,
  GRAVITY,
  JUMP_BUFFER,
  JUMP_CUT,
  JUMP_VELOCITY,
  MAX_FALL,
  PLAYER_H,
  PLAYER_W,
  RUN_ACCEL,
  RUN_FRICTION,
  RUN_MAX,
  TILE,
} from './constants';
import { parseMap, rectHitsSolid, tileAt } from './tiles';
import type { InputState, PlayerState } from './types';
import type { TileMap } from './tiles';

export interface MoveResult {
  player: PlayerState;
  /** Bateu a cabeça (pulo interrompido). */
  headBonk: boolean;
  /** Pousou neste passo (serve para partículas/efeito). */
  landed: boolean;
}

export function createPlayer(x: number, y: number): PlayerState {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    coyote: 0,
    jumpBuffer: 0,
    jumpCut: false,
    shield: false,
  };
}

/**
 * Um passo de física (dt em segundos, já fixo em 1/60 pelo laço).
 * Colisão por eixo: move X e resolve; move Y e resolve.
 */
export function stepPlayer(
  map: TileMap,
  player: PlayerState,
  input: InputState,
  dt: number,
  maxSpeed = RUN_MAX,
): MoveResult {
  const p: PlayerState = { ...player };
  let headBonk = false;
  let landed = false;

  // ── Horizontal ────────────────────────────────────────────────
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (dir !== 0) {
    p.vx += dir * RUN_ACCEL * dt;
    p.vx = clamp(p.vx, -maxSpeed, maxSpeed);
    p.facing = dir as 1 | -1;
  } else {
    const fr = RUN_FRICTION * dt;
    if (Math.abs(p.vx) <= fr) p.vx = 0;
    else p.vx -= Math.sign(p.vx) * fr;
  }

  p.x += p.vx * dt;
  // Bordas do mapa: nunca sair pela esquerda nem pela direita.
  p.x = clamp(p.x, 0, map.width * TILE - PLAYER_W);
  if (hitsSolid(map, p.x, p.y)) {
    p.x = resolveX(map, p.x, p.y, p.vx);
    p.vx = 0;
  }

  // ── Vertical (queda mais pesada que a subida — skill `jogos-game-feel` §2)
  const rising = p.vy < 0;
  const gBase = rising ? GRAVITY : FALL_GRAVITY;
  const gravity = rising && Math.abs(p.vy) < APEX_SPEED ? gBase * APEX_HANG : gBase;
  p.vy = Math.min(p.vy + gravity * dt, MAX_FALL);

  const prevBottom = p.y + PLAYER_H;
  p.y += p.vy * dt;

  if (p.vy >= 0) {
    const platformTop = landingPlatformTop(map, p.x, p.y, prevBottom);
    if (hitsSolid(map, p.x, p.y) || platformTop !== null) {
      if (platformTop !== null && !hitsSolid(map, p.x, p.y)) p.y = platformTop - PLAYER_H;
      else p.y = resolveYDown(map, p.x, p.y);
      p.vy = 0;
      if (!p.onGround) landed = true;
      p.onGround = true;
      p.coyote = COYOTE_TIME;
      p.jumpCut = false;
    } else {
      p.onGround = false;
    }
  } else if (hitsSolid(map, p.x, p.y)) {
    // Corner correction: a quina não pode roubar o pulo inteiro. A janela é
    // varrida (`|vy| × dt` do passo + folga) em vez de fixa, para que a
    // correção cubra exatamente o quanto o player andou no frame — e não
    // depende da velocidade horizontal: quem bate a cabeça é por causa do
    // pulo, não da corrida.
    const sweep = Math.abs(p.vy) * dt + CORNER_NUDGE;
    let fixed = false;
    // Procura a saída mais próxima, preferindo o lado para onde o player
    // vinha (evita empurrá-lo para trás quando basta um toque curto).
    const firstLeft = p.vx <= 0;
    for (let d = 0.5; d <= sweep && !fixed; d += 0.5) {
      const sides = firstLeft ? [-d, d] : [d, -d];
      for (const off of sides) {
        if (!hitsSolid(map, p.x + off, p.y)) {
          p.x += off;
          fixed = true;
          break;
        }
      }
    }
    if (fixed) {
      // Vitória da correção: nada de bonk, o pulo continua.
    } else {
      p.y = resolveYUp(map, p.x, p.y);
      p.vy = 0;
      headBonk = true;
      p.jumpCut = true;
    }
  } else {
    p.onGround = false;
  }

  // ── Coyote time + jump buffer + pulo variável ─────────────────
  if (p.onGround) p.coyote = COYOTE_TIME;
  else p.coyote = Math.max(0, p.coyote - dt);

  if (input.jumpPressed) p.jumpBuffer = JUMP_BUFFER;
  else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);

  if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = JUMP_VELOCITY;
    p.jumpBuffer = 0;
    p.coyote = 0;
    p.onGround = false;
    p.jumpCut = false;
  }

  // Soltar o botão no meio da subida corta o pulo (uma vez por pulo).
  if (!input.jump && !p.jumpCut && p.vy < JUMP_VELOCITY * JUMP_CUT) {
    p.vy = JUMP_VELOCITY * JUMP_CUT;
    p.jumpCut = true;
  }

  return { player: p, headBonk, landed };
}

/** Pulo de sanidade: altura máxima em px pela fórmula fechada `v²/2g`.
 *
 * ⚠️ NÃO use isto como garantia de que um mapa é jogável. A fórmula ignora
 * apex hang, aceleração, carga do pulo variável e a colisão real — foi
 * exatamente por usá-la como "gate" que gaps impossíveis passaram verdes.
 * Para garantir, use `simulateJump` (roda `stepPlayer`) ou o piloto de
 * `clearability.test.ts`.
 */
export function jumpHeightPx(velocity = JUMP_VELOCITY, gravity = GRAVITY): number {
  return (velocity * velocity) / (2 * gravity);
}

/** Mapa de ar: 64×16 tiles sem chão nem teto, só para a medição. */
function emptyMap(): TileMap {
  return parseMap(Array.from({ length: 16 }, () => '.'.repeat(64)));
}

/** Uma amostra da trajetória medida (px de mundo, y cresce para baixo). */
export interface JumpSample {
  /** px acima do ponto de partida (0 = altura inicial). */
  rise: number;
  /** px de deslocamento horizontal em relação à partida. */
  dx: number;
  /** segundos desde o salto. */
  t: number;
}

/** O que o motor de fato entrega num pulo — medido, não deduzido. */
export interface JumpEnvelope {
  /** Altura máxima real (px). */
  height: number;
  /** Tempo até o ápice (s). */
  timeToApex: number;
  /** Tempo total no ar, de decolagem ao retorno à altura inicial (s). */
  airTime: number;
  /** Alcance horizontal total parado, de decolagem ao retorno à altura inicial. */
  reach: number;
  /** Alcance horizontal parado medido no ponto mais alto do pulo. */
  reachAtApex: number;
  /** Trajetória completa, passo a passo (1/60 s). */
  samples: JumpSample[];
}

const SIM_DT = 1 / 60;
const SIM_FRAMES = 240;

export interface JumpOptions {
  /** Velocidade horizontal inicial (px/s). `0` = decolagem do repouso. */
  startVX?: number;
  /** Teto de velocidade: `RUN_MAX` ou `RUN_MAX_SMALL_KIDS`. */
  maxSpeed?: number;
  /** `true` = segura o botão (pulo cheio); `false` = solta (pulo cortado). */
  holdJump?: boolean;
  /** `true` = segura a direção durante o voo (a criança está correndo). */
  run?: boolean;
}

/**
 * Mede um pulo **rodando `stepPlayer`** — o mesmo código do jogo, com apex
 * hang, pulo variável e colisão. É a fonte de verdade para gap/alcance.
 *
 * Casos usados pelo gate:
 *   `{}`                              → pulo parado (pior caso)
 *   `{ run: true }`                   → partida do repouso segurando a direção
 *   `{ startVX: RUN_MAX, run: true }` → corrida já em velocidade
 */
export function simulateJump(opts: JumpOptions = {}): JumpEnvelope {
  const { startVX = 0, maxSpeed = RUN_MAX, holdJump = true, run = false } = opts;
  const map = emptyMap();
  const startY = TILE * 10;
  let p = createPlayer(TILE, startY);
  p.vx = startVX;
  p.vy = JUMP_VELOCITY; // decolagem imediata, sem coyote nem chão
  const x0 = p.x;
  const samples: JumpSample[] = [{ rise: 0, dx: 0, t: 0 }];
  let height = 0;
  let apexT = 0;
  let reachAtApex = 0;
  let airTime = 0;

  for (let i = 1; i <= SIM_FRAMES; i++) {
    const res = stepPlayer(
      map,
      p,
      { left: false, right: run, jump: holdJump, jumpPressed: false },
      SIM_DT,
      maxSpeed,
    );
    p = res.player;
    const t = i * SIM_DT;
    const rise = startY - p.y;
    samples.push({ rise, dx: p.x - x0, t });
    if (rise > height) {
      height = rise;
      apexT = t;
      reachAtApex = p.x - x0;
    }
    // Volta à altura inicial ⇒ fim do tempo no ar.
    if (rise <= 0) {
      airTime = t;
      break;
    }
    airTime = t;
  }
  return {
    height,
    timeToApex: apexT,
    airTime,
    reach: samples.length > 1 ? samples[samples.length - 1].dx : 0,
    reachAtApex,
    samples,
  };
}

/**
 * Altura máxima alcançável subindo `dy` px a partir da decolagem.
 * Usado pelo gate para provar que uma plataforma flutuante está abaixo do
 * ápice — medido com a física real, não com `v²/2g`.
 */
export function canReachHeight(dy: number, envelope = simulateJump()): boolean {
  return dy <= envelope.height;
}

/* ------------------------------- colisão -------------------------------- */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function hitsSolid(map: TileMap, x: number, y: number): boolean {
  return rectHitsSolid(map, x, y, PLAYER_W, PLAYER_H, false);
}

/** Empurra o player para fora do sólido na horizontal (respeitando a direção). */
function resolveX(map: TileMap, x: number, y: number, vx: number): number {
  const step = vx > 0 ? -0.5 : 0.5;
  let guard = 0;
  let nx = x;
  while (hitsSolid(map, nx, y) && guard++ < 96) nx += step;
  return nx;
}

function resolveYDown(map: TileMap, x: number, y: number): number {
  let guard = 0;
  let ny = y;
  while (hitsSolid(map, x, ny) && guard++ < 96) ny -= 0.5;
  return ny;
}

function resolveYUp(map: TileMap, x: number, y: number): number {
  let guard = 0;
  let ny = y;
  while (hitsSolid(map, x, ny) && guard++ < 96) ny += 0.5;
  return ny;
}

/**
 * Topo de plataforma one-way sob o player (ou null). Só pega quem estava
 * acima dela antes do passo e está descendo.
 */
function landingPlatformTop(
  map: TileMap,
  x: number,
  y: number,
  prevBottom: number,
): number | null {
  const y1 = Math.floor((y + PLAYER_H - 0.001) / TILE);
  const x0 = Math.floor(x / TILE);
  const x1 = Math.floor((x + PLAYER_W - 0.001) / TILE);
  for (let tx = x0; tx <= x1; tx++) {
    const wx = tx * TILE + TILE / 2;
    if (tileAt(map, wx, y1 * TILE + TILE / 2) !== '=') continue;
    const top = y1 * TILE;
    if (prevBottom <= top + 4) return top;
  }
  return null;
}
