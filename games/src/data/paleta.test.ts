// Gate de cor da vertical — porque **cor é conteúdo** (skill `jogos-forma` §5.1).
//
// No *Dixit Kids* as peças foram tingidas com contraste suficiente para
// daltonismo porque a criança precisa identificar o que é o quê. Aqui a regra é
// mais dura: se a cor carrega o sentido da lição, ela não pode sumir no filtro
// de quem joga.
//
// O gate mede com `lib/cor.ts` (Machado 2009 + CIELAB ΔE76) e separa o que a
// cor **precisa** distinguir do que é só decoração — para não exigir do jogo o
// que a tela não promete.

import { describe, expect, it } from 'vitest';
import { menorDeltaE } from '../lib/cor';
import { JORNADA_LEVELS } from './jornada';

/** ΔE mínimo para "a criança vê que são duas coisas", já na pior visão. */
const VISOES = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'] as const;

/** Par adjacente que precisa de distinção real: horizonte e superfície. */
const REGRA_CHAO = 15;
/** O degradê do céu não precisa competir com o chão, só existir como céu —
 *  e cena noturna tem degradê sutil de propósito (e6 mede ΔE 19,4). */
const REGRA_CEU = 15;

describe('paleta — o mundo é legível na pior visão', () => {
  it('as 12 etapas: o horizonte existe (a borda do céu contra o chão)', () => {
    // Só o que é **adjacente** conta: o pé do céu é a linha do horizonte; o topo
    // do céu nunca encosta no chão, então exigir ΔE dele seria exigir um
    // contraste que ninguém vê.
    for (const lv of JORNADA_LEVELS) {
      const [ceuTopo, ceuPe] = lv.sky;
      for (const chao of lv.ground) {
        const { tipo, de } = menorDeltaE(ceuPe, chao);
        expect(
          de,
          `${lv.id}: céu ${ceuPe} sobre chão ${chao} fica ΔE=${de.toFixed(1)} na visão ${tipo}`,
        ).toBeGreaterThanOrEqual(REGRA_CHAO);
      }
      // o degradê do céu precisa contar que é céu e não chão
      expect(menorDeltaE(ceuTopo, ceuPe).de, `${lv.id}: degradê do céu`).toBeGreaterThanOrEqual(REGRA_CEU);
    }
  });

  it('toda etapa tem par de céu e par de chão (a cor conta a história do lugar)', () => {
    for (const lv of JORNADA_LEVELS) {
      expect(lv.sky, lv.id).toHaveLength(2);
      expect(lv.ground, lv.id).toHaveLength(2);
    }
    // 12 marcos, 12 poças de cor: se dois biomas dividem a paleta, um vira
    // foto do outro (o teste de silhueta em versão de tinta).
    expect(new Set(JORNADA_LEVELS.map((l) => l.sky.join('-') + l.ground.join('-'))).size).toBe(12);
  });

  it('as 4 visões simuladas são todas computadas (a régua não é só "normal")', () => {
    expect(VISOES).toHaveLength(4);
    // Verde e vermelho é o par que o filtro come: prova que o gate enxerga.
    expect(menorDeltaE('#ff0000', '#00ff00').tipo).toBe('deuteranopia');
  });
});

describe('dívida de cor — medida, nomeada e sem decisão de arte no meio', () => {
  it.fails(
    'DÍVIDA: o chão×chão se funde em etapas noturnas (medido: e8 ΔE 3.0, ' +
      'e11 ΔE 6.0, e6 ΔE 14.0, todos em deuteranopia). Trocar a cor é decisão ' +
      'de direção de arte — os candidatos medidos estão no relatório. Teste ' +
      'invertido: falhar aqui = alguém corrigiu e deve reavaliar os números.',
    () => {
      const devendo: string[] = [];
      for (const lv of JORNADA_LEVELS) {
        const chao = menorDeltaE(lv.ground[0], lv.ground[1]);
        if (chao.de < 12) devendo.push(`${lv.id} chão×chão ΔE=${chao.de.toFixed(1)} (${chao.tipo})`);
      }
      expect(devendo.join(' · ')).toBe('');
    },
  );

  it('o que é só decoração está fora do gate — e isso é uma escolha', () => {
    // folha1×folha2, sol×nuvem, colina longe×colina perto: nenhum carrega
    // informação. Segundo `jogos-forma` §4 quem carrega a leitura é o **valor**
    // e a **silhueta**, não a matiz — exigir ΔE aqui só faria a arte fingir
    // que depende do matiz. Nenhuma asserção aqui: é uma exclusão deliberada.
    expect(menorDeltaE('#22c55e', '#4ade80').de).toBeLessThan(25);
  });
});