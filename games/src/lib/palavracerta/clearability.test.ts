/**
 * Gate da regra de ouro (skill `jogos-qa` §6): **todo vão é transponível e toda
 * plataforma é alcançável** — com folga, não na sorte.
 *
 * Isto usa `physics.ts`, o MESMO módulo que o motor executa. A versão anterior
 * usava uma fórmula própria (ignorava *apex hang* e aceleração aérea) e por isso
 * dava verde com 6 plataformas inalcançáveis por fase e nenhuma checagem de
 * altura — uma garantia falsa. Achado sev 3 da revisão `jogos-2d`.
 *
 * As alturas de referência vêm da simulação real, não de palpite:
 *   JUMP.apex ≈ 156 px · HOP.apex ≈ 68 px (o "pulinho" da criança que só toca)
 */

import { describe, expect, it } from 'vitest';
import { buildLevel } from './level';
import { HOP, JUMP, simulateJump } from './physics';

/** Folga obrigatória sobre qualquer vão, sobre o alcance PARADO (o pior caso). */
const FOLGA = 0.2;

/** Alcance horizontal partindo do repouso (pior caso da criança). */
function reachParado(): number {
  return simulateJump('hold', 0).reach;
}

describe('física — o motor dá o que a criança precisa', () => {
  it('o pulo cheio sobe ~3 unidades do herói (54 px) e dura ~0,7 s', () => {
    expect(JUMP.apex).toBeGreaterThan(140);
    expect(JUMP.apex).toBeLessThan(200);
    expect(JUMP.arcMs).toBeGreaterThan(550);
    expect(JUMP.arcMs).toBeLessThan(850);
  });

  it('o pulinho (toque curto) chega a ~45% do pulo cheio — toque precisa servir', () => {
    // Antes era 18%: a criança que só tocava não atravessava vão nenhum.
    expect(HOP.apex / JUMP.apex).toBeGreaterThan(0.4);
    expect(HOP.apex).toBeGreaterThan(55);
  });

  it('a queda é mais rápida que a subida (sem pulo flutuante)', () => {
    const queda = (JUMP.arcMs - JUMP.apexMs) / JUMP.apexMs;
    expect(queda).toBeLessThan(1);
    expect(queda).toBeGreaterThan(0.3);
  });
});

describe('clearability — vãos (regra de ouro: todo vão transponível)', () => {
  const reach = reachParado();

  it('o alcance parado sustenta o maior vão das 10 fases com folga', () => {
    let maior = 0;
    for (let n = 1; n <= 10; n++) {
      for (const easy of [false, true]) {
        for (const pit of buildLevel(n, easy).pits) maior = Math.max(maior, pit.w);
      }
    }
    expect(maior).toBeLessThan(reach * (1 - FOLGA));
  });

  it('nenhum vão das 10 fases (2 modos) passa do alcance com folga', () => {
    for (let n = 1; n <= 10; n++) {
      for (const easy of [false, true]) {
        for (const pit of buildLevel(n, easy).pits) {
          expect(
            pit.w,
            `fase ${n} (${easy ? 'pequeninos' : 'normal'}): vão ${Math.round(pit.w)} px × alcance parado ${Math.round(reach)} px`,
          ).toBeLessThan(reach * (1 - FOLGA));
        }
      }
    }
  });

  it('o Modo Pequeninos é estritamente mais fácil que o normal, fase a fase', () => {
    for (let n = 1; n <= 10; n++) {
      const easy = buildLevel(n, true);
      const normal = buildLevel(n, false);
      expect(easy.pits.length).toBeLessThanOrEqual(normal.pits.length);
      for (const p of easy.pits) expect(p.w).toBeLessThanOrEqual(Math.max(...normal.pits.map((q) => q.w)) + 24);
    }
  });
});

