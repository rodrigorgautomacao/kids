// Invariantes do catálogo de jogos (Fase 11).
//
// Garante que o Hub não quebre: todo jogo "pronto" tem componente, todo
// "em breve" não tem, ids são únicos e faixa/tipo existem.

import { describe, expect, it } from 'vitest';
import { FAIXAS, TIPOS, games, jogoNaFaixa } from './games';

describe('catálogo de jogos (data/games.tsx)', () => {
  it('ids são únicos', () => {
    const ids = games.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('faixa e tipo de todo jogo existem no catálogo', () => {
    const faixas = new Set(FAIXAS.map((f) => f.id));
    const tipos = new Set(TIPOS.map((t) => t.id));
    for (const g of games) {
      // `faixa` pode ser uma lista (jogo que serve a todas as faixas).
      for (const f of Array.isArray(g.faixa) ? g.faixa : [g.faixa]) {
        expect(faixas.has(f), `jogo ${g.id}: faixa inválida`).toBe(true);
      }
      expect(tipos.has(g.tipo), `jogo ${g.id}: tipo inválido`).toBe(true);
    }
  });

  it('jogo pronto tem componente (direto ou lazy); em breve não tem nenhum', () => {
    for (const g of games) {
      const carrega = Boolean(g.component ?? g.lazy);
      if (g.status === 'pronto') {
        expect(carrega, `jogo ${g.id}: pronto sem component`).toBe(true);
      } else {
        expect(g.component, `jogo ${g.id}: em breve com component`).toBeFalsy();
        expect(g.lazy, `jogo ${g.id}: em breve com lazy`).toBeFalsy();
      }
    }
  });

  it('jogo não declara component e lazy ao mesmo tempo', () => {
    for (const g of games) {
      expect(
        Boolean(g.component && g.lazy),
        `jogo ${g.id}: tem component e lazy — o App escolhe só um`,
      ).toBe(false);
    }
  });

  it('toda faixa tem ao menos um jogo pronto', () => {
    for (const f of FAIXAS) {
      expect(
        games.some((g) => jogoNaFaixa(g.faixa, f.id) && g.status === 'pronto'),
        `faixa ${f.id} sem jogo pronto`,
      ).toBe(true);
    }
  });

  it('toda faixa tem ao menos um jogo que é só dela (senão a seção fica genérica)', () => {
    for (const f of FAIXAS) {
      expect(
        games.some((g) => Array.isArray(g.faixa) === false && g.faixa === f.id && g.status === 'pronto'),
        `faixa ${f.id} sem jogo exclusivo`,
      ).toBe(true);
    }
  });

  it('jogo de leitura entra nas três faixas e é marcado como leitura', () => {
    const leitura = games.filter((g) => g.progressoLeitura);
    expect(leitura.length, 'nenhum jogo de leitura no catálogo').toBeGreaterThan(0);
    for (const g of leitura) {
      expect(Array.isArray(g.faixa), `jogo de leitura ${g.id} deveria servir às 3 faixas`).toBe(true);
      expect(g.faixa).toHaveLength(FAIXAS.length);
      // leitura não tem níveis: se ganhasse totalLevels, o Hub mostraria estrela
      expect(g.totalLevels, `jogo de leitura ${g.id} não deveria ter totalLevels`).toBeUndefined();
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