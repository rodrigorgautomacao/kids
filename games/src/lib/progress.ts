// Progresso da saga "A Grande Jornada" (persistido em localStorage)

export interface GameProgress {
  stars: number; // 1 a 3
  plays: number; // vezes que chegou ao fim (capítulo completado)
}

export type ProgressMap = Record<string, GameProgress>;

export const MAX_STARS_PER_GAME = 3;

const KEY = 'kids-saga-progress-v1';
const FREE_KEY = 'kids-saga-free-v1';

export function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Registra a conclusão de um capítulo: mantém a melhor estrela e soma a jogada. */
export function completeGame(gameId: string, stars: number): ProgressMap {
  const map = loadProgress();
  const prev = map[gameId] ?? { stars: 0, plays: 0 };
  map[gameId] = {
    stars: Math.max(prev.stars, stars),
    plays: prev.plays + 1,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* armazenamento indisponível: segue sem persistir */
  }
  return map;
}

export function setFreeMode(on: boolean) {
  try {
    localStorage.setItem(FREE_KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function isFreeMode(): boolean {
  try {
    return localStorage.getItem(FREE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Capítulo 0 (índice) sempre liberado; os demais exigem o anterior completado. */
export function isUnlocked(index: number, games: { id: string }[]): boolean {
  if (isFreeMode()) return true;
  if (index <= 0) return true;
  const prev = games[index - 1];
  return (loadProgress()[prev.id]?.plays ?? 0) > 0;
}

export function totalStars(map: ProgressMap): number {
  return Object.values(map).reduce((acc, g) => acc + g.stars, 0);
}