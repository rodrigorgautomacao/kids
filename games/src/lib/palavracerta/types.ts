// Tipos do motor de plataforma (compartilhado por A Palavra Certa e futuros
// jogos de lado). Motor desenhado em `GAME_DESIGN.md` §6.1: Canvas 2D, mundo em
// coordenadas lógicas (altura fixa 480), loop fora do React.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * Plataforma de sentido único: pode atravessar por baixo, mas pousa em cima.
   * Sem isso, uma plataforma alta vira "teto" que engole o pulo e teleporta a
   * criança para baixo sem nenhum aviso (achado sev 3 da revisão jogos-2d).
   */
  oneWay?: boolean;
}

export interface TreeDef {
  x: number;
  /** altura da copa (px lógicos) */
  size: number;
  kind: number;
}

export interface NpcSpawn {
  id: string;
  x: number;
  guardiao: boolean;
}

export interface LevelGeom {
  width: number;
  groundY: number;
  /** chão (segmentos entre buracos) + plataformas flutuantes */
  solids: Rect[];
  /** buracos no chão (cair volta ao último ponto seguro, sem punição) */
  pits: { x: number; w: number }[];
  trees: TreeDef[];
  bushes: { x: number; size: number }[];
  flowers: { x: number; kind: number }[];
  npcs: NpcSpawn[];
  gateX: number;
}

export type BiomeId =
  | 'amanhecer'
  | 'pomar'
  | 'mercado'
  | 'escola'
  | 'rio'
  | 'floresta'
  | 'montanha'
  | 'cidade'
  | 'ponte'
  | 'portao';

export interface Palette {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  sun: string;
  cloud: string;
  hillFar: string;
  hillMid: string;
  grass: string;
  grassDark: string;
  dirt: string;
  dirtDark: string;
  trunk: string;
  leaf1: string;
  leaf2: string;
  flower: string;
  /** brilho/acentos (portão, partículas) */
  accent: string;
  water: boolean;
  fireflies: boolean;
  city: boolean;
}

export interface HeroRuntime {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  state: 'idle' | 'walk' | 'jump' | 'fall' | 'happy' | 'sad';
  walkPhase: number;
  /** respiração/pose parada */
  breathe: number;
  /** squash & stretch (1 = normal; >1 estica na subida; <1 achata no pouso) */
  squash: number;
}

export type NpcAnim = 'idle' | 'thinking' | 'happy';

export interface NpcRuntime {
  id: string;
  x: number;
  guardiao: boolean;
  defeated: boolean;
  anim: NpcAnim;
  look: NpcLookCanvas;
  /** fase da respiração (desenho) */
  phase: number;
}

/** Aparência do NPC no canvas (espelha `art/Npc.tsx`, em cores simples). */
export interface NpcLookCanvas {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'wavy' | 'buzz';
  robe: string;
  headwear: 'none' | 'crown' | 'hood' | 'headband' | 'hat';
  headwearColor: string;
  prop: 'none' | 'basket' | 'book' | 'staff' | 'flower' | 'balloon' | 'umbrella' | 'lantern' | 'bread' | 'fishing';
}
