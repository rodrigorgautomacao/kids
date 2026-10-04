// Helpers comuns dos mini-jogos (Fase 11).
//
// Mantém o mesmo vocabulário dos jogos existentes: embaralhar sem repetir
// posição e a regra de estrelas da casa (0 erro = 3 ⭐, até 3 = 2 ⭐, resto = 1 ⭐).

import { shuffleCom, type Rng } from './rng';

/**
 * Fisher–Yates: devolve uma cópia embaralhada (não mexe no array original).
 *
 * @param rng injetável para quem precisa de determinismo (conteúdo testável,
 *            sessão reproduzível). O padrão continua sendo `Math.random`.
 */
export function shuffle<T>(a: readonly T[], rng: Rng = Math.random): T[] {
  return shuffleCom(rng, a);
}

/** Estrelas por quantidade de erros — nunca reprova a criança (mínimo 1 ⭐). */
export function starsForWrong(wrong: number): 1 | 2 | 3 {
  return wrong === 0 ? 3 : wrong <= 3 ? 2 : 1;
}
