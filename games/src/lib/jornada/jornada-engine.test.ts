// Testes do motor puro da "A Grande Jornada" (skill `jogos-platformer` §10).

import { describe, expect, it } from 'vitest';
import { JUMP_VELOCITY, TILE } from './constants';
import { createPlayer, jumpHeightPx, stepPlayer } from './physics';
import { parseMap, rectHitsSolid, tileAt } from './tiles';

const FLAT = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '################',
  '################',
];

describe('tiles (parse do mapa)', () => {
  it('mede largura/altura e varre entidades para fora do grid', () => {
    const map = parseMap([
      '....o...S...g..!',
      '################',
    ]);
    expect(map.width).toBe(16);
    expect(map.height).toBe(2);
    expect(map.seeds).toHaveLength(1);
    expect(map.spawns).toHaveLength(1);
    expect(map.checkpoints).toHaveLength(1);
    expect(map.gate).not.toBeNull();
    // Entidades viram ar no grid (o motor cuida delas).
    expect(tileAt(map, 4 * TILE + 1, 1)).toBe('.');
  });

  it('distingue sólido, plataforma one-way e ar', () => {
    const map = parseMap(['.?=xw=.#......', '################']);
    expect(tileAt(map, 1 * TILE, 0)).toBe('?');
    expect(rectHitsSolid(map, 1 * TILE, 0, 8, 8, false)).toBe(true);
    // '=' só é sólida para quem vem de cima (oneWay=true)
    expect(rectHitsSolid(map, 5 * TILE, 0, 8, 8, false)).toBe(false);
    expect(rectHitsSolid(map, 5 * TILE, 0, 8, 8, true)).toBe(true);
  });
});

describe('physics (pulo e colisão)', () => {
  it('pula cerca de 3,5 tiles e o corte reduz a altura', () => {
    expect(jumpHeightPx()).toBeGreaterThan(TILE * 3);
    expect(jumpHeightPx()).toBeLessThan(TILE * 4.5);
  });

  it('cai, pousa no chão e marca onGround', () => {
    const map = parseMap(FLAT);
    let p = createPlayer(TILE * 2, TILE * 4);
    const input = { left: false, right: false, jump: false, jumpPressed: false };
    for (let i = 0; i < 120; i++) {
      const res = stepPlayer(map, p, input, 1 / 60);
      p = res.player;
    }
    expect(p.onGround).toBe(true);
    expect(p.vy).toBe(0);
  });

  it('pulo com toque curto é mais baixo que o segurado (pulo variável)', () => {
    const map = parseMap(FLAT);
    const inputHold = { left: false, right: false, jump: true, jumpPressed: true };
    const inputCut = { left: false, right: false, jump: true, jumpPressed: true };

    let held = createPlayer(TILE * 2, TILE * 8);
    let minY = held.y;
    for (let i = 0; i < 60; i++) {
      const res = stepPlayer(map, held, { ...inputHold, jumpPressed: i === 0 }, 1 / 60);
      held = res.player;
      minY = Math.min(minY, held.y);
    }

    let cut = createPlayer(TILE * 2, TILE * 8);
    let minCut = cut.y;
    for (let i = 0; i < 60; i++) {
      // solta o botão no meio da subida
      const res = stepPlayer(map, cut, { ...inputCut, jumpPressed: i === 0, jump: i < 6 }, 1 / 60);
      cut = res.player;
      minCut = Math.min(minCut, cut.y);
    }

    expect(minCut).toBeLessThan(cut.y); // ambos subiram
    expect(minCut).toBeGreaterThan(minY); // o corte subiu menos
  });

  it('não atravessa parede (AABB por eixo)', () => {
    const map = parseMap([
      '................',
      '................',
      '..#.............',
      '################',
    ]);
    let p = createPlayer(5 * TILE, 2 * TILE);
    const input = { left: true, right: false, jump: false, jumpPressed: false };
    for (let i = 0; i < 120; i++) {
      p = stepPlayer(map, p, input, 1 / 60).player;
    }
    // A parede ocupa o tile 2 (x 48–72) — o player para encostado nela.
    expect(p.x).toBeGreaterThanOrEqual(3 * TILE - 1);
    expect(p.x).toBeLessThan(5 * TILE);
    expect(p.vx).toBe(0);
  });

  it('impulso inicial do pulo é negativo (sobe)', () => {
    expect(JUMP_VELOCITY).toBeLessThan(0);
    expect(jumpHeightPx(JUMP_VELOCITY)).toBeGreaterThan(0);
  });
});

describe('regras da casa', () => {
  it('mapa com 64 colunas aceita 11 linhas (formato das etapas)', () => {
    const rows = Array.from({ length: 11 }, () => '.'.repeat(64));
    const map = parseMap(rows);
    expect(map.width).toBe(64);
    expect(map.height).toBe(11);
  });
});
