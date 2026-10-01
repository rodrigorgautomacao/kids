// Regressão: em A Palavra Certa o herói NUNCA nasce/respawna sobre o vazio
// (era o "loop de começar caindo" — retomada em cima de buraco).

import { describe, expect, it } from 'vitest';
import { buildLevel, HERO_H, WORLD_H } from './level';

const SPAWN_X = 120;

function hasFirmGround(geom: ReturnType<typeof buildLevel>, x: number): boolean {
  return geom.solids.some((s) => s.y >= geom.groundY - 2 && x >= s.x && x <= s.x + s.w);
}

describe('A Palavra Certa — spawn sem loop de queda', () => {
  it('todas as 10 fases (normal e pequeninos) têm chão firme sob o spawn', () => {
    for (let fase = 1; fase <= 10; fase++) {
      for (const easy of [false, true]) {
        const geom = buildLevel(fase, easy);
        expect(hasFirmGround(geom, SPAWN_X), `fase ${fase} easy=${easy}`).toBe(true);
        // O spawn não pode estar sobre um buraco.
        const overPit = geom.pits.some((p) => SPAWN_X > p.x && SPAWN_X < p.x + p.w);
        expect(overPit, `fase ${fase} easy=${easy}`).toBe(false);
      }
    }
  });

  it('os pés do herói (hero.y = groundY) tocam exatamente o topo do chão', () => {
    const geom = buildLevel(1, false);
    expect(geom.groundY).toBe(WORLD_H - 92);
    // Caixa do herói: [groundY - HERO_H, groundY] — assentada, sem penetrar o chão.
    expect(HERO_H).toBeGreaterThan(0);
    const solid = geom.solids.find(
      (s) => s.y >= geom.groundY - 2 && SPAWN_X >= s.x && SPAWN_X <= s.x + s.w,
    );
    expect(solid?.y).toBe(geom.groundY);
  });

  it('todo NPC e o portão têm chão firme (retomada pós-duelo segura)', () => {
    for (let fase = 1; fase <= 10; fase++) {
      const geom = buildLevel(fase, false);
      for (const n of geom.npcs) {
        expect(hasFirmGround(geom, n.x), `fase ${fase} npc ${n.id}`).toBe(true);
      }
      expect(hasFirmGround(geom, geom.gateX), `fase ${fase} portão`).toBe(true);
    }
  });
});
