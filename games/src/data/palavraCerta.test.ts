// Invariantes do conteúdo de A Palavra Certa (150 cartas).
//
// Regra de ouro (`jogos-biblicos` §3): toda carta traz `Livro cap.vers (NAA)`.
// Estrutura: 10 fases × 5 encontros (4 pessoas + 1 guardião) × 3 variantes,
// cada uma com 3 opções quase iguais e exatamente 1 certa.

import { describe, expect, it } from 'vitest';
import {
  embaralharCarta,
  escolherVariante,
  FASES,
  marcarUso,
  TOTAL_ENCONTROS_POR_FASE,
} from './palavraCerta';
import { buildLevel } from '../lib/palavracerta/level';

const REF_NAA = /\(NAA\)$/;

describe('conteúdo de A Palavra Certa (data/palavraCerta.ts)', () => {
  it('tem 10 fases com 5 encontros cada', () => {
    expect(FASES).toHaveLength(10);
    for (const f of FASES) {
      expect(f.encontros, `fase ${f.n}`).toHaveLength(TOTAL_ENCONTROS_POR_FASE);
    }
  });

  it('todo encontro tem 3 variantes coerentes (situação + pergunta)', () => {
    for (const f of FASES) {
      for (const e of f.encontros) {
        expect(e.variantes, e.id).toHaveLength(3);
        for (const c of e.variantes) {
          expect(c.s.length, `${e.id} sem situação`).toBeGreaterThan(8);
          expect(c.q.length, `${e.id} sem pergunta`).toBeGreaterThan(4);
          expect(c.msg.length, `${e.id} sem mensagem`).toBeGreaterThan(4);
        }
      }
    }
  });

  it('toda carta tem 3 opções quase iguais e exatamente 1 certa', () => {
    for (const f of FASES) {
      for (const e of f.encontros) {
        for (const c of e.variantes) {
          expect(c.o, e.id).toHaveLength(3);
          expect(c.c, e.id).toBeGreaterThanOrEqual(0);
          expect(c.c, e.id).toBeLessThanOrEqual(2);
          // opções distintas entre si
          expect(new Set(c.o).size, `${e.id}: opções repetidas`).toBe(3);
          // palavras curtas são legítimas no estilo "complete o versículo"
          for (const op of c.o) expect(op.trim().length, e.id).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('toda carta cita a Bíblia no padrão "Livro cap.vers (NAA)"', () => {
    for (const f of FASES) {
      for (const e of f.encontros) {
        for (const c of e.variantes) {
          expect(REF_NAA.test(c.ref), `${e.id}: ref "${c.ref}"`).toBe(true);
          expect(c.ref).toMatch(/^[1-3]?\s?[A-Za-zÀ-ÿ]+/);
        }
      }
    }
  });

  it('ids de encontro são únicos e o guardião é o último de cada fase', () => {
    const ids = FASES.flatMap((f) => f.encontros.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of FASES) {
      const guardioes = f.encontros.filter((e) => e.guardiao);
      expect(guardioes, `fase ${f.n}`).toHaveLength(1);
      expect(f.encontros[f.encontros.length - 1].guardiao, `fase ${f.n}`).toBe(true);
      expect(guardioes[0].vitoria, `${guardioes[0].id} sem fala de vitória`).toBeTruthy();
    }
  });

  it('totaliza 150 cartas (10 × 5 × 3)', () => {
    const total = FASES.reduce(
      (acc, f) => acc + f.encontros.reduce((a, e) => a + e.variantes.length, 0),
      0,
    );
    expect(total).toBe(150);
  });

  it('embaralharCarta mantém a certa certa (o texto certo muda de posição)', () => {
    for (const f of FASES) {
      for (const e of f.encontros) {
        for (const c of e.variantes) {
          for (let i = 0; i < 8; i++) {
            const emb = embaralharCarta(c);
            expect(emb.opcoes).toHaveLength(3);
            expect(emb.opcoes[emb.certa]).toBe(c.o[c.c]);
            expect(new Set(emb.opcoes).size).toBe(3);
          }
        }
      }
    }
  });

  it('escolherVariante sortea sem repetir até acabar as 3', () => {
    for (const f of FASES) {
      for (const e of f.encontros) {
        const usadas = new Set<string>();
        const vistas = new Set<string>();
        for (let i = 0; i < 3; i++) {
          const c = escolherVariante(e, usadas);
          vistas.add(c.s);
          marcarUso(e, c, usadas);
        }
        expect(vistas.size, `${e.id} repetiu variante`).toBe(3);
      }
    }
  });
});

describe('geração das fases (lib/palavracerta/level.ts)', () => {
  it('cada fase tem 4 NPCs + 1 guardião e um portão no fim', () => {
    for (let n = 1; n <= 10; n++) {
      const geom = buildLevel(n, false);
      expect(geom.npcs, `fase ${n}`).toHaveLength(5);
      expect(geom.npcs[4].guardiao, `fase ${n}`).toBe(true);
      expect(geom.gateX).toBeLessThan(geom.width);
      expect(geom.solids.length).toBeGreaterThan(2);
    }
  });

  it('modo pequeninos tem menos e mais curtos buracos', () => {
    for (let n = 1; n <= 10; n++) {
      const facil = buildLevel(n, true);
      const normal = buildLevel(n, false);
      const maiorBuraco = (g: typeof facil) => Math.max(...g.pits.map((p) => p.w));
      expect(facil.pits.length).toBeLessThanOrEqual(normal.pits.length);
      expect(maiorBuraco(facil)).toBeLessThan(maiorBuraco(normal));
    }
  });
});
