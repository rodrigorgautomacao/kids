// Valida o currículo do "Estudo da Semana" (`data/estudoSemana.ts`) — o que a
// tela depende para não quebrar em silêncio: ids únicos, mês/ano coerentes,
// estrutura de 3 tempos completa, pergunta com 3 opções e tom de graça.
//
// 🔒 Estes testes são a trava das regras de conteúdo da vertical (ADR-001):
//   · o jogo NUNCA mostra texto bíblico → as referências são o que aparece;
//   · sem marca de igreja, sem oferta/dízimo/loja/revista, sem dinheiro;
//   · `explicacao` é quem ensina: ela não pode começar com "errou"/"não".
//
// ⚠️ Crescem junto com o material: quando o dono entregar outro mês em
// `MESES_ESTUDO`, some com as contagens fixas e conte o que existe.

import { describe, expect, it } from 'vitest';
import {
  ESTUDO_MES_ATUAL,
  MESES_ESTUDO,
  MESES_ESTUDO_MESES,
  TRILHOS,
  licoesDoMes,
  licoesPorTema,
  semanaDoMes,
  type LicaoEstudo,
  type TrilhoEstudo,
} from './estudoSemana';

/** Todas as lições de todos os meses, achatadas. */
const TODAS: LicaoEstudo[] = MESES_ESTUDO.flatMap((m) => m.licoes);

/** Só os campos que a criança lê (nada de comentário de arquivo). */
function conteudoDaLicao(l: LicaoEstudo): string[] {
  return [
    l.titulo,
    l.tema,
    l.historia,
    l.ideia,
    l.praticando,
    l.pergunta.enunciado,
    l.pergunta.explicacao,
    ...l.pergunta.alternativas,
    ...l.leituras,
    ...l.referencias.map((r) => r.ref),
  ];
}

/** Marca de igreja, oferta, dinheiro ou colete. Conteúdo de criança = zero. */
const PALAVRAS_PROIBIDAS = [
  'igreja',
  'lagoinha',
  'pastor',
  'oferta',
  'dízimo',
  'loja',
  'culto',
  'revista',
  'caderneta',
  'assine',
];

/** A atividade tem de acontecer em casa, sem gastar dinheiro. */
const PALAVRAS_DE_DINHEIRO = ['compr', 'loja', 'dinheiro', 'pague'];

/**
 * Ordem de leitura que a tela aplica: o tema do mês (semana 0) primeiro, depois
 * a semana 1..4. `licoesDoMes` devolve em ordem de dado (trilho/semana), então a
 * tela precisa reordenar — este helper fixa esse contrato para o teste.
 */
function ordemSemanaTela(l: LicaoEstudo): number {
  return l.semana === 0 ? -1 : l.semana;
}

