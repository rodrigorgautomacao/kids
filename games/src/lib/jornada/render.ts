// Render da "A Grande Jornada" em Canvas 2D — desenho animado jogável.
//
// Camadas (de trás para frente): gradiente do céu → estrelas → sol/lua dinâmico
// → nuvens → morros (parallax) → árvores ao vento → tiles → itens → inimigos →
// herói → luz/sombra → partículas → HUD. Tudo com a paleta de cada etapa.

import { PLAYER_H, PLAYER_W, TILE, VIEW_H, VIEW_W } from './constants';
import { CENARIOS, type Paleta } from './scenarios';
import type { TileMap } from './tiles';
import type { EnemyState, PlatformerLevel, PlayerState } from './types';

export interface Scene {
  level: PlatformerLevel;
  map: TileMap;
  player: PlayerState;
  enemies: EnemyState[];
  seeds: { x: number; y: number; got: boolean }[];
  shields: { x: number; y: number; got: boolean }[];
  camX: number;
  camY: number;
  lightRadius: number;
  lightLevel: number;
  comunhao: number;
  seedCount: number;
  flash: number;
  time: number;
  reducedMotion: boolean;
}

/** Ruído determinístico 0..1 (decoração estável por tile/índice). */
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function wrap(v: number, span: number): number {
  return ((v % span) + span) % span;
}

