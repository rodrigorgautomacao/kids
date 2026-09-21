// Invariantes do catálogo de jogos (Fase 11).
//
// Garante que o Hub não quebre: todo jogo "pronto" tem componente, todo
// "em breve" não tem, ids são únicos e faixa/tipo existem.

import { describe, expect, it } from 'vitest';
import { FAIXAS, TIPOS, games } from './games';

describe('catálogo de jogos (data/games.tsx)', () => {
  it('ids são únicos', () => {
    const ids = games.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('faixa e tipo de todo jogo existem no catálogo', () => {
    const faixas = new Set(FAIXAS.map((f) => f.id));
    const tipos = new Set(TIPOS.map((t) => t.id));
    for (const g of games) {
      expect(faixas.has(g.faixa), `jogo ${g.id}: faixa inválida`).toBe(true);
      expect(tipos.has(g.tipo), `jogo ${g.id}: tipo inválido`).toBe(true);
    }
  });

  it('jogo pronto tem componente; em breve não tem', () => {
    for (const g of games) {
      if (g.status === 'pronto') {
        expect(g.component, `jogo ${g.id}: pronto sem component`).toBeTruthy();
      } else {
        expect(g.component, `jogo ${g.id}: em breve com component`).toBeFalsy();
      }
    }
  });

  it('toda faixa tem ao menos um jogo pronto', () => {
    for (const f of FAIXAS) {
      expect(
        games.some((g) => g.faixa === f.id && g.status === 'pronto'),
        `faixa ${f.id} sem jogo pronto`,
      ).toBe(true);
    }
  });

  it('todo jogo tem título, sinopse e habilidades', () => {
    for (const g of games) {
      expect(g.title.trim().length, `jogo ${g.id}: sem título`).toBeGreaterThan(0);
      expect(g.sinopse.trim().length, `jogo ${g.id}: sem sinopse`).toBeGreaterThan(0);
      expect(g.habilidades.length, `jogo ${g.id}: sem habilidades`).toBeGreaterThan(0);
    }
  });
});