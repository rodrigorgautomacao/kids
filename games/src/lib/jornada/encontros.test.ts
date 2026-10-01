// Testes dos encontros com escolhas (Bunyan) — `jogos-qa` §3 exige que o
// personagem apareça e que o cartão volte o controle; o conteúdo é travado
// pelas regras da casa (ADR-010 §1.4, `jogos-biblicos` §3/§5).

import { describe, expect, it } from 'vitest';
import { ENCONTROS } from '../../data/jornadaEncontros';
import { JORNADA_LEVELS } from '../../data/jornada';
import { JornadaEngine } from './engine';
import { opcaoCerta, validarEncontro } from './encontros';
import { parseMap } from './tiles';
import type { EngineEvent } from './types';

const nivelValido = (id: string) => JORNADA_LEVELS.some((l) => l.id === id);

describe('conteúdo dos encontros', () => {
  it('cobre as 12 etapas, uma vez cada', () => {
    expect(ENCONTROS).toHaveLength(JORNADA_LEVELS.length);
    expect(new Set(ENCONTROS.map((e) => e.nivel)).size).toBe(JORNADA_LEVELS.length);
    expect(new Set(ENCONTROS.map((e) => e.id)).size).toBe(ENCONTROS.length);
  });

  it('todo encontro passa nas travas da casa', () => {
    for (const e of ENCONTROS) {
      expect(validarEncontro(e, nivelValido), `${e.id} (${e.npc})`).toEqual([]);
    }
  });

  it('toda referência é NAA e todo acerto é fala original', () => {
    for (const e of ENCONTROS) {
      expect(e.ref).toMatch(/\(NAA\)$/);
      expect(e.acerto.length).toBeGreaterThan(10);
      // O NPC nunca é Jesus nem um confessional (ADR-010 §1.4).
      expect(e.npc).not.toMatch(/jesus|cristo|apolion|belzebu|papa/i);
    }
  });

  it('toda opção errada tem correção do NPC (erro que não pune)', () => {
    for (const e of ENCONTROS) {
      const erradas = e.opcoes.filter((o) => !o.certa);
      expect(erradas.length).toBeGreaterThanOrEqual(1);
      for (const o of erradas) expect(o.eco && o.eco.length > 5).toBe(true);
      // Só uma certa, e o botão é curto para dedo de criança.
      expect(e.opcoes.filter((o) => o.certa)).toHaveLength(1);
      for (const o of e.opcoes) expect((o.texto.match(/\S+/g) ?? []).length).toBeLessThanOrEqual(6);
    }
  });
});

/** Acesso de teste aos internos do motor (o laço é privado por design). */
type Inspetor = {
  triggers: () => void;
  player: { x: number };
  pixelWidth: () => number;
  map: { gate: { x: number; y: number } | null };
  paused: boolean;
  finished: boolean;
  encontrosPendentes: { id: string }[];
};

function montar(nivelId: string, eventos: EngineEvent[]) {
  const level = JORNADA_LEVELS.find((l) => l.id === nivelId);
  if (!level) throw new Error(`nível ${nivelId} não existe`);
  const engine = new JornadaEngine(level, {
    smallKids: false,
    reducedMotion: false,
    onEvent: (e) => eventos.push(e),
    encontros: ENCONTROS.filter((x) => x.nivel === nivelId),
  });
  return { engine, level, insp: engine as unknown as Inspetor };
}

describe('gatilho do encontro na estrada', () => {
  it('o NPC espera, o motor pausa e só resolve com a carta', () => {
    const eventos: EngineEvent[] = [];
    const { engine, level, insp } = montar('e1', eventos);
    const mapa = parseMap(level.map);
    const largura = mapa.width * 24;
    const encontro = ENCONTROS.find((e) => e.nivel === 'e1')!;

    // Antes do ponto: nada acontece.
    insp.player.x = largura * (encontro.at - 0.05);
    insp.triggers();
    expect(eventos.filter((e) => e.type === 'encontro')).toHaveLength(0);

    // Ao chegar: o NPC chama e o laço segura.
    insp.player.x = largura * (encontro.at + 0.01);
    insp.triggers();
    const chamado = eventos.filter((e) => e.type === 'encontro');
    expect(chamado).toHaveLength(1);
    expect(chamado[0]).toMatchObject({ type: 'encontro', id: encontro.id, npc: encontro.npc });
    expect(insp.paused).toBe(true);
    expect(insp.finished).toBe(false);

    // O personagem não some da fila: um encontro por visita.
    insp.triggers();
    expect(eventos.filter((e) => e.type === 'encontro')).toHaveLength(1);

    // A carta devolve o controle — e a bênção chega como evento.
    engine.resolverEncontro(encontro.acerto, encontro.ref, encontro.efeito);
    expect(insp.paused).toBe(false);
    expect(eventos.some((e) => e.type === 'bencao')).toBe(true);
    expect(insp.encontrosPendentes).toHaveLength(0);
  });

  it('nenhum encontro fica para trás do Portão', () => {
    for (const level of JORNADA_LEVELS) {
      const eventos: EngineEvent[] = [];
      const { insp } = montar(level.id, eventos);
      const mapa = parseMap(level.map);
      // Simula a criança percorrendo a estrada inteira até o Portão.
      for (let f = 0; f <= 1.0001; f += 0.01) {
        insp.player.x = mapa.width * 24 * f;
        insp.triggers();
      }
      const esperados = ENCONTROS.filter((e) => e.nivel === level.id).length;
      expect(eventos.filter((e) => e.type === 'encontro'), level.id).toHaveLength(esperados);
      expect(insp.encontrosPendentes, `${level.id} ficou na fila`).toHaveLength(0);
    }
  });

  it('o efeito da bênção entra no mundo (semente, escudo, luz ou comunhão)', () => {
    for (const e of ENCONTROS) {
      const eventos: EngineEvent[] = [];
      const { engine, insp } = montar(e.nivel, eventos);
      insp.player.x = insp.pixelWidth() * e.at + 1;
      insp.triggers();
      const antes = eventos.length;
      engine.resolverEncontro(e.acerto, e.ref, e.efeito);
      const novos = eventos.slice(antes).map((x) => x.type);
      expect(novos.length, e.id).toBeGreaterThan(0);
      if (e.efeito === 'semente') expect(novos).toContain('seed');
      if (e.efeito === 'escudo') expect(novos).toContain('shield');
      expect(novos).toContain('bencao');
    }
  });

  it('a opção certa é única e é a que a carta valida', () => {
    for (const e of ENCONTROS) {
      const certa = opcaoCerta(e);
      expect(certa.certa).toBe(true);
      expect(certa.eco).toBeUndefined();
    }
  });
});
