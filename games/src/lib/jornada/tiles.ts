// Mapa em tiles: parse de `string[]` e consultas de colisão/entidades.

import { TILE } from './constants';
import type { TileChar } from './types';

export interface TileMap {
  width: number;
  height: number;
  grid: TileChar[][];
  /** Espinhos/bichinhos/serpentes nascem onde estão no mapa. */
  spawns: { kind: 'spike' | 'bug' | 'snake' | 'despair'; x: number; y: number }[];
  checkpoints: { x: number; y: number }[];
  seeds: { x: number; y: number }[];
  shields: { x: number; y: number }[];
  rocks: { x: number; y: number }[];
  gate: { x: number; y: number } | null;
  detours: { x: number; y: number }[];
}

const SPAWN_KINDS: Record<string, 'spike' | 'bug' | 'snake' | 'despair'> = {
  S: 'spike',
  b: 'bug',
  n: 'snake',
  d: 'despair',
};

/** Converte as linhas do mapa em grid + listas de entidades. Linhas devem ter a mesma largura. */
export function parseMap(rows: readonly string[]): TileMap {
  const height = rows.length;
  const width = rows.reduce((w, r) => Math.max(w, r.length), 0);
  const grid: TileChar[][] = [];
  const spawns: TileMap['spawns'] = [];
  const checkpoints: TileMap['checkpoints'] = [];
  const seeds: TileMap['seeds'] = [];
  const shields: TileMap['shields'] = [];
  const rocks: TileMap['rocks'] = [];
  const detours: TileMap['detours'] = [];
  let gate: TileMap['gate'] = null;

  for (let y = 0; y < height; y++) {
    const row: TileChar[] = [];
    const line = rows[y] ?? '';
    for (let x = 0; x < width; x++) {
      const ch = (line[x] ?? '.') as TileChar;
      const kind = SPAWN_KINDS[ch];
      if (kind) spawns.push({ kind, x: x * TILE, y: y * TILE });
      if (ch === 'g') checkpoints.push({ x: x * TILE, y: y * TILE });
      if (ch === 'o') seeds.push({ x: x * TILE, y: y * TILE });
      if (ch === 'E') shields.push({ x: x * TILE, y: y * TILE });
      if (ch === '?') rocks.push({ x: x * TILE, y: y * TILE });
      if (ch === '!') gate = { x: x * TILE, y: y * TILE };
      if (ch === 'c') detours.push({ x: x * TILE, y: y * TILE });
      // Entidades viram ar no grid (o motor cuida delas).
      row.push(kind || ch === 'o' || ch === 'E' || ch === 'g' || ch === '!' ? '.' : ch);
    }
    grid.push(row);
  }

  return { width, height, grid, spawns, checkpoints, seeds, shields, rocks, gate, detours };
}

/** Tile em coordenadas de mundo (arredonda para baixo). */
export function tileAt(map: TileMap, wx: number, wy: number): TileChar {
  const tx = Math.floor(wx / TILE);
  const ty = Math.floor(wy / TILE);
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return '.';
  return map.grid[ty][tx];
}

/** Sólido para colisão lateral/inferior (nunca as plataformas one-way). */
export function isSolid(map: TileMap, wx: number, wy: number): boolean {
  const t = tileAt(map, wx, wy);
  return t === '#' || t === '?' || t === 'x' || t === 'w';
}

/** Plataforma: sólida só para quem vem de cima. */
export function isPlatform(map: TileMap, wx: number, wy: number): boolean {
  return tileAt(map, wx, wy) === '=';
}

/** Oclusão de um retângulo contra o grid (AABB). */
export function rectHitsSolid(
  map: TileMap,
  x: number,
  y: number,
  w: number,
  h: number,
  oneWay: boolean,
): boolean {
  const x0 = Math.floor(x / TILE);
  const x1 = Math.floor((x + w - 0.001) / TILE);
  const y0 = Math.floor(y / TILE);
  const y1 = Math.floor((y + h - 0.001) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const wx = tx * TILE + TILE / 2;
      const wy = ty * TILE + TILE / 2;
      if (isSolid(map, wx, wy)) return true;
      if (oneWay && isPlatform(map, wx, wy)) return true;
    }
  }
  return false;
}
