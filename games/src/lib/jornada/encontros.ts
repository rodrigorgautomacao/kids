// Encontros com escolhas — o CORAÇÃO de *O Peregrino* (skill `jogos-biblicos`).
//
// Em Bunyan, a jornada do Peregrino não é um traversal: é uma sequência de
// ENCONTROS. Cada personagem do livro (Evangelista, Boa Vontade, o Intérprete,
// Pliável, as companheiras, a Voz que Orienta, os mercadores, o Grande
// Desespero, a Ignorância, Esperança e os dois Seres Brilhantes) para o
// Peregrino na estrada e propõe uma escolha. É isso que faltava no jogo: só
// havia mecânica.
//
// Travas desta casa (ADR-010, `jogos-biblicos` §3/§5):
//  · BUNYAN É INSPIRAÇÃO, NÃO AUTORIDADE — toda palavra é ORIGINAL, zero citação
//    de tradução; Jesus nunca é portrayal nem nomeado como personagem (a Voz que
//    Orienta / Boa Vontade cuidam disso).
//  · SEM CONFESIONAIS — nada de Apolião, Belzebu, Papado, pagãos.
//  · TOM DE GRAÇA — errar NUNCA pune: a opção errada é corrigida com doçura pela
//    própria personagem e a criança pode escolher de novo (sem game over, sem
//    perder semente/selo/estrela).
//  · REFERÊNCIA NAA por encontro, exibida DEPOIS da ação (regra de ouro).

export type EfeitoEncontro = 'semente' | 'escudo' | 'luz' | 'comunhao';

export interface OpcaoEncontro {
  /** Botão grande da criança (≤ 6 palavras — `jogos-qa` §1 usabilidade). */
  texto: string;
  /** Exatamente uma opção por encontro. */
  certa?: boolean;
  /** Resposta gentil do NPC quando a criança escolhe esta (opção errada). */
  eco?: string;
}

export interface Encontro {
  id: string;
  /** Etapa onde o encontro acontece (`jornada.ts` → `id`). */
  nivel: string;
  /** Nome do personagem do livro. */
  npc: string;
  /** Quem ele é no livro — texto de tela, NÃO falado. */
  papel: string;
  /** Fala do NPC (texto e voz). */
  fala: string;
  opcoes: OpcaoEncontro[];
  /** O que o NPC diz quando a criança acerta. */
  acerto: string;
  ref: string;
  efeito: EfeitoEncontro;
  /**
   * Fração da largura do mapa onde o NPC espera (0..1). Mapas são
   * procedurais, então o gatilho é posicional, não coordenada fixa.
   */
  at: number;
}

export const EFEITOS: readonly EfeitoEncontro[] = ['semente', 'escudo', 'luz', 'comunhao'];

/** Palavras que violam ADR-010 §1.4 (sem confessional, sem citação de tradução). */
const PROIBIDAS = [
  'apolião',
  'apolion',
  'belzebu',
  'beelzebub',
  'papado',
  'catolicismo',
  'pagão',
  'pagao',
  'bastão',
];

export function opcaoCerta(e: Encontro): OpcaoEncontro {
  const c = e.opcoes.filter((o) => o.certa);
  if (c.length !== 1) throw new Error(`${e.id}: escolha inválida (${c.length} certas)`);
  return c[0];
}

/** Retorna as falhas de um encontro (lista vazia = válido). Usado nos testes. */
export function validarEncontro(e: Encontro, nivelValido: (id: string) => boolean): string[] {
  const erros: string[] = [];
  if (!e.id || !e.npc || !e.fala || !e.papel) erros.push('campo de texto vazio');
  if (opcoesInvalidas(e).length) erros.push('escolhas: precisa de 2–3 opções e exatamente 1 certa');
  if (!e.ref.endsWith('(NAA)')) erros.push('referência sem (NAA)');
  if (!e.acerto) erros.push('falta a fala de acerto');
  if (!EFEITOS.includes(e.efeito)) erros.push(`efeito inválido: ${e.efeito}`);
  if (!(e.at > 0 && e.at < 0.9)) erros.push(`gatilho fora da estrada: at=${e.at}`);
  if (!nivelValido(e.nivel)) erros.push(`nível inexistente: ${e.nivel}`);
  const tudo = `${e.npc} ${e.fala} ${e.papel} ${e.acerto} ${e.opcoes.map((o) => `${o.texto} ${o.eco ?? ''}`).join(' ')}`.toLowerCase();
  for (const p of PROIBIDAS) if (tudo.includes(p)) erros.push(`palavra proibida: ${p}`);
  if ((e.fala.match(/\S+/g) ?? []).length > 16) erros.push('fala longa demais para o áudio');
  return erros;
}

function opcoesInvalidas(e: Encontro): string[] {
  if (e.opcoes.length < 2 || e.opcoes.length > 3) return ['quantidade'];
  if (e.opcoes.filter((o) => o.certa).length !== 1) return ['certa'];
  if (e.opcoes.some((o) => !o.texto || (o.texto.match(/\S+/g) ?? []).length > 6)) return ['texto longo'];
  if (e.opcoes.filter((o) => !o.certa).some((o) => !o.eco)) return ['erro sem correção do NPC'];
  return [];
}
