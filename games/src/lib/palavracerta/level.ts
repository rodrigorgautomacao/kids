// Geração determinística das 10 fases de A Palavra Certa.
//
// Cada fase tem o mesmo "esqueleto" (chão com 2–3 buracos, árvores, 4 NPCs +
// guardião e o Portão no fim) com variação por semente — a criança reconhece a
// estrutura e se surpreende com o desenho. Cair no buraco NUNCA puni: o motor
// devolve ao último ponto seguro (`game-design` §3).

import type { LevelGeom, Rect, NpcSpawn, TreeDef } from './types';

export const WORLD_H = 480;
export const HERO_H = 54;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Constrói a geometria da fase `index` (1–10).
 * `easy` (Modo Pequeninos) estreita os buracos e planta plataformas de apoio.
 */
export function buildLevel(index: number, easy: boolean): LevelGeom {
  const rng = mulberry32(1000 + index * 977);
  const width = 3400;
  const groundY = WORLD_H - 92;

  // Buracos: o primeiro mais tarde (tempo de aprender), depois espaçados.
  const pitCount = easy ? 2 : 3;
  const pitSpan = easy ? [1180, 2260] : [1060, 1980, 2760];
  const pits: { x: number; w: number }[] = [];
  for (let i = 0; i < pitCount; i++) {
    const base = pitSpan[i] ?? 900 + i * 700;
    const x = base + rng() * 90;
    const w = (easy ? 96 : 128) + rng() * (easy ? 22 : 36);
    // nunca encostar no portão nem no início
    if (x + w < width - 420 && x > 420) pits.push({ x, w });
  }
  pits.sort((a, b) => a.x - b.x);

  // Segmentos de chão entre os buracos.
  const solids: Rect[] = [];
  let cursor = 0;
  for (const pit of pits) {
    solids.push({ x: cursor, y: groundY, w: pit.x - cursor, h: WORLD_H - groundY + 80 });
    cursor = pit.x + pit.w;
  }
  solids.push({ x: cursor, y: groundY, w: width - cursor, h: WORLD_H - groundY + 80 });

  // Plataformas de apoio sobre cada buraco + plataformas de variação.
  for (const pit of pits) {
    solids.push({
      x: pit.x + pit.w / 2 - (easy ? 62 : 52),
      y: groundY - (easy ? 86 : 104),
      w: easy ? 124 : 104,
      h: 18,
    });
    if (!easy && rng() > 0.55) {
      solids.push({
        x: pit.x - 150 - rng() * 60,
        y: groundY - 150 - rng() * 40,
        w: 96,
        h: 16,
      });
    }
  }
  // Duas plataformas altas decorativas (com flor em cima no render).
  for (let i = 0; i < 2; i++) {
    const x = 620 + i * 1180 + rng() * 120;
    if (!pits.some((p) => x > p.x - 160 && x < p.x + p.w + 160)) {
      solids.push({ x, y: groundY - 168 - i * 26, w: 110, h: 16 });
    }
  }

  // Árvores e arbustos (fora dos buracos).
  const trees: TreeDef[] = [];
  for (let x = 140; x < width - 260; x += 150 + rng() * 130) {
    const inPit = pits.some((p) => x > p.x - 40 && x < p.x + p.w + 40);
    if (inPit) continue;
    trees.push({ x, size: 54 + rng() * 30, kind: Math.floor(rng() * 3) });
  }
  const bushes: { x: number; size: number }[] = [];
  for (let x = 80; x < width - 120; x += 90 + rng() * 140) {
    const inPit = pits.some((p) => x > p.x - 20 && x < p.x + p.w + 20);
    if (inPit) continue;
    bushes.push({ x, size: 16 + rng() * 12 });
  }
  const flowers: { x: number; kind: number }[] = [];
  for (let x = 60; x < width - 80; x += 55 + rng() * 110) {
    const inPit = pits.some((p) => x > p.x && x < p.x + p.w);
    if (inPit) continue;
    flowers.push({ x, kind: Math.floor(rng() * 3) });
  }

  // NPCs: 4 comuns + o guardião, sempre no chão firme.
  const fractions = [0.11, 0.29, 0.47, 0.65, 0.87];
  const npcs: NpcSpawn[] = fractions.map((f, i) => ({
    id: `npc-${i + 1}`,
    x: Math.round(f * width),
    guardiao: i === 4,
  }));

  return {
    width,
    groundY,
    solids,
    pits,
    trees,
    bushes,
    flowers,
    npcs,
    gateX: width - 170,
  };
}
