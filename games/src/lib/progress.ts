// Progresso da saga "A Grande Jornada" — por CAPÍTULO e NÍVEL (persistido em localStorage)
//
// Cada capítulo tem MAX_LEVELS_PER_GAME níveis (1..N). Cada nível vale 1 a 3 estrelas.
// Um capítulo está "em aberto" quando o anterior tem pelo menos 1 nível concluído.

export interface LevelRecord {
  /** melhor estrela conquistada no nível (1-3); 0 = nunca concluído */
  best: number;
  /** quantas vezes o nível foi concluído */
  plays: number;
}

export type LevelMap = Record<number, LevelRecord>;
export type ProgressMap = Record<string, LevelMap>;

export const MAX_LEVELS_PER_GAME = 10;

const KEY = 'kids-saga-progress-v2';
const FREE_KEY = 'kids-saga-free-v1';
const SCORE_KEY = 'kids-saga-scores-v1';

/* ------------------------------- leitura ------------------------------- */

export function loadLevels(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function levelBest(map: ProgressMap, gameId: string, level: number): number {
  return map[gameId]?.[level]?.best ?? 0;
}

export function levelRecord(map: ProgressMap, gameId: string, level: number): LevelRecord {
  return map[gameId]?.[level] ?? { best: 0, plays: 0 };
}

/* ------------------------------- gravação ------------------------------ */

/**
 * Registra a conclusão de um nível: mantém a melhor estrela e soma a jogada.
 * `level` é 1-based (1..MAX_LEVELS_PER_GAME).
 */
export function completeLevel(gameId: string, level: number, stars: number): ProgressMap {
  const map = loadLevels();
  const prev = map[gameId]?.[level] ?? { best: 0, plays: 0 };
  const next: ProgressMap = {
    ...map,
    [gameId]: {
      ...(map[gameId] ?? {}),
      [level]: { best: Math.max(prev.best, stars), plays: prev.plays + 1 },
    },
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* armazenamento indisponível: segue sem persistir */
  }
  return next;
}

/* ------------------------------ modo livre ------------------------------ */

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

/* ------------------------------ recordes ------------------------------ */

/** Melhor pontuação já registrada de um jogo (0 = nunca pontuou) */
export function bestScore(gameId: string): number {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? (parsed[gameId] ?? 0) : 0;
  } catch {
    return 0;
  }
}

/** Registra a pontuação; mantém o maior valor já alcançado. */
export function submitScore(gameId: string, score: number): number {
  try {
    const prev = bestScore(gameId);
    const next = Math.max(prev, score);
    localStorage.setItem(SCORE_KEY, JSON.stringify({ ...loadScores(), [gameId]: next }));
    return next;
  } catch {
    return score;
  }
}

function loadScores(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/* ------------------------------- agregados ------------------------------ */

/** Quantos níveis de um capítulo já foram concluídos (0..MAX_LEVELS_PER_GAME) */
export function chapterLevelsDone(map: ProgressMap, gameId: string): number {
  const levels = map[gameId] ?? {};
  return Object.values(levels).filter((r) => r.best > 0).length;
}

/** Soma das melhores estrelas de um capítulo */
export function chapterStars(map: ProgressMap, gameId: string): number {
  const levels = map[gameId] ?? {};
  return Object.values(levels).reduce((acc, r) => acc + r.best, 0);
}

/** Total de níveis concluídos em toda a saga (respeitando o nº de níveis de cada capítulo) */
export function totalLevelsDone(
  map: ProgressMap,
  gameIds: string[],
  levelsOf: (game: { id: string }) => number = () => MAX_LEVELS_PER_GAME,
): number {
  return gameIds.reduce((acc, id) => {
    const total = levelsOf({ id });
    const done = chapterLevelsDone(map, id);
    return acc + Math.min(done, total);
  }, 0);
}

/** Total de estrelas em toda a saga */
export function totalStars(map: ProgressMap): number {
  return Object.values(map).reduce(
    (acc, levels) => acc + Object.values(levels).reduce((a, r) => a + r.best, 0),
    0,
  );
}

/* -------------------------------- unlocks -------------------------------- */

/** Capítulo 0 sempre liberado; os demais exigem ≥1 nível no anterior. */
export function isChapterUnlocked(
  index: number,
  games: { id: string }[],
  map: ProgressMap,
): boolean {
  if (isFreeMode()) return true;
  if (index <= 0) return true;
  return chapterLevelsDone(map, games[index - 1].id) > 0;
}

/** Nível 1 sempre liberado; os demais exigem o nível anterior concluído. */
export function isLevelUnlocked(
  map: ProgressMap,
  gameId: string,
  level: number,
): boolean {
  if (isFreeMode()) return true;
  if (level <= 1) return true;
  return (map[gameId]?.[level - 1]?.best ?? 0) > 0;
}

/**
 * Primeiro nível ainda não concluído (para deixar o jogador continuar
 * de onde parou). Se todos já foram concluídos, volta para o nível 1
 * (permite revisar e tentar as 3 estrelas de novo).
 */
export function nextUnfinishedLevel(
  map: ProgressMap,
  gameId: string,
  totalLevels: number = MAX_LEVELS_PER_GAME,
): number {
  for (let l = 1; l <= totalLevels; l++) {
    if ((map[gameId]?.[l]?.best ?? 0) === 0) return l;
  }
  return 1;
}