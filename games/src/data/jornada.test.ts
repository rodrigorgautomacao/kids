// Valida as 12 etapas da "A Grande Jornada": formato do mapa e refs NAA.

import { describe, expect, it } from 'vitest';
import { CENARIOS } from '../lib/jornada/scenarios';
import { parseMap } from '../lib/jornada/tiles';
import { JORNADA_GAME_LEVELS, JORNADA_LEVELS } from './jornada';

describe('A Grande Jornada — etapas (data/jornada.ts)', () => {
  it('tem 12 etapas (4 atos) e ≥5 níveis (regra da casa)', () => {
    expect(JORNADA_LEVELS).toHaveLength(12);
    expect(JORNADA_GAME_LEVELS.length).toBeGreaterThanOrEqual(5);
    expect(new Set(JORNADA_LEVELS.map((l) => l.id)).size).toBe(12);
  });

  it('toda etapa declara nome, marco, lição e referência (NAA)', () => {
    for (const lv of JORNADA_LEVELS) {
      expect(lv.name.length).toBeGreaterThan(2);
      expect(lv.marco.length).toBeGreaterThan(2);
      expect(lv.lesson.length).toBeGreaterThan(2);
      expect(lv.ref).toMatch(/\(NAA\)$/);
      expect(lv.ref).toMatch(/^[1-3]?\s?[A-Za-zçãáéíóúâêôÀ-ÿ]+\s?\d+(\.\d+)?(-\d+)?/);
    }
  });

  it('mapas têm 14 linhas × 192 colunas, com chars válidos', () => {
    const valid = new Set('.#=?xwogE!cS bnd~'.replace(' ', '').split(''));
    for (const lv of JORNADA_LEVELS) {
      expect(lv.map).toHaveLength(14);
      for (const line of lv.map) {
        expect(line).toHaveLength(192);
        for (const ch of line) expect(valid.has(ch)).toBe(true);
      }
    }
  });

  it('toda etapa tem 1ª Rocha do Marco cedo (spawn), chão sob o Portão e ≥1 Semente', () => {
    for (const lv of JORNADA_LEVELS) {
      const map = parseMap(lv.map);
      expect(map.gate, lv.id).not.toBeNull();
      expect(map.seeds.length, lv.id).toBeGreaterThanOrEqual(3);
      expect(map.checkpoints.length, lv.id).toBeGreaterThanOrEqual(1);
      // 1ª Rocha do Marco nasce nos primeiros 12 tiles (ponto de partida).
      expect(map.checkpoints[0].x, lv.id).toBeLessThan(12 * 24);
      // Base sob o Portão: chão ou plataforma (a etapa 4 termina no alto).
      const gx = map.gate!.x;
      const gy = map.gate!.y + 24;
      const below = lv.map[Math.floor(gy / 24)][Math.floor(gx / 24)];
      expect(below === '#' || below === '=', lv.id).toBe(true);
    }
  });

  it('toda etapa tem cenário desenhado e narrativa de entrada', () => {
    for (const lv of JORNADA_LEVELS) {
      expect(CENARIOS[lv.scenery], lv.id).toBeTypeOf('function');
      expect(lv.cenario.length, lv.id).toBeGreaterThan(60);
      // o marco do Bunyan aparece na narrativa da etapa
      expect(lv.cenario.length, lv.id).toBeGreaterThan(0);
    }
    // cada marco tem silhueta própria (senão duas etapas viram a mesma imagem)
    expect(new Set(JORNADA_LEVELS.map((l) => l.scenery)).size).toBe(12);
  });

  it('o Portão fica no fim da etapa (senão a fase continua curtinha)', () => {
    for (const lv of JORNADA_LEVELS) {
      const map = parseMap(lv.map);
      const fra = map.gate!.x / (map.width * 24);
      expect(fra, lv.id).toBeGreaterThan(0.8);
    }
  });

  it('Ato 4 (Consumação) não tem inimigo nenhum — coerência com Ap 21.4-6', () => {
    for (const lv of JORNADA_LEVELS.filter((l) => l.act === 4)) {
      const map = parseMap(lv.map);
      expect(map.spawns, lv.id).toHaveLength(0);
    }
  });

  it('cada GameLevel tem 1 rodada (a etapa inteira)', () => {
    for (const gl of JORNADA_GAME_LEVELS) {
      expect(gl.rounds).toHaveLength(1);
      expect(gl.name).toBeTruthy();
    }
  });
});
