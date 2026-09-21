// Progresso por capítulo/nível (localStorage) — alimenta o "Continuar" do Hub.

import { beforeEach, describe, expect, it } from 'vitest';
import {
  bestScore,
  completeLevel,
  levelBest,
  loadLevels,
  nextUnfinishedLevel,
  submitScore,
  totalStars,
} from './progress';

const GAME = 'aventura-biblica';

beforeEach(() => {
  localStorage.clear();
});

describe('progress', () => {
  it('começa vazio', () => {
    expect(loadLevels()).toEqual({});
    expect(bestScore(GAME)).toBe(0);
    expect(nextUnfinishedLevel(loadLevels(), GAME)).toBe(1);
  });

  it('completeLevel salva a melhor estrela e soma as jogadas', () => {
    const map = completeLevel(GAME, 1, 2);
    expect(levelBest(map, GAME, 1)).toBe(2);
    expect(map[GAME][1].plays).toBe(1);

    const map2 = completeLevel(GAME, 1, 3);
    expect(levelBest(map2, GAME, 1)).toBe(3);
    expect(map2[GAME][1].plays).toBe(2);
  });

  it('não regride estrelas', () => {
    completeLevel(GAME, 1, 3);
    const map = completeLevel(GAME, 1, 1);
    expect(levelBest(map, GAME, 1)).toBe(3);
  });

  it('nextUnfinishedLevel pula os níveis concluídos', () => {
    const map = completeLevel(GAME, 1, 1);
    expect(nextUnfinishedLevel(map, GAME)).toBe(2);
  });

  it('submitScore mantém a maior pontuação', () => {
    expect(submitScore(GAME, 10)).toBe(10);
    expect(submitScore(GAME, 40)).toBe(40);
    expect(submitScore(GAME, 5)).toBe(40);
    expect(bestScore(GAME)).toBe(40);
  });

  it('totalStars soma as melhores estrelas', () => {
    let map = completeLevel(GAME, 1, 2);
    map = completeLevel(GAME, 2, 3);
    expect(totalStars(map)).toBe(5);
  });
});