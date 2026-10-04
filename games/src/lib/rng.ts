// PRNG determinístico da vertical (skill `jogos-arquitetura` §3).
//
// 🔒 `Math.random()` não entra em decisão de conteúdo. Sorteado com
// `Math.random()` o embaralhamento de um mini-jogo não pode ser reproduzido,
// então "a criança viu esta ordem" é impossível de provar num teste. Por isso
// `minigame.shuffle` recebe o `rng` por injeção: o jogo pode passar
// `Math.random` em produção e uma semente fixa no teste — mesmo código, as duas
// vezes verificável.
//
// `mulberry32`: 32 bits, rápido, sem estado global, mesma semente → mesma
// sequência. Cópia só de estudo, usado em geradores e PRNG próprios.

export type Rng = () => number;

/** Gerador semeado. Mesma semente → mesma sequência, sempre. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Semente de sessão: única por partida, estável dentro dela. */
export function seedDeSessao(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

/** Um item do array (`rng` decide). Devolve o primeiro se o array estiver vazio. */
export function pick<T>(rng: Rng, a: readonly T[]): T {
  return a[Math.floor(rng() * a.length)];
}

/** Fisher–Yates com o `rng` dado (não mexe no array original). */
export function shuffleCom<T>(rng: Rng, a: readonly T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}