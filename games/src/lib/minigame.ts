// Helpers comuns dos mini-jogos (Fase 11).
//
// Mantém o mesmo vocabulário dos jogos existentes: embaralhar sem repetir
// posição e a regra de estrelas da casa (0 erro = 3 ⭐, até 3 = 2 ⭐, resto = 1 ⭐).

/** Fisher–Yates: devolve uma cópia embaralhada (não mexe no array original). */
export function shuffle<T>(a: readonly T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Estrelas por quantidade de erros — nunca reprova a criança (mínimo 1 ⭐). */
export function starsForWrong(wrong: number): 1 | 2 | 3 {
  return wrong === 0 ? 3 : wrong <= 3 ? 2 : 1;
}
