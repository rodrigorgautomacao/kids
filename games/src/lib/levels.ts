// Sistema de níveis dos mini-jogos (Fase 13).
//
// Cada jogo define `levels: GameLevel<R>[]` (no mínimo 5). O hook cuida do
// avanço entre níveis, das estrelas (persistidas por nível em `lib/progress`)
// e do mapa de níveis — os motores só precisam chamar `completeRound()` quando
// a criança acerta a rodada.
//
// Regra da casa: erro nunca pune; as estrelas do nível seguem 0 erro = 3 ⭐,
// até 3 = 2 ⭐, mais = 1 ⭐ (`starsForWrong`).

import { useRef, useState } from 'react';
import {
  completeLevel,
  isLevelUnlocked,
  loadLevels,
  levelBest,
  nextUnfinishedLevel,
} from './progress';
import { starsForWrong } from './minigame';

export const MIN_LEVELS = 5;

export interface GameLevel<R> {
  id: string;
  /** Nome curto mostrado no HUD/mapa (ex.: "Peças 6"). */
  name?: string;
  rounds: R[];
}

/** Nível inicial: o primeiro ainda não concluído (retoma de onde parou). */
export function startLevel(gameId: string, total: number): number {
  return Math.max(0, Math.min(total - 1, nextUnfinishedLevel(loadLevels(), gameId, total) - 1));
}

/**
 * Divide um pool de rodadas em níveis de tamanho fixo (na ordem do pool).
 * Usado pelos jogos cujo conteúdo é uma lista corrida de rodadas.
 */
export function chunkLevels<R>(pool: R[], perLevel: number): GameLevel<R>[] {
  const size = Math.max(1, perLevel);
  const levels: GameLevel<R>[] = [];
  for (let i = 0; i < pool.length; i += size) {
    levels.push({ id: `n${levels.length + 1}`, rounds: pool.slice(i, i + size) });
  }
  return levels;
}

export interface MapItem {
  id: string;
  label: string;
  sublabel?: string;
  stars: number;
  maxStars: number;
  locked?: boolean;
  done?: boolean;
  emoji?: string;
}

/** Itens do `LevelMap` para um jogo (estrelas + cadeado por nível). */
export function levelMapItems<R>(
  gameId: string,
  levels: GameLevel<R>[],
  label: (i: number, level: GameLevel<R>) => string,
  sublabel?: (i: number, level: GameLevel<R>) => string,
  emoji?: (i: number, level: GameLevel<R>) => string,
): MapItem[] {
  const map = loadLevels();
  return levels.map((lv, i) => {
    const stars = levelBest(map, gameId, i + 1);
    return {
      id: lv.id,
      label: label(i, lv),
      sublabel: sublabel?.(i, lv),
      stars,
      maxStars: 3,
      locked: !isLevelUnlocked(map, gameId, i + 1),
      done: stars > 0,
      emoji: emoji?.(i, lv),
    };
  });
}

export interface LevelState<R> {
  levels: GameLevel<R>[];
  levelIdx: number;
  roundIdx: number;
  level: GameLevel<R>;
  round: R | undefined;
  wrong: number;
  stars: number;
  /** 'playing' enquanto joga; 'done' na tela de fim de nível. */
  phase: 'playing' | 'done';
  hasNextLevel: boolean;
  mapOpen: boolean;
  setMapOpen: (v: boolean) => void;
  /** Conta um erro do nível (não pune). */
  addWrong: () => void;
  /** Conclui a rodada; se era a última, fecha o nível. */
  completeRound: () => void;
  /** Vai para o próximo nível. */
  goNextLevel: () => void;
  /** Recomeça o nível atual. */
  replayLevel: () => void;
  /** Começa do nível 1. */
  resetGame: () => void;
  /** Pula para um nível (mapa). */
  goToLevel: (index: number) => void;
}

export function useLevelState<R>(gameId: string, levels: GameLevel<R>[]): LevelState<R> {
  const [levelIdx, setLevelIdx] = useState(() => startLevel(gameId, levels.length));
  const [roundIdx, setRoundIdx] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [stars, setStars] = useState(3);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [mapOpen, setMapOpen] = useState(false);
  const wrongRef = useRef(0);

  const level = levels[levelIdx];
  const round = level?.rounds[roundIdx];
  const hasNextLevel = levelIdx + 1 < levels.length;

  function addWrong() {
    wrongRef.current += 1;
    setWrong(wrongRef.current);
  }

  function completeRound() {
    if (!level) return;
    if (roundIdx + 1 < level.rounds.length) {
      setRoundIdx((r) => r + 1);
      return;
    }
    const s = starsForWrong(wrongRef.current);
    setStars(s);
    completeLevel(gameId, levelIdx + 1, s);
    setPhase('done');
  }

  function goNextLevel() {
    if (!hasNextLevel) return;
    setLevelIdx((i) => i + 1);
    setRoundIdx(0);
    wrongRef.current = 0;
    setWrong(0);
    setPhase('playing');
  }

  function replayLevel() {
    setRoundIdx(0);
    wrongRef.current = 0;
    setWrong(0);
    setPhase('playing');
  }

  function resetGame() {
    setLevelIdx(0);
    setRoundIdx(0);
    wrongRef.current = 0;
    setWrong(0);
    setStars(3);
    setPhase('playing');
  }

  function goToLevel(index: number) {
    setLevelIdx(Math.max(0, Math.min(levels.length - 1, index)));
    setRoundIdx(0);
    wrongRef.current = 0;
    setWrong(0);
    setPhase('playing');
    setMapOpen(false);
  }

  return {
    levels,
    levelIdx,
    roundIdx,
    level,
    round,
    wrong,
    stars,
    phase,
    hasNextLevel,
    mapOpen,
    setMapOpen,
    addWrong,
    completeRound,
    goNextLevel,
    replayLevel,
    resetGame,
    goToLevel,
  };
}
