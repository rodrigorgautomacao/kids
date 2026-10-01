// Clearability (skill `jogos-qa` §6): TODO vão do jogo é transponível com
// folga ≥ 20% do alcance máximo do pulo. É o teste que impede o bug
// "o pulo não alcança o outro lado" de voltar.
//
// Alcance derivado de sensação (skill `jogos-game-feel` §2), com a gravidade
// assimétrica do motor: altura ≈ 161 px, arco ≈ 0,67 s, alcance ≈ 224 px.

import { describe, expect, it } from 'vitest';
import { buildLevel } from './level';

const JUMP_VEL = 870;
const GRAVITY = 2350;
const FALL_MULT = 1.55;
const MAX_SPEED = 335;

/** Alcance horizontal máximo do pulo (px), com a física real do motor. */
export function jumpReach(): number {
  const height = (JUMP_VEL * JUMP_VEL) / (2 * GRAVITY); // ápice
  const tUp = JUMP_VEL / GRAVITY;
  const tDown = Math.sqrt((2 * height) / (GRAVITY * FALL_MULT));
  return MAX_SPEED * (tUp + tDown);
}

describe('clearability — todo vão é transponível (lib/palavracerta)', () => {
  const reach = jumpReach();

  it('o alcance do pulo é o esperado (≈224 px) e folgado', () => {
    expect(reach).toBeGreaterThan(200);
    expect(reach).toBeLessThan(260);
  });

  it('todas as 10 fases: nenhum vão passa de 75% do alcance', () => {
    for (let n = 1; n <= 10; n++) {
      for (const easy of [false, true]) {
        const geom = buildLevel(n, easy);
        for (const pit of geom.pits) {
          expect(
            pit.w,
            `fase ${n} (${easy ? 'pequeninos' : 'normal'}): vão de ${Math.round(pit.w)} px × alcance ${Math.round(reach)} px`,
          ).toBeLessThan(reach * 0.75);
        }
      }
    }
  });

  it('todo vão tem plataforma de apoio no meio (modo normal) ou é curto', () => {
    for (let n = 1; n <= 10; n++) {
      const geom = buildLevel(n, false);
      for (const pit of geom.pits) {
        const apoio = geom.solids.some(
          (s) =>
            s.h <= 24 &&
            s.x >= pit.x - 20 &&
            s.x + s.w <= pit.x + pit.w + 20 &&
            s.y >= geom.groundY - 130 &&
            s.y < geom.groundY - 60,
        );
        expect(apoio || pit.w < reach * 0.5, `fase ${n}: vão ${Math.round(pit.w)} px sem apoio`).toBe(true);
      }
    }
  });

  it('o herói nasce e o portão estão em chão firme', () => {
    for (let n = 1; n <= 10; n++) {
      const geom = buildLevel(n, false);
      const firme = (x: number) =>
        geom.solids.some((s) => s.y >= geom.groundY - 2 && x >= s.x && x <= s.x + s.w);
      expect(firme(120), `fase ${n}: spawn`).toBe(true);
      expect(firme(geom.gateX), `fase ${n}: portão`).toBe(true);
      for (const npc of geom.npcs) {
        expect(firme(npc.x), `fase ${n}: ${npc.id} no vazio`).toBe(true);
      }
    }
  });
});
