// Validação do catálogo de cenas-teatro (Fase 9).
//
// Este teste protege a FASE DE CONTEÚDO: cada cena precisa ter id único,
// pertencer a uma estação válida da Aventura, citar a referência NAA e ter
// atos/pergunta/opções completas. Se o catálogo for editado de forma
// inconsistente, o CI quebra antes de a criança ver o bug.

import { describe, expect, it } from 'vitest';
import { CHARACTER_IDS, SCENES } from './scenes';

describe('catálogo de cenas (data/scenes.ts)', () => {
  it('tem cenas suficientes para o livrinho', () => {
    expect(SCENES.length).toBeGreaterThanOrEqual(30);
  });

  it('ids são únicos', () => {
    const ids = SCENES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo characterId é uma estação válida da Aventura', () => {
    const valid = new Set<string>(CHARACTER_IDS);
    for (const s of SCENES) {
      expect(valid.has(s.characterId), `cena ${s.id} tem characterId inválido`).toBe(true);
    }
  });

  it('toda estação tem ao menos uma cena', () => {
    for (const cid of CHARACTER_IDS) {
      expect(SCENES.some((s) => s.characterId === cid), `estação ${cid} sem cena`).toBe(true);
    }
  });

  it('toda cena cita a referência bíblica no padrão (NAA)', () => {
    for (const s of SCENES) {
      expect(s.ref.endsWith('(NAA)'), `cena ${s.id}: ref sem (NAA)`).toBe(true);
      // capítulo.versículo — cada ref precisa carregar pelo menos um versículo.
      expect(s.ref, `cena ${s.id}: ref sem cap.vers`).toMatch(/\d+\.\d+/);
      expect(s.title.length, `cena ${s.id}: sem título`).toBeGreaterThan(0);
    }
  });

  it('toda cena tem título, atos, pergunta e opções coerentes', () => {
    for (const s of SCENES) {
      expect(s.acts.length, `cena ${s.id}: precisa de atos`).toBeGreaterThanOrEqual(2);
      for (const act of s.acts) {
        expect(act.trim().length, `cena ${s.id}: ato vazio`).toBeGreaterThan(0);
      }
      expect(s.q.trim().length, `cena ${s.id}: pergunta vazia`).toBeGreaterThan(0);
      expect(s.right.t.trim().length > 0, `cena ${s.id}: resposta vazia`).toBe(true);
      expect(s.right.e.length > 0, `cena ${s.id}: emoji da resposta`).toBe(true);
      expect(s.wrongs.length, `cena ${s.id}: precisa de opções erradas`).toBeGreaterThanOrEqual(2);
    }
  });

  it('uma cena não pode ter resposta duplicada nas opções erradas', () => {
    for (const s of SCENES) {
      const texts = s.wrongs.map((w) => w.t.trim().toLowerCase());
      expect(texts.includes(s.right.t.trim().toLowerCase()), `cena ${s.id}: resposta repetida`).toBe(false);
      expect(new Set(texts).size, `cena ${s.id}: opções erradas repetidas`).toBe(texts.length);
    }
  });

  it('adereços e figurinha são emoji (sem texto)', () => {
    for (const s of SCENES) {
      for (const p of s.props) {
        expect(/\p{Extended_Pictographic}/u.test(p), `cena ${s.id}: prop "${p}" não é emoji`).toBe(true);
        expect(/[0-9A-Za-zÀ-ÿ]/.test(p), `cena ${s.id}: prop "${p}" contém texto`).toBe(false);
      }
      expect(/\p{Extended_Pictographic}/u.test(s.sticker), `cena ${s.id}: figurinha inválida`).toBe(true);
    }
  });
});