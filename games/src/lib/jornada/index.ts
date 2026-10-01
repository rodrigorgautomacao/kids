// Ponto único de importação do motor da "A Grande Jornada".
//
//   import { JornadaEngine, type PlatformerLevel } from '../lib/jornada';
//
// Módulo isolado de `lib/platformer/` (outro jogo, "A Palavra Certa") de
// propósito: dois motores de plataforma em paralelo não podem se sobrescrever.

export {
  COMUNHAO_DRAIN,
  COMUNHAO_DRAIN_SMALL_KIDS,
  JUMP_CUT,
  JUMP_VELOCITY,
  LIGHT_BASE,
  LIGHT_PER_SEED,
  PLAYER_H,
  PLAYER_W,
  TILE,
  VIEW_H,
  VIEW_W,
} from './constants';
export { JornadaEngine, type EngineOptions } from './engine';
export { createPlayer, jumpHeightPx, stepPlayer } from './physics';
export { isSolid, parseMap, rectHitsSolid, tileAt, type TileMap } from './tiles';
export type {
  EngineEvent,
  EnemyState,
  InputState,
  PlatformerLevel,
  PlayerState,
  TileChar,
} from './types';