describe('plataformas — alcançáveis e sem teto que engole o pulo', () => {
  const flutuante = (s: { h: number }) => s.h <= 24;

  it('toda plataforma é alcançável a partir do chão (com folga do pulo cheio)', () => {
    for (let n = 1; n <= 10; n++) {
      for (const easy of [false, true]) {
        const { solids, groundY } = buildLevel(n, easy);
        for (const s of solids.filter(flutuante)) {
          const altura = groundY - s.y;
          expect(
            altura,
            `fase ${n} (${easy ? 'pequeninos' : 'normal'}): plataforma a ${Math.round(altura)} px > ápice ${Math.round(JUMP.apex)} px`,
          ).toBeLessThan(JUMP.apex - 20);
        }
      }
    }
  });

  it('plataforma de sentido único nunca engole o pulo (o herói passa por baixo)', () => {
    for (let n = 1; n <= 10; n++) {
      for (const easy of [false, true]) {
        for (const s of buildLevel(n, easy).solids.filter(flutuante)) {
          expect(s.oneWay, `fase ${n}: plataforma flutuante sem oneWay`).toBe(true);
        }
      }
    }
  });

  it('no Modo Pequeninos, o apoio fica DENTRO do vão e não invade o chão firme', () => {
    // O apoio é o degrau do meio. O que não pode é invadir os lábios de chão
    // firme: aí vira teto no ponto de takeoff e engole o pulo.
    for (let n = 1; n <= 10; n++) {
      const geom = buildLevel(n, true);
      for (const pit of geom.pits) {
        const apoios = geom.solids.filter(
          (s) => flutuante(s) && s.x + s.w / 2 > pit.x && s.x + s.w / 2 < pit.x + pit.w,
        );
        expect(apoios.length, `fase ${n}: vão de ${Math.round(pit.w)} px sem apoio no meio`).toBeGreaterThan(0);
        for (const a of apoios) {
          expect(a.x, `fase ${n}: apoio invade o chão firme à esquerda`).toBeGreaterThan(pit.x);
          expect(a.x + a.w, `fase ${n}: apoio invade o chão firme à direita`).toBeLessThan(pit.x + pit.w);
        }
      }
    }
  });

  it('uma criança que só TOCA atravessa os vãos do Pequeninos em dois pulinhos', () => {
    // Subir no apoio e descer: cada metade do vão precisa caber no pulinho.
    for (let n = 1; n <= 10; n++) {
      const geom = buildLevel(n, true);
      for (const pit of geom.pits) {
        const apoio = geom.solids.find(
          (s) => flutuante(s) && s.x + s.w / 2 > pit.x && s.x + s.w / 2 < pit.x + pit.w,
        );
        expect(apoio, `fase ${n}: vão sem apoio`).toBeDefined();
        expect(
          geom.groundY - apoio!.y,
          `fase ${n}: apoio a ${Math.round(geom.groundY - apoio!.y)} px exige pulo cheio`,
        ).toBeLessThan(HOP.apex);
        expect(pit.w / 2, `fase ${n}: metade do vão não cabe no pulinho`).toBeLessThan(HOP.reach);
      }
    }
  });
});

describe('curva de dificuldade — a jornada evolui de verdade', () => {
  const maiorVao = (n: number) => Math.max(...buildLevel(n, false).pits.map((p) => p.w));

  it('as fases avançam: a última faixa tem vãos maiores que a primeira', () => {
    expect(maiorVao(10)).toBeGreaterThan(maiorVao(1));
    expect(maiorVao(7)).toBeGreaterThan(maiorVao(3));
  });

  it('o aquecimento (1–3) é mais fácil que a combinação (8–10) em vão médio', () => {
    const media = (ns: number[]) => ns.map(maiorVao).reduce((a, b) => a + b) / ns.length;
    expect(media([1, 2, 3])).toBeLessThan(media([8, 9, 10]));
  });

  it('nenhum vão das 3 faixas passa de 80% do alcance parado (regra dura da geração)', () => {
    const teto = reachParado() * 0.8;
    for (let n = 1; n <= 10; n++) {
      for (const pit of buildLevel(n, false).pits) {
        expect(pit.w, `fase ${n}: vão ${Math.round(pit.w)} px > teto ${Math.round(teto)} px`).toBeLessThan(teto);
      }
    }
  });
});

describe('mundo — ninguém nasce ou fica no vazio', () => {
  it('herói, portão e NPCs estão em chão firme (10 fases)', () => {
    for (let n = 1; n <= 10; n++) {
      for (const easy of [false, true]) {
        const geom = buildLevel(n, easy);
        const firme = (x: number) =>
          geom.solids.some((s) => s.y >= geom.groundY - 2 && x >= s.x && x <= s.x + s.w);
        expect(firme(120), `fase ${n}: spawn`).toBe(true);
        expect(firme(geom.gateX), `fase ${n}: portão`).toBe(true);
        for (const npc of geom.npcs) expect(firme(npc.x), `fase ${n}: ${npc.id}`).toBe(true);
      }
    }
  });

  it('o primeiro NPC dá tempo de aprender o controle antes do primeiro duelo', () => {
    for (let n = 1; n <= 10; n++) {
      const geom = buildLevel(n, false);
      expect(geom.npcs[0].x, `fase ${n}: primeiro NPC colado no spawn`).toBeGreaterThan(420);
    }
  });
});