describe('Estudo da Semana — o mês em foco', () => {
  it('tem pelo menos um mês e o mês em foco está na lista', () => {
    expect(MESES_ESTUDO.length).toBeGreaterThanOrEqual(1);
    expect(MESES_ESTUDO_MESES).toContain(ESTUDO_MES_ATUAL);
  });

  it('os ids de mês estão em ordem cronológica (crescente)', () => {
    const copia = [...MESES_ESTUDO_MESES];
    expect(copia).toEqual([...copia].sort());
    // e o array derivado bate com a ordem em que o material está escrito
    expect(copia).toEqual(MESES_ESTUDO.map((m) => m.id).sort());
  });

  it('cada mês tem nome, tema e um id AAAA-MM com início no mesmo mês', () => {
    for (const m of MESES_ESTUDO) {
      expect(m.id, m.id).toMatch(/^\d{4}-\d{2}$/);
      expect(m.nome.trim().length, m.id).toBeGreaterThan(3);
      expect(m.tema.trim().length, m.id).toBeGreaterThan(2);
      expect(m.inicio, m.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(m.inicio.slice(0, 7), m.id).toBe(m.id);
      expect(m.licoes.length, m.id).toBeGreaterThan(0);
    }
  });

  it('os três trilhos de idade existem e o `todos` é o tema do mês', () => {
    const ids = TRILHOS.map((t) => t.id);
    expect(ids).toContain('baby');
    expect(ids).toContain('4-6');
    expect(ids).toContain('7-9');
    expect(ids).toContain('todos');
    for (const t of TRILHOS) {
      expect(t.nome.trim().length, t.id).toBeGreaterThan(2);
      expect(t.idade.trim().length, t.id).toBeGreaterThan(2);
    }
  });
});

describe('Estudo da Semana — lições', () => {
  it('toda lição tem id único (o histórico é indexado por id)', () => {
    const ids = TODAS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('o id da lição carrega mês, trilho e semana (o id sobrevive a conteúdo novo)', () => {
    for (const l of TODAS) {
      expect(l.id, l.id).toBe(`${l.mes}-${l.trilho}-s${l.semana}`);
      expect(l.semana, l.id).toBeGreaterThanOrEqual(0);
      expect(l.semana, l.id).toBeLessThanOrEqual(4);
    }
  });

  it('`mes`, `ano` e `mesNumero` batem com o mês que contém a lição', () => {
    for (const m of MESES_ESTUDO) {
      const [ano, mes] = m.id.split('-');
      for (const l of m.licoes) {
        expect(l.mes, l.id).toBe(m.id);
        expect(l.ano, l.id).toBe(Number(ano));
        expect(l.mesNumero, l.id).toBe(Number(mes));
        expect(l.ano, l.id).toBeGreaterThan(2000);
        expect(l.mesNumero, l.id).toBeGreaterThanOrEqual(1);
        expect(l.mesNumero, l.id).toBeLessThanOrEqual(12);
      }
    }
  });

  it('a semana 0 é sempre o tema do mês (`todos`) e nunca se repete num trilho', () => {
    for (const m of MESES_ESTUDO) {
      const tema = m.licoes.filter((l) => l.semana === 0);
      expect(tema.length, m.id).toBe(1);
      expect(tema[0].trilho, m.id).toBe('todos');
      // uma semana por faixa de idade dentro do mesmo mês
      const porTrilho = new Map<string, number[]>();
      for (const l of m.licoes) {
        if (l.trilho === 'todos') continue;
        const lista = porTrilho.get(l.trilho) ?? [];
        lista.push(l.semana);
        porTrilho.set(l.trilho, lista);
      }
      for (const [trilho, semanas] of porTrilho) {
        expect(new Set(semanas).size, `${m.id}/${trilho}`).toBe(semanas.length);
      }
    }
  });

  it('toda lição tem título, tema, história, ideia, atividade e ao menos uma referência', () => {
    for (const l of TODAS) {
      for (const campo of [l.titulo, l.tema, l.historia, l.ideia, l.praticando]) {
        expect(campo.trim().length, l.id).toBeGreaterThan(10);
      }
      expect(l.referencias.length, l.id).toBeGreaterThanOrEqual(1);
      for (const r of l.referencias) {
        expect(r.ref.trim().length, l.id).toBeGreaterThan(3);
      }
      // A tela mostra a referência como etiqueta: ela é o que sustenta a lição.
      expect(l.referencias[0].ref.trim().length, l.id).toBeGreaterThan(3);
    }
  });

  it('toda pergunta tem 3 opções cheias, correta em 0..2 e explicação', () => {
    for (const l of TODAS) {
      const p = l.pergunta;
      expect(p.alternativas, l.id).toHaveLength(3);
      for (const alt of p.alternativas) {
        expect(alt.trim().length, l.id).toBeGreaterThan(2);
      }
      expect(p.correta, l.id).toBeGreaterThanOrEqual(0);
      expect(p.correta, l.id).toBeLessThanOrEqual(2);
      expect(p.enunciado.trim().length, l.id).toBeGreaterThan(8);
      expect(p.explicacao.trim().length, l.id).toBeGreaterThan(15);
    }
  });

  it('a explicação é gentil: nunca começa com "errou"/"errado"/"não"', () => {
    for (const l of TODAS) {
      const inicio = l.pergunta.explicacao.trim().toLowerCase();
      expect(inicio, l.id).not.toMatch(/^(errou|errado|errada|não|nao)\b/);
    }
  });

  it('as opções são diferentes entre si (senão a pergunta tem duas certas)', () => {
    for (const l of TODAS) {
      const alts = l.pergunta.alternativas.map((a) => a.trim().toLowerCase());
      expect(new Set(alts).size, l.id).toBe(3);
    }
  });

  it('o texto bíblico não vem no material da tela (só a exceção atestada)', () => {
    // 2 Timóteo 3.16-17 é a ÚNICA passagem com redação atestada na fonte.
    const comTexto = TODAS.flatMap((l) =>
      l.referencias.filter((r) => r.texto.trim().length > 0).map((r) => `${l.id}: ${r.ref}`),
    );
    expect(comTexto.length).toBeGreaterThan(0);
    for (const item of comTexto) expect(item).toMatch(/2 Timóteo 3\.1[67]/);
  });
});

describe('Estudo da Semana — os helpers que a tela usa', () => {
  // ⚠️ contagem FIXA do material atual (outubro/2026): 4 semanas por faixa +
  // 1 tema do mês. Quando entrar outro mês, este número cresce sozinho — ajuste
  // aqui, não no código da tela.
  const faixas: TrilhoEstudo[] = ['baby', '4-6', '7-9'];

  it('licoesDoMes devolve as 4 semanas + o tema do mês (semana 0) para cada faixa', () => {
    for (const trilho of faixas) {
      const licoes = licoesDoMes(ESTUDO_MES_ATUAL, trilho);
      expect(licoes, trilho).toHaveLength(5);
      expect(licoes.filter((l) => l.semana === 0), trilho).toHaveLength(1);
      for (const semana of [1, 2, 3, 4]) {
        expect(licoes.filter((l) => l.semana === semana), `${trilho}/s${semana}`).toHaveLength(1);
      }
      // o tema do mês vale para todas as faixas (a tela o põe no topo da lista)
      expect(licoes.filter((l) => l.trilho === 'todos'), trilho).toHaveLength(1);
      const ordemTela = [...licoes].sort((a, b) => ordemSemanaTela(a) - ordemSemanaTela(b));
      expect(ordemTela[0].semana, trilho).toBe(0);
      expect(ordemTela[0].trilho, trilho).toBe('todos');
      expect(ordemTela.slice(1).map((l) => l.semana), trilho).toEqual([1, 2, 3, 4]);
    }
  });

  it('licoesDoMes nunca devolve a lição de outro trilho', () => {
    for (const trilho of faixas) {
      for (const l of licoesDoMes(ESTUDO_MES_ATUAL, trilho)) {
        expect(['baby', '4-6', '7-9', 'todos'], l.id).toContain(l.trilho);
        if (l.trilho !== 'todos') expect(l.trilho, l.id).toBe(trilho);
      }
    }
  });

  it('licoesDoMes de um mês que não existe devolve lista vazia (não quebra)', () => {
    expect(licoesDoMes('1900-01', '7-9')).toEqual([]);
  });

  it('semanaDoMes(0) devolve o tema do mês, que serve a toda faixa', () => {
    for (const trilho of faixas) {
      const tema = semanaDoMes(ESTUDO_MES_ATUAL, 0, trilho);
      expect(tema, trilho).toBeDefined();
      expect(tema?.trilho, trilho).toBe('todos');
      expect(tema?.tema, trilho).toBe(MESES_ESTUDO.find((m) => m.id === ESTUDO_MES_ATUAL)?.tema.split('(')[0]?.trim());
    }
  });

  it('semanaDoMes acha cada semana e devolve undefined no que não existe', () => {
    for (const semana of [1, 2, 3, 4]) {
      expect(semanaDoMes(ESTUDO_MES_ATUAL, semana, '7-9')?.semana).toBe(semana);
    }
    expect(semanaDoMes(ESTUDO_MES_ATUAL, 9, '7-9')).toBeUndefined();
    expect(semanaDoMes('1900-01', 1, 'baby')).toBeUndefined();
  });

  it('licoesPorTema acha o tema do mês e devolve vazio no tema que não existe', () => {
    const temaDoMes = semanaDoMes(ESTUDO_MES_ATUAL, 0, 'baby')?.tema ?? '';
    expect(temaDoMes.length).toBeGreaterThan(2);
    expect(licoesPorTema(temaDoMes, 'baby')).toHaveLength(1);
    expect(licoesPorTema(temaDoMes, '7-9')).toHaveLength(1);
    expect(licoesPorTema('Tema Que Não Existe', 'baby')).toEqual([]);
  });

  it('toda lição de um mês tem tema presente em MESES_ESTUDO (o filtro "por tema" acha)', () => {
    for (const trilho of faixas) {
      for (const l of licoesDoMes(ESTUDO_MES_ATUAL, trilho)) {
        const achadas = licoesPorTema(l.tema, trilho).filter((x) => x.id === l.id);
        expect(achadas, l.id).toHaveLength(1);
      }
    }
  });
});

describe('Estudo da Semana — regras de conteúdo da vertical', () => {
  it('nenhum texto da criança tem marca de igreja, oferta, loja ou revista', () => {
    for (const l of TODAS) {
      const alvo = conteudoDaLicao(l).join(' · ').toLowerCase();
      for (const palavra of PALAVRAS_PROIBIDAS) {
        expect(alvo.includes(palavra), `${l.id} contém "${palavra}"`).toBe(false);
      }
    }
  });

  it('nenhuma atividade manda comprar, pagar ou gastar dinheiro', () => {
    for (const l of TODAS) {
      const alvo = l.praticando.toLowerCase();
      for (const palavra of PALAVRAS_DE_DINHEIRO) {
        expect(alvo.includes(palavra), `${l.id} manda "${palavra}"`).toBe(false);
      }
    }
  });

  it('o convite a abrir a Bíblia está sempre ancorado numa referência', () => {
    for (const l of TODAS) {
      // toda lição aponta para a Escritura (regra de ouro da casa)
      expect(l.referencias.length, l.id).toBeGreaterThanOrEqual(1);
      for (const r of l.referencias) {
        expect(r.ref, l.id).toMatch(/^[1-3]?\s?[A-Za-zçãáéíóúâêôÃÁÉÍÓÚÂÊÔÇ]+ \d+/);
      }
    }
  });
});