export function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, s: Scene) {
  const scale = Math.min(w / VIEW_W, h / VIEW_H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = s.level.sky[1];
  ctx.fillRect(0, 0, w, h);
  ctx.translate((w - VIEW_W * scale) / 2, (h - VIEW_H * scale) / 2);
  ctx.scale(scale, scale);

  const camLeft = s.camX - VIEW_W / 2;
  const camTop = s.camY - VIEW_H / 2;
  const t = s.reducedMotion ? 0 : s.time;
  const night = (s.level.darkness ?? 0) > 0.5;

  drawSky(ctx, s, camLeft, t, night);
  drawClouds(ctx, camLeft, t, night);
  drawHills(ctx, camLeft, s);
  drawScenery(ctx, s, camLeft);
  drawTrees(ctx, s, camLeft, camTop, t);
  drawTiles(ctx, s, camLeft, camTop, t);
  drawPickups(ctx, s, camLeft, camTop);
  drawEnemies(ctx, s, camLeft, camTop, t);
  drawPlayer(ctx, s, camLeft, camTop, t);
  drawDarkness(ctx, s);
  drawMotes(ctx, camLeft, camTop, t, night);
  drawHud(ctx, s);
}

/* ══════════════════════════════ céu ══════════════════════════════ */

function drawSky(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, t: number, night: boolean) {
  const g = ctx.createLinearGradient(0, -40, 0, VIEW_H + 40);
  g.addColorStop(0, s.level.sky[0]);
  g.addColorStop(1, s.level.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(-40, -40, VIEW_W + 80, VIEW_H + 80);

  if (night) {
    // Estrelas cintilantes — a noite é bonita, não assustadora.
    for (let i = 0; i < 46; i++) {
      const sx = wrap(hash(i) * (VIEW_W + 200) - camLeft * 0.06, VIEW_W + 80) - 40;
      const sy = 14 + hash(i + 99) * (VIEW_H * 0.55);
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.7 + i * 2.1));
      ctx.fillStyle = `rgba(255,255,230,${tw})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + hash(i + 7) * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    drawMoon(ctx, t);
  } else {
    drawSun(ctx, t);
  }
}

function drawSun(ctx: CanvasRenderingContext2D, t: number) {
  const x = VIEW_W * 0.78;
  const y = 74;
  const pulse = 1 + Math.sin(t * 1.1) * 0.05;

  // Raios girando devagar.
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 0.12);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const len = (i % 2 === 0 ? 74 : 52) * pulse;
    ctx.fillStyle = `rgba(253,224,71,${0.14 + 0.06 * Math.sin(t * 2 + i)})`;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 26, Math.sin(a) * 26);
    ctx.lineTo(Math.cos(a + 0.12) * len, Math.sin(a + 0.12) * len);
    ctx.lineTo(Math.cos(a - 0.12) * len, Math.sin(a - 0.12) * len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Halo + disco.
  const halo = ctx.createRadialGradient(x, y, 8, x, y, 110 * pulse);
  halo.addColorStop(0, 'rgba(253,224,71,0.55)');
  halo.addColorStop(0.35, 'rgba(253,224,71,0.18)');
  halo.addColorStop(1, 'rgba(253,224,71,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x - 120, y - 120, 240, 240);

  const core = ctx.createRadialGradient(x - 6, y - 8, 2, x, y, 30 * pulse);
  core.addColorStop(0, '#fffdf3');
  core.addColorStop(0.55, '#fde68a');
  core.addColorStop(1, '#fbbf24');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, 28 * pulse, 0, Math.PI * 2);
  ctx.fill();
}

function drawMoon(ctx: CanvasRenderingContext2D, t: number) {
  const x = VIEW_W * 0.2;
  const y = 66;
  const halo = ctx.createRadialGradient(x, y, 6, x, y, 90);
  halo.addColorStop(0, 'rgba(226,232,240,0.5)');
  halo.addColorStop(1, 'rgba(226,232,240,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x - 100, y - 100, 200, 200);
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(148,163,184,0.5)';
  ctx.beginPath();
  ctx.arc(x - 7, y - 5, 5, 0, Math.PI * 2);
  ctx.arc(x + 8, y + 7, 4, 0, Math.PI * 2);
  ctx.arc(x + 3, y - 10, 3, 0, Math.PI * 2);
  ctx.fill();
  // Vagalume perto da lua.
  const fx = x + 40 + Math.sin(t * 0.8) * 12;
  const fy = y + 26 + Math.cos(t * 1.1) * 8;
  ctx.fillStyle = `rgba(253,224,71,${0.5 + 0.3 * Math.sin(t * 3)})`;
  ctx.beginPath();
  ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

/* ═════════════════════════════ nuvens ════════════════════════════ */

function drawClouds(ctx: CanvasRenderingContext2D, camLeft: number, t: number, night: boolean) {
  const tint = night ? 'rgba(148,163,184,0.85)' : 'rgba(255,255,255,0.95)';
  for (let i = 0; i < 7; i++) {
    const speed = 6 + hash(i) * 7;
    const span = VIEW_W + 420;
    const cx = wrap(hash(i + 31) * span + t * speed - camLeft * 0.18, span) - 210;
    const cy = 26 + hash(i + 55) * (VIEW_H * 0.34);
    const sc = 0.7 + hash(i + 77) * 0.75;
    drawCloud(ctx, cx, cy, sc, tint, i);
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, seed: number) {
  ctx.fillStyle = color;
  const puffs = 4 + (seed % 2);
  for (let i = 0; i < puffs; i++) {
    const px = x + (i - puffs / 2) * 16 * s;
    const py = y + Math.sin(i * 1.7 + seed) * 5 * s;
    const r = (15 + hash(seed * 10 + i) * 10) * s;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(x, y + 8 * s, 26 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* ═════════════════════════════ morros ════════════════════════════ */

function drawHills(ctx: CanvasRenderingContext2D, camLeft: number, s: Scene) {
  const layers: [number, string, number, number][] = [
    [0.12, s.level.ground[1], VIEW_H * 0.58, 34],
    [0.28, s.level.ground[0], VIEW_H * 0.68, 26],
  ];
  for (const [factor, color, baseY, amp] of layers) {
    ctx.fillStyle = color;
    ctx.globalAlpha = factor < 0.2 ? 0.4 : 0.55;
    ctx.beginPath();
    ctx.moveTo(-60, VIEW_H + 60);
    for (let x = -60; x <= VIEW_W + 60; x += 12) {
      const wx = (x + camLeft * factor) * 0.01;
      const y = baseY - Math.sin(wx * 1.6) * amp - Math.sin(wx * 0.7 + 2) * amp * 0.6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(VIEW_W + 60, VIEW_H + 60);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ══════════════════════ árvores, arbustos, flores ═════════════════ */

/** Fator de parallax do plano médio (entre os morros 0.12/0.28 e o mundo 1.0). */
const SCENERY_PARALLAX = 0.34;
/** Espaçamento entre repetições, em px de mundo. */
const SCENERY_SPAN = 300;
/** Escala base do cartão-postal. */
const SCENERY_SCALE = 0.62;

/**
 * Desenha o marco de Bunyan repetido no horizonte: a Feira das Vaidades tem
 * barracas, o Vale da Sombra tem garganta escura, a Cidade Celeste tem muralha
 * de luz. É o que faz a criança reconhecer a etapa de longe (skill
 * `jogos-visual` §6 — "cartão-postal", não "outro emoji").
 */
function drawScenery(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number) {
  const desenhar = CENARIOS[s.level.scenery];
  if (!desenhar) return;
  const paleta: Paleta = {
    silhueta: escurecer(s.level.ground[0], 0.34),
    destaque: lighten(s.level.ground[1], 0.12),
    clara: lighten(s.level.sky[1], 0.42),
  };
  const baseY = VIEW_H * 0.72;
  ctx.globalAlpha = 0.9;
  const primeiro = Math.floor((camLeft * SCENERY_PARALLAX - VIEW_W) / SCENERY_SPAN) - 1;
  const ultimo = Math.ceil((camLeft * SCENERY_PARALLAX + VIEW_W) / SCENERY_SPAN) + 1;
  for (let i = primeiro; i <= ultimo; i++) {
    const x = i * SCENERY_SPAN - camLeft * SCENERY_PARALLAX;
    // Variação de tamanho por repetição, para não virar papel de parede.
    const escala = SCENERY_SCALE * (0.88 + hash(i + 13) * 0.26);
    ctx.save();
    ctx.translate(x, baseY);
    ctx.scale(escala, escala);
    desenhar(ctx, paleta);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/** Escurece uma cor hex (só para a silhueta do cenário). */
function escurecer(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const cheio = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  const n = parseInt(cheio, 16);
  if (Number.isNaN(n)) return hex;
  const r = Math.round(((n >> 16) & 255) * (1 - amount));
  const g = Math.round(((n >> 8) & 255) * (1 - amount));
  const b = Math.round((n & 255) * (1 - amount));
  return `rgb(${r},${g},${b})`;
}

function drawTrees(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number, t: number) {
  const { map } = s;
  const x0 = Math.max(0, Math.floor(camLeft / TILE) - 2);
  const x1 = Math.min(map.width - 1, Math.ceil((camLeft + VIEW_W) / TILE) + 2);
  for (let tx = x0; tx <= x1; tx++) {
    const topY = groundTop(map, tx);
    if (topY < 0) continue;
    const wx = tx * TILE + TILE / 2;
    const r = hash(tx * 3.7);
    if (r > 0.72) {
      drawTree(ctx, wx - camLeft, topY - camTop, 0.85 + hash(tx + 5) * 0.5, t, tx, s);
    } else if (r > 0.55) {
      drawBush(ctx, wx - camLeft, topY - camTop, 12 + hash(tx + 9) * 8, s);
    } else if (r > 0.34) {
      drawFlower(ctx, wx - camLeft, topY - camTop, Math.floor(hash(tx + 13) * 3), t, tx, s);
    }
  }
}

/** Primeira linha sólida da coluna (topo do chão) ou -1. */
function groundTop(map: TileMap, tx: number): number {
  for (let ty = 0; ty < map.height; ty++) {
    const ch = map.grid[ty][tx];
    if (ch === '#' || ch === 'x' || ch === 'w') {
      // só vira "topo" se acima estiver livre
      const above = ty > 0 ? map.grid[ty - 1][tx] : '.';
      if (above === '.' || above === 'o' || above === 'c' || above === '~') return ty * TILE;
    }
  }
  return -1;
}

function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  size: number,
  t: number,
  seed: number,
  s: Scene,
) {
  const sway = s.reducedMotion ? 0 : Math.sin(t * 1.15 + seed * 0.6) * 3.2;
  const trunkH = 34 * size;

  // Tronco.
  ctx.fillStyle = '#8b5a2b';
  roundRect(ctx, x - 5 * size, baseY - trunkH, 10 * size, trunkH, 4);
  ctx.fill();
  ctx.fillStyle = 'rgba(93,58,26,0.55)';
  roundRect(ctx, x - 1.5 * size, baseY - trunkH, 3 * size, trunkH, 1.5);
  ctx.fill();

  // Copa (3 bolas) balançando com o vento.
  const cy = baseY - trunkH - 8 * size;
  const [c1, c2] = [s.level.ground[1], lighten(s.level.ground[1], 0.25)];
  const blobs: [number, number, number][] = [
    [-13 * size, 4 * size, 15 * size],
    [13 * size, 5 * size, 14 * size],
    [sway * 0.6, -8 * size, 18 * size],
  ];
  for (const [dx, dy, r] of blobs) {
    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.arc(x + dx + sway, cy + dy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c2;
    ctx.beginPath();
    ctx.arc(x + dx + sway - r * 0.3, cy + dy - r * 0.35, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, baseY: number, size: number, s: Scene) {
  ctx.fillStyle = s.level.ground[1];
  ctx.beginPath();
  ctx.arc(x - size * 0.5, baseY - size * 0.55, size * 0.62, 0, Math.PI * 2);
  ctx.arc(x + size * 0.5, baseY - size * 0.55, size * 0.58, 0, Math.PI * 2);
  ctx.arc(x, baseY - size * 0.95, size * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.arc(x - size * 0.3, baseY - size * 1.15, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  kind: number,
  t: number,
  seed: number,
  s: Scene,
) {
  const sway = s.reducedMotion ? 0 : Math.sin(t * 1.6 + seed) * 2;
  const colors = ['#f472b6', '#fbbf24', '#60a5fa'];
  ctx.strokeStyle = s.level.ground[1];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + sway, baseY - 10, x + sway, baseY - 16);
  ctx.stroke();
  ctx.fillStyle = colors[kind % 3];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + t * 0.3;
    ctx.beginPath();
    ctx.arc(x + sway + Math.cos(a) * 4.5, baseY - 16 + Math.sin(a) * 4.5, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(x + sway, baseY - 16, 3, 0, Math.PI * 2);
  ctx.fill();
}

function lighten(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) + 255 * amount));
  const g = Math.min(255, Math.round(((n >> 8) & 255) + 255 * amount));
  const b = Math.min(255, Math.round((n & 255) + 255 * amount));
  return `rgb(${r},${g},${b})`;
}

/* ═════════════════════════════ tiles ═════════════════════════════ */

function drawTiles(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number, t: number) {
  const { map } = s;
  const x0 = Math.max(0, Math.floor(camLeft / TILE) - 1);
  const x1 = Math.min(map.width - 1, Math.ceil((camLeft + VIEW_W) / TILE) + 1);
  const y0 = Math.max(0, Math.floor(camTop / TILE) - 1);
  const y1 = Math.min(map.height - 1, Math.ceil((camTop + VIEW_H) / TILE) + 1);

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const ch = map.grid[ty][tx];
      if (ch === '.') continue;
      drawTile(ctx, ch, tx * TILE - camLeft, ty * TILE - camTop, s, tx, ty, t);
    }
  }
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  s: Scene,
  tx: number,
  ty: number,
  t: number,
) {
  const [dirt, grass] = s.level.ground;
  const openAbove = ty === 0 || s.map.grid[ty - 1][tx] === '.' || s.map.grid[ty - 1][tx] === '~';

  switch (ch) {
    case '#': {
      ctx.fillStyle = dirt;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x, y + TILE - 4, TILE, 4);
      // Mata-cães de grama no topo aberto.
      if (openAbove) {
        ctx.fillStyle = grass;
        ctx.fillRect(x, y, TILE, 9);
        ctx.fillStyle = lighten(grass, 0.18);
        for (let i = 0; i < 3; i++) {
          const gx = x + 3 + i * 8;
          ctx.beginPath();
          ctx.arc(gx, y + 4, 4.2, Math.PI, 0);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(x, y, TILE, 2.5);
      }
      // Textura de terra.
      const speck = hash(tx * 13 + ty * 7);
      if (speck > 0.55) {
        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.fillRect(x + 4 + speck * 10, y + 12, 4, 3);
      }
      break;
    }
    case '=': {
      // Plataforma: tábua com grama em cima e vinha pendurada.
      ctx.fillStyle = '#a16207';
      roundRect(ctx, x - 1, y, TILE + 2, 11, 4);
      ctx.fill();
      ctx.fillStyle = grass;
      roundRect(ctx, x - 1, y - 2, TILE + 2, 7, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(x + 2, y + 1, TILE - 4, 2);
      ctx.strokeStyle = 'rgba(34,120,60,0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 7, y + 11);
      ctx.quadraticCurveTo(x + 4, y + 18, x + 8, y + 22);
      ctx.stroke();
      break;
    }
    case '?': {
      // A Rocha que Responde: pedra dourada marcada com pegada.
      const glow = ctx.createRadialGradient(x + 12, y + 12, 2, x + 12, y + 12, 22);
      glow.addColorStop(0, 'rgba(251,191,36,0.5)');
      glow.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 10, y - 10, 44, 44);
      ctx.fillStyle = '#d9a62e';
      roundRect(ctx, x + 1, y + 1, TILE - 2, TILE - 2, 8);
      ctx.fill();
      ctx.fillStyle = '#b8860b';
      roundRect(ctx, x + 4, y + 3, TILE - 8, TILE - 8, 6);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(x + 8, y + 8, 8, 9);
      ctx.fillRect(x + 6, y + 15, 4, 3);
      ctx.fillRect(x + 14, y + 15, 4, 3);
      break;
    }
    case 'x': {
      ctx.fillStyle = '#8b6b45';
      roundRect(ctx, x + 1, y + 1, TILE - 2, TILE - 2, 5);
      ctx.fill();
      ctx.fillStyle = '#5c8a3c';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 3 + i * 7, y + 8);
        ctx.lineTo(x + 6 + i * 7, y + 1);
        ctx.lineTo(x + 9 + i * 7, y + 8);
        ctx.fill();
      }
      break;
    }
    case 'w': {
      ctx.fillStyle = '#cbb28b';
      roundRect(ctx, x + 1, y + 1, TILE - 2, TILE - 2, 4);
      ctx.fill();
      ctx.fillStyle = '#a68b63';
      ctx.fillRect(x + 1, y + 1, TILE - 2, 3);
      ctx.fillRect(x + 10, y + 7, 3, 8);
      ctx.fillRect(x + 4, y + 16, 12, 3);
      break;
    }
    case 'g': {
      // A Rocha do Marco.
      const glow = ctx.createRadialGradient(x + 12, y + 12, 2, x + 12, y + 12, 24);
      glow.addColorStop(0, 'rgba(251,191,36,0.45)');
      glow.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 12, y - 12, 48, 48);
      ctx.fillStyle = '#94a3b8';
      roundRect(ctx, x + 2, y + 3, TILE - 4, TILE - 5, 9);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      roundRect(ctx, x + 5, y + 6, TILE - 10, TILE - 11, 7);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 9, y + 9, 6, 8);
      break;
    }
    case 'c': {
      if (s.lightLevel <= 0.5) break;
      ctx.globalAlpha = 0.5 + Math.sin(t * 3 + tx) * 0.18;
      ctx.fillStyle = '#f472b6';
      roundRect(ctx, x + 1, y + 9, TILE - 2, 11, 5);
      ctx.fill();
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(x + 4, y + 11, TILE - 8, 3);
      ctx.globalAlpha = 1;
      break;
    }
    case '~': {
      ctx.fillStyle = 'rgba(56,189,248,0.55)';
      ctx.fillRect(x, y + TILE * 0.35, TILE, TILE * 0.65);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + 2, y + TILE * 0.42, TILE - 4, 2);
      break;
    }
    default:
      break;
  }
}

/* ═════════════════════════════ itens ═════════════════════════════ */

function drawPickups(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number) {
  const bob = s.reducedMotion ? 0 : Math.sin(s.time * 3) * 3;
  for (const seed of s.seeds) {
    if (seed.got) continue;
    const x = seed.x + TILE / 2 - camLeft;
    const y = seed.y + TILE / 2 - camTop + bob;
    const glow = ctx.createRadialGradient(x, y, 1, x, y, 16);
    glow.addColorStop(0, 'rgba(253,224,71,0.95)');
    glow.addColorStop(1, 'rgba(253,224,71,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 16, y - 16, 32, 32);
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(x, y, 5.5, 8, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a3e635';
    roundRect(ctx, x - 1.5, y - 13, 3, 6, 1.5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(x - 1.8, y - 2, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const sh of s.shields) {
    if (sh.got) continue;
    const x = sh.x + TILE / 2 - camLeft;
    const y = sh.y + TILE / 2 - camTop + bob;
    const glow = ctx.createRadialGradient(x, y, 2, x, y, 20);
    glow.addColorStop(0, 'rgba(56,189,248,0.55)');
    glow.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 20, y - 20, 40, 40);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(x, y - 11);
    ctx.lineTo(x + 10, y - 5);
    ctx.lineTo(x + 10, y + 4);
    ctx.lineTo(x, y + 12);
    ctx.lineTo(x - 10, y + 4);
    ctx.lineTo(x - 10, y - 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(x - 2, y - 5, 4, 11);
    ctx.fillRect(x - 5.5, y - 1.5, 11, 4);
  }
}

/* ════════════════════════════ inimigos ═══════════════════════════ */

function drawEnemies(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number, t: number) {
  for (const e of s.enemies) {
    const x = e.x - camLeft;
    const y = e.y - camTop;
    if (e.transformed) {
      if (e.timer > 2.5) continue;
      if (e.kind === 'spike') {
        // Stomp transforma: vira flor (nunca morre).
        ctx.fillStyle = '#f472b6';
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + t;
          ctx.beginPath();
          ctx.arc(x + e.w / 2 + Math.cos(a) * 8, y + e.h / 2 + Math.sin(a) * 8, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(x + e.w / 2, y + e.h / 2, 5.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.kind === 'bug') {
        ctx.fillStyle = '#fde047';
        roundRect(ctx, x + 1, y + 1, e.w - 2, e.h - 2, 6);
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + e.w / 2 - 2.5, y + e.h / 2 - 2.5, 5, 5);
      }
      continue;
    }

    if (e.kind === 'spike') {
      // Espinho amigável: corpo verde arredondado com espinhos (sem rosto de mau).
      ctx.fillStyle = '#65a30d';
      roundRect(ctx, x, y, e.w, e.h, 7);
      ctx.fill();
      ctx.fillStyle = '#4d7c0f';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 3 + i * 7, y + 3);
        ctx.lineTo(x + 6.5 + i * 7, y - 7);
        ctx.lineTo(x + 10 + i * 7, y + 3);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath();
      ctx.arc(x + e.w * 0.32, y + e.h * 0.32, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.kind === 'bug') {
      ctx.fillStyle = '#a3e635';
      roundRect(ctx, x, y, e.w, e.h, 9);
      ctx.fill();
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.arc(x + 5, y + 7, 2, 0, Math.PI * 2);
      ctx.arc(x + e.w - 5, y + 7, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.kind === 'snake') {
      // Serpente da Haste: pula por cima — não causa dano (Nm 21.4-9).
      ctx.fillStyle = '#d4a017';
      roundRect(ctx, x - 4, y, e.w + 8, e.h, 11);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      roundRect(ctx, x + e.w / 2 - 2.5, y - 16, 5, 18, 2.5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + e.w / 2, y - 18, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x + e.w / 2 - 2.5, y - 19, 1.3, 0, Math.PI * 2);
      ctx.arc(x + e.w / 2 + 2.5, y - 19, 1.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.kind === 'despair') {
      const grow = e.grow * 18;
      const g = ctx.createLinearGradient(0, y - grow, 0, y + e.h);
      g.addColorStop(0, 'rgba(100,116,139,0.9)');
      g.addColorStop(1, 'rgba(71,85,105,0.95)');
      ctx.fillStyle = g;
      roundRect(ctx, x - 6, y - grow, e.w + 12, e.h + grow, 16);
      ctx.fill();
    }
  }
}

/* ═════════════════════ herói (peregrino) ═════════════════════════ */

function drawPlayer(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number, t: number) {
  const p = s.player;
  const x = p.x + PLAYER_W / 2 - camLeft;
  const feetY = p.y + PLAYER_H - camTop;
  const walking = p.onGround && Math.abs(p.vx) > 18;
  const walk = walking ? t * 11 : 0;

  // Sombra de contato.
  ctx.fillStyle = 'rgba(15,23,42,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, feetY + 1, 13, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();

  const bob = walking ? Math.abs(Math.sin(walk)) * 1.6 : Math.sin(t * 2.2) * 1.1;
  const topY = feetY - 30 - bob;

  ctx.save();
  ctx.translate(x, 0);

  /* ---- bordão (na mão de trás) ---- */
  const staffX = -8.5;
  ctx.strokeStyle = '#a06a35';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(staffX, feetY - 2);
  ctx.quadraticCurveTo(staffX - 1.5, feetY - 18, staffX + 1, topY - 4);
  ctx.stroke();
  ctx.fillStyle = '#c98a4b';
  ctx.beginPath();
  ctx.arc(staffX + 1, topY - 5, 2.6, 0, Math.PI * 2);
  ctx.fill();

  /* ---- pernas ---- */
  const swing = walking ? Math.sin(walk) * 0.55 : 0;
  const legA = p.onGround ? swing : -0.45;
  const legB = p.onGround ? -swing : 0.35;
  for (const [dx, ang] of [[-4, legA], [4, legB]] as const) {
    ctx.save();
    ctx.translate(dx, feetY - 11);
    ctx.rotate(ang);
    ctx.fillStyle = '#7c4a24';
    roundRect(ctx, -3.2, -1, 6.4, 11, 3);
    ctx.fill();
    ctx.fillStyle = '#4a2c12';
    roundRect(ctx, -3.8, 8, 8, 3.6, 1.8);
    ctx.fill();
    ctx.restore();
  }

  /* ---- túnica + faixa + bolsa ---- */
  const breathe = 1 + Math.sin(t * 2.1) * (p.onGround ? 0.022 : 0.01);
  ctx.save();
  ctx.translate(0, feetY - 17);
  ctx.scale(1, breathe);
  const tg = ctx.createLinearGradient(0, -10, 0, 11);
  tg.addColorStop(0, '#e8663c');
  tg.addColorStop(1, '#c24c2a');
  ctx.fillStyle = tg;
  roundRect(ctx, -8.2, -10, 16.4, 21, 6.5);
  ctx.fill();
  // Faixa amarela.
  ctx.fillStyle = '#f6c445';
  roundRect(ctx, -8.2, 3.4, 16.4, 3.8, 1.8);
  ctx.fill();
  // Alça da bolsa.
  ctx.strokeStyle = '#7c3f1d';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -9);
  ctx.lineTo(4.5, 4);
  ctx.stroke();
  ctx.fillStyle = '#8b5a2b';
  roundRect(ctx, 2.5, 2, 6, 7, 2);
  ctx.fill();
  ctx.restore();

  /* ---- braços ---- */
  const armSwing = walking ? -swing * 0.8 : p.vy < -40 ? -1.5 : p.vy > 60 ? -0.9 : 0.18;
  // Braço de trás (com o bordão).
  ctx.save();
  ctx.translate(-7.5, feetY - 23.5);
  ctx.rotate(-0.35 + armSwing * 0.3);
  ctx.fillStyle = '#c24c2a';
  roundRect(ctx, -2.8, -1.5, 5.6, 11, 2.8);
  ctx.fill();
  ctx.fillStyle = '#f6c9a0';
  ctx.beginPath();
  ctx.arc(0, 10.2, 2.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Braço da frente (balança).
  ctx.save();
  ctx.translate(7.5, feetY - 23.5);
  ctx.rotate(-armSwing * 0.9 + 0.25);
  ctx.fillStyle = '#e8663c';
  roundRect(ctx, -2.8, -1.5, 5.6, 11, 2.8);
  ctx.fill();
  ctx.fillStyle = '#f6c9a0';
  ctx.beginPath();
  ctx.arc(0, 10.2, 2.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* ---- cabeça ---- */
  const headY = topY + 7;
  const look = p.facing > 0 ? 1.1 : -1.1;

  const hg = ctx.createRadialGradient(-3, headY - 4, 2, 0, headY, 11);
  hg.addColorStop(0, '#fbd8b2');
  hg.addColorStop(1, '#f0b988');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(0, headY, 10, 0, Math.PI * 2);
  ctx.fill();

  // Cabelo (mecha lateral).
  ctx.fillStyle = '#6b3f1d';
  ctx.beginPath();
  ctx.arc(0, headY - 2.2, 10, Math.PI * 1.02, Math.PI * 1.98);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-6.5, headY - 4.5, 3.6, 0, Math.PI * 2);
  ctx.arc(6.2, headY - 5, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Orelhas.
  ctx.fillStyle = '#f0b988';
  ctx.beginPath();
  ctx.arc(-9.6, headY + 1.2, 2.1, 0, Math.PI * 2);
  ctx.arc(9.6, headY + 1.2, 2.1, 0, Math.PI * 2);
  ctx.fill();

  // Olhos (com brilho) + sobrancelhas.
  const eyeY = headY + 0.6;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-3.6 + look * 0.5, eyeY, 2.7, 3.1, 0, 0, Math.PI * 2);
  ctx.ellipse(4.1 + look * 0.5, eyeY, 2.7, 3.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3b2412';
  ctx.beginPath();
  ctx.arc(-3.3 + look, eyeY + 0.4, 1.55, 0, Math.PI * 2);
  ctx.arc(4.4 + look, eyeY + 0.4, 1.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-2.8 + look, eyeY - 0.6, 0.65, 0, Math.PI * 2);
  ctx.arc(4.9 + look, eyeY - 0.6, 0.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5b3a20';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6 + look * 0.5, eyeY - 4.2);
  ctx.quadraticCurveTo(-3.5 + look * 0.5, eyeY - 5.4, -1.2 + look * 0.5, eyeY - 4.4);
  ctx.moveTo(1.9 + look * 0.5, eyeY - 4.4);
  ctx.quadraticCurveTo(4.3 + look * 0.5, eyeY - 5.4, 6.6 + look * 0.5, eyeY - 4.2);
  ctx.stroke();

  // Bochechas + sorriso (feição acolhedora).
  ctx.fillStyle = 'rgba(244,114,182,0.4)';
  ctx.beginPath();
  ctx.arc(-6.4, headY + 3.6, 2.3, 0, Math.PI * 2);
  ctx.arc(6.9, headY + 3.6, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a4b2a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (p.vy > 120 && !p.onGround) {
    ctx.arc(0.5 + look * 0.3, headY + 6.2, 1.9, Math.PI * 1.15, Math.PI * 1.85); // concentrado
  } else {
    ctx.arc(0.5 + look * 0.3, headY + 3.9, 3.2, 0.15 * Math.PI, 0.85 * Math.PI);
  }
  ctx.stroke();

  ctx.restore();

  // Escudo da Fé: anel suave (nunca armadura de combate).
  if (p.shield) {
    ctx.strokeStyle = 'rgba(56,189,248,0.85)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(x, feetY - 16, 22 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(56,189,248,0.12)';
    ctx.fill();
  }
}

/* ══════════════════════ luz / o Sono do Coração ══════════════════ */

function drawDarkness(ctx: CanvasRenderingContext2D, s: Scene) {
  const base = s.level.darkness ?? 0;
  if (base <= 0.02) return;
  // A luz (Comunhão + sementes) afasta a escuridão — nunca o contrário.
  const alpha = base * (0.82 - 0.62 * s.lightLevel);
  if (alpha <= 0.02) return;
  const px = s.player.x + PLAYER_W / 2 - (s.camX - VIEW_W / 2);
  const py = s.player.y + PLAYER_H / 2 - (s.camY - VIEW_H / 2);
  const g = ctx.createRadialGradient(px, py, s.lightRadius * 0.3, px, py, s.lightRadius * 1.15);
  g.addColorStop(0, 'rgba(30,27,75,0)');
  g.addColorStop(0.65, `rgba(30,27,75,${alpha * 0.35})`);
  g.addColorStop(1, `rgba(30,27,75,${Math.min(0.88, alpha)})`);
  ctx.fillStyle = g;
  ctx.fillRect(-40, -40, VIEW_W + 80, VIEW_H + 80);
}

/* ══════════════════════ partículas ambientes ═════════════════════ */

function drawMotes(
  ctx: CanvasRenderingContext2D,
  camLeft: number,
  camTop: number,
  t: number,
  night: boolean,
) {
  const count = night ? 16 : 10;
  for (let i = 0; i < count; i++) {
    const span = VIEW_W + 120;
    const mx = wrap(hash(i + 401) * span + t * (7 + hash(i) * 10) - camLeft * 0.5, span) - 60;
    const my =
      wrap(hash(i + 555) * (VIEW_H + 90) + Math.sin(t * 0.8 + i) * 16 - camTop * 0.12, VIEW_H + 90) - 45;
    const glow = night ? 0.35 + 0.35 * Math.sin(t * 2.4 + i * 1.7) : 0.16;
    const color = night ? `rgba(253,224,71,${glow})` : `rgba(255,255,255,${glow})`;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(mx, my, night ? 2.1 : 1.7, 0, Math.PI * 2);
    ctx.fill();
    if (night) {
      ctx.fillStyle = `rgba(253,224,71,${glow * 0.25})`;
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* ═════════════════════════════ HUD ══════════════════════════════ */

function drawHud(ctx: CanvasRenderingContext2D, s: Scene) {
  // Sementes coletadas (a luz acumulada).
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  roundRect(ctx, 12, 12, 100, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.ellipse(31, 28, 5.5, 8, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a3e635';
  ctx.fillRect(29.5, 17, 3, 5);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px ui-rounded, system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(`× ${s.seedCount}`, 46, 29);

  // Comunhão (oração) — estado, nunca moeda.
  const bx = VIEW_W - 138;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  roundRect(ctx, bx, 12, 126, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px ui-rounded, system-ui, sans-serif';
  ctx.fillText('Comunhão', bx + 12, 21);
  ctx.fillStyle = 'rgba(15,23,42,0.18)';
  roundRect(ctx, bx + 12, 27, 102, 9, 4.5);
  ctx.fill();
  const bw = Math.max(0, Math.min(1, s.comunhao)) * 102;
  if (bw > 1) {
    const grad = ctx.createLinearGradient(bx + 12, 0, bx + 114, 0);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = grad;
    roundRect(ctx, bx + 12, 27, bw, 9, 4.5);
    ctx.fill();
  }

  if (s.flash > 0) {
    ctx.fillStyle = `rgba(253,224,71,${s.flash * 0.16})`;
    ctx.fillRect(-40, -40, VIEW_W + 80, VIEW_H + 80);
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
