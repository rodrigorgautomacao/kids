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
/**
 * Curva de dificuldade em 3 faixas. Antes as 10 fases tinham exatamente a mesma
 * estrutura (3 vãos de 128–164 px, mesmos apoios) e só mudava a semente do
 * RNG — a fase 10 era a fase 1 com outro jitter (achado sev 3, revisão `jogos-2d`).
 *
 * Regra dura da geração: nenhum vão passa de 80% do alcance parado com a folga
 * da regra de ouro — o gate `clearability.test.ts` verifica, não confie só aqui.
 */
const FAIXAS = [
  // 1–3: aquecimento. Poucos vãos, largos de sobra, mundo curto.
  { n: 2, min: 110, max: 132, span: [1180, 2260], width: 3400 },
  // 4–7: varye o padrão, um apoio extra por fase.
  { n: 3, min: 128, max: 156, span: [1060, 1980, 2760], width: 3600 },
  // 8–10: combinação. Vãos largos, mundo longo, dois apoios num deles.
  { n: 3, min: 146, max: 168, span: [1000, 1900, 2700], width: 4000 },
] as const;

export function buildLevel(index: number, easy: boolean): LevelGeom {
  const rng = mulberry32(1000 + index * 977);
  const faixa = FAIXAS[index <= 3 ? 0 : index <= 7 ? 1 : 2];
  const width = faixa.width;
  const groundY = WORLD_H - 92;

  // Buracos: o primeiro mais tarde (tempo de aprender), depois espaçados.
  const pitCount = easy ? Math.max(2, faixa.n - 1) : faixa.n;
  const pitSpan = easy ? [1180, 2260, 3200] : faixa.span;
  const pits: { x: number; w: number }[] = [];
  for (let i = 0; i < pitCount; i++) {
    const base = pitSpan[i] ?? 900 + i * 700;
    const x = base + rng() * 90;
    const w = easy ? 96 + rng() * 22 : faixa.min + rng() * (faixa.max - faixa.min);
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
    // Apoio do vão: no Modo Pequeninos ele nunca invade o vão (senão vira teto
    // no lábio do buraco e engole o pulo de quem chega devagar).
    const apoioW = easy ? 88 : 104;
    const apoioX = Math.max(pit.x + 4, pit.x + pit.w / 2 - apoioW / 2);
    solids.push({
      x: apoioX,
      // No Pequeninos o apoio é baixo de propósito: uma criança que só toca
      // (pulinho ≈ 68 px) sobe nele e atravessa em dois toques.
      y: groundY - (easy ? 54 : 104),
      w: Math.min(apoioW, pit.x + pit.w - 4 - apoioX),
      h: 18,
      oneWay: true,
    });
    if (!easy && rng() > 0.55) {
      // Variação: ALTURA ALCANÇÁVEL (ápice ≈ 156 px), não decoração de 190 px.
      solids.push({
        x: pit.x - 150 - rng() * 60,
        y: groundY - 104 - rng() * 26,
        w: 96,
        h: 16,
        oneWay: true,
      });
    }
  }
  // Duas plataformas decorativas (com flor em cima no render): agora são
  // degraus REAIS e alcançáveis (118/140 px < ápice 156 px), sentido único.
  for (let i = 0; i < 2; i++) {
    const x = 620 + i * 1180 + rng() * 120;
    if (!pits.some((p) => x > p.x - 160 && x < p.x + p.w + 160)) {
      solids.push({ x, y: groundY - 112 - i * 16, w: 110, h: 16, oneWay: true });
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

  // NPCs: 4 comuns + o guardião, SEMPRE no chão firme (nunca sobre o vazio —
  // era o "loop de começar caindo": duelo abria com o herói caindo no buraco).
  const firm = (x: number) =>
    solids.some((s) => s.y >= groundY - 2 && x >= s.x && x <= s.x + s.w);
  const snapToFirm = (x: number) => {
    if (firm(x)) return x;
    for (let d = 24; d < width; d += 24) {
      if (firm(x + d)) return Math.min(width - 60, x + d);
      if (firm(x - d)) return Math.max(60, x - d);
    }
    return 120;
  };
  const fractions = [0.16, 0.31, 0.47, 0.63, 0.85];
  const npcs: NpcSpawn[] = fractions.map((f, i) => ({
    id: `npc-${i + 1}`,
    x: snapToFirm(Math.round(f * width)),
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
