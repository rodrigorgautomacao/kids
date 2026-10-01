// Física do platformer — AABB por eixo (X depois Y) + pulo variável.
// Puro e testável: recebe estado, devolve estado novo (skill `jogos-platformer` §2).

import {
  APEX_HANG,
  APEX_SPEED,
  COYOTE_TIME,
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
import { rectHitsSolid, tileAt } from './tiles';
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

  // ── Vertical ──────────────────────────────────────────────────
  const gravity = Math.abs(p.vy) < APEX_SPEED ? GRAVITY * APEX_HANG : GRAVITY;
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
    p.y = resolveYUp(map, p.x, p.y);
    p.vy = 0;
    headBonk = true;
    p.jumpCut = true;
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

/** Pulo de teste: altura máxima em px para um impulso/gravidade. */
export function jumpHeightPx(velocity = JUMP_VELOCITY, gravity = GRAVITY): number {
  return (velocity * velocity) / (2 * gravity);
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
