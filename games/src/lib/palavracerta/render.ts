// Renderização do motor de plataforma — "desenho animado jogável" em Canvas 2D.
//
// Direção de arte (skill `jogos-visual`): contornos grossos, formas
// arredondadas, sombra dura de contato, 3 camadas de parallax, vento balançando
// as copas e partículas leves (folhas, poeira, vagalumes). Sem blur, sem
// imagem externa, teto de partículas — roda liso em celular.

import type { BiomeId, HeroRuntime, LevelGeom, NpcRuntime, Palette, Rect } from './types';

export type Ctx = CanvasRenderingContext2D;

export const PALETTES: Record<BiomeId, Palette> = {
  amanhecer: {
    skyTop: '#38bdf8', skyMid: '#7dd3fc', skyBottom: '#fef3c7', sun: '#fde68a',
    cloud: '#ffffff', hillFar: '#86efac', hillMid: '#4ade80', grass: '#22c55e',
    grassDark: '#15803d', dirt: '#a16207', dirtDark: '#78350f', trunk: '#7c4a24',
    leaf1: '#22c55e', leaf2: '#4ade80', flower: '#f472b6', accent: '#fbbf24',
    water: false, fireflies: false, city: false,
  },
  pomar: {
    skyTop: '#0ea5e9', skyMid: '#38bdf8', skyBottom: '#fde68a', sun: '#fbbf24',
    cloud: '#fff7ed', hillFar: '#bef264', hillMid: '#84cc16', grass: '#65a30d',
    grassDark: '#4d7c0f', dirt: '#b45309', dirtDark: '#78350f', trunk: '#6b3f1d',
    leaf1: '#84cc16', leaf2: '#a3e635', flower: '#f59e0b', accent: '#facc15',
    water: false, fireflies: false, city: false,
  },
  mercado: {
    skyTop: '#0284c7', skyMid: '#38bdf8', skyBottom: '#e0f2fe', sun: '#fde68a',
    cloud: '#f8fafc', hillFar: '#a5b4fc', hillMid: '#818cf8', grass: '#34d399',
    grassDark: '#059669', dirt: '#d97706', dirtDark: '#92400e', trunk: '#7c4a24',
    leaf1: '#34d399', leaf2: '#6ee7b7', flower: '#f43f5e', accent: '#fb7185',
    water: false, fireflies: false, city: true,
  },
  escola: {
    skyTop: '#2563eb', skyMid: '#60a5fa', skyBottom: '#dbeafe', sun: '#fef08a',
    cloud: '#ffffff', hillFar: '#93c5fd', hillMid: '#60a5fa', grass: '#22c55e',
    grassDark: '#166534', dirt: '#a8a29e', dirtDark: '#78716c', trunk: '#8b5e34',
    leaf1: '#22c55e', leaf2: '#86efac', flower: '#c084fc', accent: '#fbbf24',
    water: false, fireflies: false, city: false,
  },
  rio: {
    skyTop: '#0e7490', skyMid: '#22d3ee', skyBottom: '#ecfeff', sun: '#fef9c3',
    cloud: '#f0fdfa', hillFar: '#5eead4', hillMid: '#2dd4bf', grass: '#10b981',
    grassDark: '#047857', dirt: '#b45309', dirtDark: '#7c4a24', trunk: '#6b3f1d',
    leaf1: '#10b981', leaf2: '#34d399', flower: '#38bdf8', accent: '#67e8f9',
    water: true, fireflies: false, city: false,
  },
  floresta: {
    skyTop: '#155e75', skyMid: '#0e7490', skyBottom: '#a7f3d0', sun: '#d9f99d',
    cloud: '#ecfdf5', hillFar: '#059669', hillMid: '#047857', grass: '#166534',
    grassDark: '#14532d', dirt: '#78350f', dirtDark: '#451a03', trunk: '#573218',
    leaf1: '#15803d', leaf2: '#22c55e', flower: '#a3e635', accent: '#fde047',
    water: false, fireflies: true, city: false,
  },
  montanha: {
    skyTop: '#1d4ed8', skyMid: '#60a5fa', skyBottom: '#e0e7ff', sun: '#fef3c7',
    cloud: '#e2e8f0', hillFar: '#94a3b8', hillMid: '#64748b', grass: '#4d7c0f',
    grassDark: '#3f6212', dirt: '#78716c', dirtDark: '#57534e', trunk: '#78350f',
    leaf1: '#65a30d', leaf2: '#84cc16', flower: '#fbbf24', accent: '#fde68a',
    water: false, fireflies: false, city: false,
  },
  cidade: {
    skyTop: '#312e81', skyMid: '#6366f1', skyBottom: '#fdba74', sun: '#fdbA74',
    cloud: '#e0e7ff', hillFar: '#818cf8', hillMid: '#6366f1', grass: '#22c55e',
    grassDark: '#15803d', dirt: '#a8a29e', dirtDark: '#78716c', trunk: '#7c4a24',
    leaf1: '#22c55e', leaf2: '#4ade80', flower: '#fb923c', accent: '#fbbf24',
    water: false, fireflies: true, city: true,
  },
  ponte: {
    skyTop: '#7c3aed', skyMid: '#c084fc', skyBottom: '#fdba74', sun: '#fef3c7',
    cloud: '#fae8ff', hillFar: '#a78bfa', hillMid: '#7c3aed', grass: '#166534',
    grassDark: '#14532d', dirt: '#92400e', dirtDark: '#78350f', trunk: '#6b3f1d',
    leaf1: '#15803d', leaf2: '#22c55e', flower: '#f0abfc', accent: '#fde68a',
    water: true, fireflies: true, city: false,
  },
  portao: {
    skyTop: '#4c1d95', skyMid: '#a78bfa', skyBottom: '#fde68a', sun: '#fff7ed',
    cloud: '#fef9c3', hillFar: '#c4b5fd', hillMid: '#a78bfa', grass: '#22c55e',
    grassDark: '#166534', dirt: '#a16207', dirtDark: '#78350f', trunk: '#7c4a24',
    leaf1: '#34d399', leaf2: '#6ee7b7', flower: '#fbbf24', accent: '#fde68a',
    water: false, fireflies: true, city: false,
  },
};

/* ------------------------------- partículas ------------------------------- */

export type ParticleKind = 'leaf' | 'dust' | 'sparkle' | 'firefly' | 'petal';

export interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  spin: number;
  color: string;
}

export const MAX_PARTICLES = 64;

export function makeAmbientParticles(width: number, groundY: number, pal: Palette, rng: () => number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < 18; i++) {
    const firefly = pal.fireflies && rng() > 0.5;
    out.push({
      kind: firefly ? 'firefly' : 'leaf',
      x: rng() * width,
      y: firefly ? groundY - 20 - rng() * 180 : 40 + rng() * (groundY - 120),
      vx: firefly ? (rng() - 0.5) * 12 : 14 + rng() * 18,
      vy: firefly ? (rng() - 0.5) * 10 : 8 + rng() * 12,
      life: 4 + rng() * 6,
      maxLife: 8,
      size: firefly ? 2 + rng() * 2 : 3 + rng() * 3,
      rot: rng() * Math.PI * 2,
      spin: (rng() - 0.5) * 2,
      color: firefly ? pal.accent : rng() > 0.5 ? pal.leaf1 : pal.leaf2,
    });
  }
  return out;
}

/* --------------------------------- céu ---------------------------------- */

function drawSky(ctx: Ctx, pal: Palette, w: number, h: number, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, pal.skyTop);
  g.addColorStop(0.55, pal.skyMid);
  g.addColorStop(1, pal.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Sol com halo (glow barato: radial gradient, sem blur).
  const sunX = w * 0.78;
  const sunY = h * 0.22 + Math.sin(t * 0.18) * 4;
  const halo = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 130);
  halo.addColorStop(0, 'rgba(255,255,255,0.85)');
  halo.addColorStop(0.25, pal.sun);
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(sunX - 130, sunY - 130, 260, 260);

  // Raios suaves que giram devagar.
  ctx.save();
  ctx.translate(sunX, sunY);
  ctx.rotate(t * 0.05);
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    const rg = ctx.createLinearGradient(0, 0, 220, 0);
    rg.addColorStop(0, 'rgba(255,255,255,0.16)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(220, -26);
    ctx.lineTo(220, 26);
    ctx.lineTo(0, 7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCloud(ctx: Ctx, x: number, y: number, s: number, color: string, t: number, seed: number) {
  const bob = Math.sin(t * 0.5 + seed) * 3;
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(15,23,42,0.10)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y + bob, 34 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 22 * s, y + bob + 4 * s, 20 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 24 * s, y + bob + 5 * s, 22 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 4 * s, y + bob - 10 * s, 18 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawClouds(ctx: Ctx, camX: number, w: number, t: number, pal: Palette) {
  const drift = t * 8;
  for (let i = 0; i < 7; i++) {
    const span = w + 240;
    let x = ((i * 260 + drift - camX * 0.14) % (span + 200)) - 100;
    if (x < -160) x += span + 200;
    const y = 52 + ((i * 47) % 110);
    drawCloud(ctx, x, y, 0.8 + (i % 3) * 0.22, pal.cloud, t, i * 1.7);
  }
}

function drawHills(ctx: Ctx, camX: number, w: number, h: number, factor: number, color: string, baseY: number, amp: number, seed: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  const off = camX * factor;
  for (let x = -80; x <= w + 80; x += 8) {
    const y =
      baseY -
      Math.sin((x + off) * 0.004 + seed) * amp -
      Math.sin((x + off) * 0.011 + seed * 2.3) * amp * 0.45;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w + 80, h);
  ctx.closePath();
  ctx.fill();
}

/* --------------------------------- chão ---------------------------------- */

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawGroundRect(ctx: Ctx, r: Rect, pal: Palette, t: number) {
  // Corpo de terra com topo de grama.
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + Math.min(r.h, 120));
  g.addColorStop(0, pal.dirt);
  g.addColorStop(1, pal.dirtDark);
  ctx.fillStyle = g;
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();

  // Grama no topo (com "fleco" balançando levemente com o vento).
  ctx.fillStyle = pal.grass;
  roundRect(ctx, r.x, r.y - 2, r.w, 16, 8);
  ctx.fill();
  ctx.fillStyle = pal.grassDark;
  ctx.fillRect(r.x, r.y + 12, r.w, 4);

  const wind = Math.sin(t * 1.1) * 1.6 + Math.sin(t * 2.7 + 1.2) * 0.8;
  ctx.strokeStyle = pal.grass;
  ctx.lineWidth = 2;
  for (let x = r.x + 6; x < r.x + r.w - 4; x += 11) {
    const sway = wind * (0.5 + ((x * 7) % 10) / 12);
    ctx.beginPath();
    ctx.moveTo(x, r.y + 2);
    ctx.quadraticCurveTo(x + sway, r.y - 6, x + sway * 1.6, r.y - 11);
    ctx.stroke();
  }

  // Textura de pedrinhas na terra.
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i < Math.min(24, r.w / 14); i++) {
    const px = r.x + ((i * 53) % Math.max(1, r.w - 8));
    const py = r.y + 26 + ((i * 37) % Math.max(1, Math.min(r.h - 30, 90)));
    ctx.fillRect(px, py, 3, 2);
  }
}

function drawFloatingPlatform(ctx: Ctx, r: Rect, pal: Palette, t: number) {
  ctx.fillStyle = 'rgba(15,23,42,0.18)';
  ctx.beginPath();
  ctx.ellipse(r.x + r.w / 2, r.y + r.h + 14, r.w * 0.42, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, pal.dirt);
  g.addColorStop(1, pal.dirtDark);
  ctx.fillStyle = g;
  roundRect(ctx, r.x, r.y, r.w, r.h + 10, 12);
  ctx.fill();
  ctx.fillStyle = pal.grass;
  roundRect(ctx, r.x, r.y - 2, r.w, 14, 8);
  ctx.fill();

  // Flor em cima da plataforma.
  const sway = Math.sin(t * 1.4 + r.x * 0.02) * 2;
  ctx.strokeStyle = pal.grassDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(r.x + r.w / 2, r.y - 2);
  ctx.quadraticCurveTo(r.x + r.w / 2 + sway, r.y - 16, r.x + r.w / 2 + sway * 1.4, r.y - 24);
  ctx.stroke();
  ctx.fillStyle = pal.flower;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + t * 0.3;
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2 + sway * 1.4 + Math.cos(a) * 5, r.y - 26 + Math.sin(a) * 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2 + sway * 1.4, r.y - 26, 3.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawWater(ctx: Ctx, width: number, groundY: number, w: number, h: number, camX: number, t: number) {
  const top = groundY + 26;
  const g = ctx.createLinearGradient(0, top, 0, h);
  g.addColorStop(0, 'rgba(34,211,238,0.9)');
  g.addColorStop(1, 'rgba(8,91,125,0.95)');
  ctx.fillStyle = g;
  ctx.fillRect(0, top, w, h - top);

  // Brilho da superfície (ondas sinusoidais).
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  for (let x = -20; x < w + 20; x += 46) {
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const px = x + i * 4;
      const py = top + Math.sin((px + camX) * 0.03 + t * 2.2) * 3;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  void width;
}

/* --------------------------------- árvores -------------------------------- */

function drawTree(ctx: Ctx, x: number, baseY: number, size: number, kind: number, pal: Palette, t: number) {
  const wind = Math.sin(t * 1.15 + x * 0.013) * 4.2 + Math.sin(t * 2.6 + x * 0.02) * 1.8;
  const trunkH = size * 0.85;

  // Tronco (com leve inclinação no vento).
  ctx.fillStyle = pal.trunk;
  ctx.strokeStyle = 'rgba(15,23,42,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, baseY);
  ctx.quadraticCurveTo(x + wind * 0.35, baseY - trunkH * 0.55, x + wind * 0.7 - size * 0.05, baseY - trunkH);
  ctx.lineTo(x + wind * 0.7 + size * 0.05, baseY - trunkH);
  ctx.quadraticCurveTo(x + wind * 0.35 + size * 0.1, baseY - trunkH * 0.55, x + size * 0.09, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Copa: 3–4 tufos que balançam.
  const topX = x + wind * 0.75;
  const topY = baseY - trunkH;
  const blobs: [number, number, number][] =
    kind === 0
      ? [[0, -18, 30], [-22, -4, 22], [22, -2, 23], [0, 8, 24]]
      : kind === 1
        ? [[0, -22, 26], [-18, -8, 20], [18, -6, 21], [2, 6, 20], [-2, -36, 16]]
        : [[0, -10, 32], [-20, -18, 18], [20, -16, 19]];

  ctx.strokeStyle = 'rgba(15,23,42,0.28)';
  blobs.forEach(([bx, by, br], i) => {
    const sway = wind * (0.5 + i * 0.12);
    const g = ctx.createRadialGradient(topX + bx + sway - br * 0.3, topY + by - br * 0.35, br * 0.2, topX + bx + sway, topY + by, br);
    g.addColorStop(0, pal.leaf2);
    g.addColorStop(1, pal.leaf1);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(topX + bx + sway, topY + by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

function drawBush(ctx: Ctx, x: number, baseY: number, size: number, pal: Palette, t: number) {
  const sway = Math.sin(t * 1.3 + x * 0.02) * 1.6;
  const g = ctx.createLinearGradient(0, baseY - size * 1.6, 0, baseY);
  g.addColorStop(0, pal.leaf2);
  g.addColorStop(1, pal.leaf1);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x + sway, baseY - size * 0.55, size, size * 0.72, 0, 0, Math.PI * 2);
  ctx.ellipse(x - size * 0.7 + sway, baseY - size * 0.35, size * 0.62, size * 0.5, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.7 + sway, baseY - size * 0.38, size * 0.58, size * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlower(ctx: Ctx, x: number, baseY: number, kind: number, pal: Palette, t: number) {
  const sway = Math.sin(t * 1.6 + x * 0.05) * 2.2;
  ctx.strokeStyle = pal.grassDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + sway * 0.5, baseY - 10, x + sway, baseY - 18);
  ctx.stroke();
  const cx = x + sway;
  const cy = baseY - 20;
  const colors = [pal.flower, pal.accent, '#f9a8d4'];
  ctx.fillStyle = colors[kind % 3];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
  ctx.fill();
}

/* --------------------------------- cidade --------------------------------- */

function drawCity(ctx: Ctx, camX: number, w: number, groundY: number, pal: Palette, t: number) {
  void pal;
  const off = camX * 0.42;
  for (let i = 0; i < 14; i++) {
    const bw = 56 + ((i * 31) % 44);
    const bh = 70 + ((i * 53) % 120);
    let x = ((i * 150 - off) % (w + 300)) - 150;
    if (x < -180) x += w + 300;
    const y = groundY - bh + 24;
    ctx.fillStyle = i % 2 ? 'rgba(30,27,75,0.55)' : 'rgba(49,46,129,0.55)';
    ctx.fillRect(x, y, bw, bh);
    // Janelas acesas (tremulam de leve).
    for (let wy = y + 12; wy < y + bh - 14; wy += 18) {
      for (let wx = x + 8; wx < x + bw - 10; wx += 16) {
        const lit = ((wx * 7 + wy * 13 + i) % 5) > 1;
        ctx.fillStyle = lit
          ? `rgba(253,224,71,${0.55 + Math.sin(t * 1.2 + wx) * 0.12})`
          : 'rgba(15,23,42,0.35)';
        ctx.fillRect(wx, wy, 7, 9);
      }
    }
  }
}

/* --------------------------------- portão --------------------------------- */

function drawGate(ctx: Ctx, gateX: number, groundY: number, open: boolean, t: number, camX: number) {
  const x = gateX - camX;
  const baseY = groundY;
  const pulse = 0.5 + Math.sin(t * 2.2) * 0.5;

  if (open) {
    const glow = ctx.createRadialGradient(x, baseY - 70, 8, x, baseY - 70, 150);
    glow.addColorStop(0, `rgba(253,224,71,${0.5 + pulse * 0.25})`);
    glow.addColorStop(1, 'rgba(253,224,71,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 150, baseY - 220, 300, 260);
  }

  // Dois pilares + arco.
  const stone = open ? '#fbbf24' : '#94a3b8';
  const stoneDark = open ? '#b45309' : '#64748b';
  for (const side of [-1, 1]) {
    const px = x + side * 46;
    const g = ctx.createLinearGradient(px - 14, 0, px + 14, 0);
    g.addColorStop(0, stone);
    g.addColorStop(1, stoneDark);
    ctx.fillStyle = g;
    roundRect(ctx, px - 14, baseY - 128, 28, 128, 8);
    ctx.fill();
    ctx.fillStyle = stoneDark;
    roundRect(ctx, px - 18, baseY - 138, 36, 16, 6);
    ctx.fill();
  }
  ctx.strokeStyle = stone;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(x, baseY - 128, 46, Math.PI, 0);
  ctx.stroke();

  // Porta: luz quando aberta, grade quando fechada.
  if (open) {
    const door = ctx.createLinearGradient(0, baseY - 128, 0, baseY);
    door.addColorStop(0, 'rgba(255,255,255,0.95)');
    door.addColorStop(1, 'rgba(253,224,71,0.75)');
    ctx.fillStyle = door;
    ctx.beginPath();
    ctx.moveTo(x - 36, baseY);
    ctx.lineTo(x - 36, baseY - 96);
    ctx.arc(x, baseY - 96, 36, Math.PI, 0);
    ctx.lineTo(x + 36, baseY);
    ctx.closePath();
    ctx.fill();
    // Raios saindo da porta.
    ctx.save();
    ctx.translate(x, baseY - 70);
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3 + t * 0.15);
      const rg = ctx.createLinearGradient(0, 0, 120, 0);
      rg.addColorStop(0, 'rgba(255,255,255,0.4)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(120, -12);
      ctx.lineTo(120, 12);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(71,85,105,0.85)';
    roundRect(ctx, x - 36, baseY - 96, 72, 96, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,0.9)';
    ctx.lineWidth = 5;
    for (let i = -24; i <= 24; i += 16) {
      ctx.beginPath();
      ctx.moveTo(x + i, baseY - 92);
      ctx.lineTo(x + i, baseY - 6);
      ctx.stroke();
    }
  }
}

/* --------------------------------- herói ---------------------------------- */

function drawHero(ctx: Ctx, hero: HeroRuntime, camX: number, t: number) {
  const x = hero.x - camX;
  const y = hero.y;
  const s = 1;
  const facing = hero.facing;
  const walk = hero.walkPhase;
  const swing = hero.state === 'walk' ? Math.sin(walk) : 0;

  // Sombra de contato.
  ctx.fillStyle = 'rgba(15,23,42,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 20 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  // Pernas.
  const legLift = hero.state === 'jump' ? -10 : hero.state === 'fall' ? -6 : 0;
  const legA = hero.state === 'walk' ? swing * 0.7 : hero.state === 'jump' ? -0.5 : 0;
  const legB = hero.state === 'walk' ? -swing * 0.7 : hero.state === 'jump' ? 0.35 : 0;
  for (const [dx, ang] of [[-6, legA], [6, legB]] as const) {
    ctx.save();
    ctx.translate(dx, -20);
    ctx.rotate(ang);
    ctx.fillStyle = '#1e3a8a';
    roundRect(ctx, -4.5, 0, 9, 18 + legLift * 0.3, 4);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    roundRect(ctx, -5, 15 + legLift * 0.3, 11, 5, 2.5);
    ctx.fill();
    ctx.restore();
  }

  // Túnica (com leve respiração).
  const breathe = 1 + Math.sin(t * 2.1) * (hero.state === 'idle' ? 0.03 : 0.012);
  ctx.save();
  ctx.translate(0, -30);
  ctx.scale(1, breathe);
  const tg = ctx.createLinearGradient(0, -16, 0, 16);
  tg.addColorStop(0, '#38bdf8');
  tg.addColorStop(1, '#4338ca');
  ctx.fillStyle = tg;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  roundRect(ctx, -13, -14, 26, 28, 9);
  ctx.fill();
  ctx.stroke();
  // Cinto.
  ctx.fillStyle = '#f59e0b';
  roundRect(ctx, -13, 6, 26, 5, 2);
  ctx.fill();
  ctx.restore();

  // Braços.
  const armAngle = hero.state === 'walk' ? -swing * 0.55 : hero.state === 'happy' ? -2.3 : hero.state === 'jump' ? -1.8 : 0.12;
  for (const side of [-1, 1] as const) {
    const ang = side === -1 ? armAngle : -armAngle * 0.85;
    ctx.save();
    ctx.translate(side * 13, -38);
    ctx.rotate(ang * side);
    ctx.fillStyle = '#38bdf8';
    roundRect(ctx, -4, -2, 8, 17, 4);
    ctx.fill();
    ctx.fillStyle = '#f0c194';
    ctx.beginPath();
    ctx.arc(0, 16, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Cabeça.
  const headY = -52 + (hero.state === 'fall' ? 1 : 0);
  const hg = ctx.createRadialGradient(-4, headY - 5, 3, 0, headY, 15);
  hg.addColorStop(0, '#fbd6ad');
  hg.addColorStop(1, '#e8b184');
  ctx.fillStyle = hg;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, headY, 13.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cabelo.
  ctx.fillStyle = '#5b3a20';
  ctx.beginPath();
  ctx.arc(0, headY - 3, 13.5, Math.PI * 1.05, Math.PI * 1.95);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-10, headY - 4, 5, 0, Math.PI * 2);
  ctx.arc(9, headY - 5, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Rosto.
  const happy = hero.state === 'happy';
  const sad = hero.state === 'sad';
  ctx.strokeStyle = '#0f172a';
  ctx.fillStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  if (happy) {
    ctx.beginPath();
    ctx.arc(-5, headY - 1, 3, Math.PI, 0);
    ctx.arc(6, headY - 1, 3, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1, headY + 5, 4.4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else {
    const lookX = facing * 1.6;
    ctx.beginPath();
    ctx.ellipse(-5 + lookX, headY - 1 + (sad ? 1.5 : 0), 2.3, 2.8, 0, 0, Math.PI * 2);
    ctx.ellipse(6 + lookX, headY - 1 + (sad ? 1.5 : 0), 2.3, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    if (sad) ctx.arc(1, headY + 8, 3.4, Math.PI * 1.15, Math.PI * 1.85);
    else ctx.arc(1, headY + 4.6, 3.6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  // Bochechas.
  ctx.fillStyle = 'rgba(244,114,182,0.45)';
  ctx.beginPath();
  ctx.arc(-8.5, headY + 3.5, 2.6, 0, Math.PI * 2);
  ctx.arc(9.5, headY + 3.5, 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ---------------------------------- NPCs ---------------------------------- */

function drawNpcFigure(
  ctx: Ctx,
  x: number,
  baseY: number,
  look: NpcRuntime['look'],
  anim: NpcRuntime['anim'],
  guardiao: boolean,
  t: number,
  phase: number,
) {
  const s = guardiao ? 1.32 : 1;
  const bob = Math.sin(t * 1.9 + phase) * (anim === 'happy' ? 3 : 1.4);

  // Aura do guardião.
  if (guardiao) {
    const glow = ctx.createRadialGradient(x, baseY - 40 * s, 8, x, baseY - 40 * s, 72 * s);
    glow.addColorStop(0, 'rgba(253,224,71,0.4)');
    glow.addColorStop(1, 'rgba(253,224,71,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 72 * s, baseY - 112 * s, 144 * s, 150 * s);
  }

  ctx.fillStyle = 'rgba(15,23,42,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, baseY + 2, 20 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, baseY + bob);

  // Capa do guardião.
  if (guardiao) {
    ctx.fillStyle = 'rgba(124,58,237,0.85)';
    ctx.beginPath();
    ctx.moveTo(-16 * s, -42 * s);
    ctx.quadraticCurveTo(-30 * s, -14 * s, -18 * s, 0);
    ctx.lineTo(18 * s, 0);
    ctx.quadraticCurveTo(30 * s, -14 * s, 16 * s, -42 * s);
    ctx.closePath();
    ctx.fill();
  }

  // Pernas.
  ctx.fillStyle = '#334155';
  roundRect(ctx, -10 * s, -18 * s, 8 * s, 18 * s, 4 * s);
  ctx.fill();
  roundRect(ctx, 2 * s, -18 * s, 8 * s, 18 * s, 4 * s);
  ctx.fill();

  // Corpo/túnica.
  const rg = ctx.createLinearGradient(0, -46 * s, 0, -12 * s);
  rg.addColorStop(0, look.robe);
  rg.addColorStop(1, 'rgba(15,23,42,0.55)');
  ctx.fillStyle = rg;
  ctx.strokeStyle = 'rgba(15,23,42,0.55)';
  ctx.lineWidth = 2;
  roundRect(ctx, -15 * s, -46 * s, 30 * s, 32 * s, 10 * s);
  ctx.fill();
  ctx.stroke();

  // Braços.
  const armSwing = anim === 'happy' ? -1.9 : Math.sin(t * 1.7 + phase) * 0.16;
  for (const side of [-1, 1] as const) {
    ctx.save();
    ctx.translate(side * 15 * s, -42 * s);
    ctx.rotate(side * armSwing);
    ctx.fillStyle = look.robe;
    roundRect(ctx, -4 * s, -2 * s, 8 * s, 18 * s, 4 * s);
    ctx.fill();
    ctx.fillStyle = look.skin;
    ctx.beginPath();
    ctx.arc(0, 17 * s, 4.4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Cabeça.
  const headY = -58 * s;
  const hg = ctx.createRadialGradient(-4 * s, headY - 5 * s, 3 * s, 0, headY, 15 * s);
  hg.addColorStop(0, look.skin);
  hg.addColorStop(1, 'rgba(15,23,42,0.18)');
  ctx.fillStyle = hg;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, headY, 13.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cabelo por estilo.
  ctx.fillStyle = look.hair;
  if (look.hairStyle === 'long') {
    ctx.beginPath();
    ctx.arc(0, headY, 14 * s, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    roundRect(ctx, -14 * s, headY - 2 * s, 7 * s, 22 * s, 3.5 * s);
    ctx.fill();
    roundRect(ctx, 7 * s, headY - 2 * s, 7 * s, 22 * s, 3.5 * s);
    ctx.fill();
  } else if (look.hairStyle === 'wavy') {
    for (const [bx, by, br] of [[-9, -8, 7], [0, -12, 8], [9, -8, 7], [-12, -1, 5], [12, -1, 5]] as const) {
      ctx.beginPath();
      ctx.arc(bx * s, headY + by * s, br * s, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (look.hairStyle === 'buzz') {
    ctx.beginPath();
    ctx.arc(0, headY - 1.5 * s, 13.2 * s, Math.PI * 1.02, Math.PI * 1.98);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, headY - 2 * s, 13.6 * s, Math.PI * 1.02, Math.PI * 1.98);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-10 * s, headY - 4 * s, 5 * s, 0, Math.PI * 2);
    ctx.arc(10 * s, headY - 4 * s, 5.2 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Adereço de cabeça.
  if (look.headwear === 'crown') {
    ctx.fillStyle = look.headwearColor;
    ctx.beginPath();
    ctx.moveTo(-11 * s, headY - 10 * s);
    ctx.lineTo(-8 * s, headY - 20 * s);
    ctx.lineTo(-3 * s, headY - 12 * s);
    ctx.lineTo(1 * s, headY - 22 * s);
    ctx.lineTo(5 * s, headY - 12 * s);
    ctx.lineTo(10 * s, headY - 20 * s);
    ctx.lineTo(12 * s, headY - 10 * s);
    ctx.closePath();
    ctx.fill();
  } else if (look.headwear === 'hood') {
    ctx.fillStyle = look.headwearColor;
    ctx.beginPath();
    ctx.arc(0, headY, 15.5 * s, Math.PI * 0.92, Math.PI * 2.08);
    ctx.lineTo(13 * s, headY + 8 * s);
    ctx.lineTo(-13 * s, headY + 8 * s);
    ctx.closePath();
    ctx.fill();
  } else if (look.headwear === 'headband') {
    ctx.fillStyle = look.headwearColor;
    roundRect(ctx, -13 * s, headY - 9 * s, 26 * s, 5.5 * s, 2.5 * s);
    ctx.fill();
  } else if (look.headwear === 'hat') {
    ctx.fillStyle = look.headwearColor;
    roundRect(ctx, -16 * s, headY - 11 * s, 32 * s, 5 * s, 2.5 * s);
    ctx.fill();
    roundRect(ctx, -10 * s, headY - 22 * s, 20 * s, 13 * s, 4 * s);
    ctx.fill();
  }

  // Rosto.
  const happy = anim === 'happy';
  const think = anim === 'thinking';
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  if (happy) {
    ctx.beginPath();
    ctx.arc(-5 * s, headY - 1 * s, 3 * s, Math.PI, 0);
    ctx.arc(6 * s, headY - 1 * s, 3 * s, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1 * s, headY + 5 * s, 4.6 * s, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(-5 * s, headY - 1 * s, 2.3 * s, 2.9 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(6 * s, headY - 1 * s, 2.3 * s, 2.9 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    if (think) {
      ctx.moveTo(-2 * s, headY + 7 * s);
      ctx.lineTo(5 * s, headY + 7 * s);
    } else {
      ctx.arc(1 * s, headY + 4.6 * s, 3.8 * s, 0.15 * Math.PI, 0.85 * Math.PI);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(244,114,182,0.4)';
  ctx.beginPath();
  ctx.arc(-8.5 * s, headY + 3.5 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.arc(9.5 * s, headY + 3.5 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Adereço nas mãos.
  const propY = -22 * s;
  if (look.prop === 'basket') {
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(20 * s, propY, 11 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(20 * s, propY - 2 * s, 9 * s, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(17 * s, propY - 3 * s, 3.4 * s, 0, Math.PI * 2);
    ctx.arc(23 * s, propY - 4 * s, 3.2 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (look.prop === 'book') {
    ctx.fillStyle = '#7c3aed';
    roundRect(ctx, 14 * s, propY - 8 * s, 15 * s, 12 * s, 2 * s);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(16 * s, propY - 6 * s, 11 * s, 2 * s);
    ctx.fillRect(16 * s, propY - 2 * s, 11 * s, 2 * s);
  } else if (look.prop === 'staff') {
    ctx.strokeStyle = '#8b5e34';
    ctx.lineWidth = 3.4 * s;
    ctx.beginPath();
    ctx.moveTo(19 * s, propY + 14 * s);
    ctx.lineTo(21 * s, propY - 26 * s);
    ctx.stroke();
    ctx.fillStyle = palGold(t);
    ctx.beginPath();
    ctx.arc(21 * s, propY - 28 * s, 4.4 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (look.prop === 'flower') {
    ctx.fillStyle = '#f472b6';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + t * 0.6;
      ctx.beginPath();
      ctx.arc(20 * s + Math.cos(a) * 4, propY + Math.sin(a) * 4, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(20 * s, propY, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (look.prop === 'balloon') {
    ctx.strokeStyle = 'rgba(15,23,42,0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(20 * s, propY + 6 * s);
    ctx.quadraticCurveTo(24 * s, propY - 10 * s, 22 * s + Math.sin(t) * 3, propY - 26 * s);
    ctx.stroke();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(22 * s + Math.sin(t) * 3, propY - 32 * s, 8 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (look.prop === 'umbrella') {
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(20 * s, propY + 12 * s);
    ctx.lineTo(20 * s, propY - 18 * s);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(20 * s, propY - 16 * s, 13 * s, Math.PI, 0);
    ctx.fill();
  } else if (look.prop === 'lantern') {
    const glow = ctx.createRadialGradient(21 * s, propY, 2, 21 * s, propY, 22);
    glow.addColorStop(0, 'rgba(253,224,71,0.75)');
    glow.addColorStop(1, 'rgba(253,224,71,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(21 * s - 22, propY - 22, 44, 44);
    ctx.fillStyle = '#fbbf24';
    roundRect(ctx, 16 * s, propY - 7 * s, 10 * s, 13 * s, 3 * s);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(21 * s, propY - 8 * s, 5 * s, Math.PI, 0);
    ctx.stroke();
  } else if (look.prop === 'bread') {
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(20 * s, propY, 11 * s, 7 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(15 * s, propY - 1 * s);
    ctx.lineTo(25 * s, propY - 3 * s);
    ctx.stroke();
  } else if (look.prop === 'fishing') {
    ctx.strokeStyle = '#8b5e34';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(14 * s, propY + 12 * s);
    ctx.lineTo(30 * s, propY - 30 * s);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(15,23,42,0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(30 * s, propY - 30 * s);
    ctx.quadraticCurveTo(38 * s, propY - 10 * s, 32 * s, propY + 2 * s);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(32 * s, propY + 5 * s, 5 * s, 3 * s, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function palGold(t: number) {
  return t % 2 > 1 ? '#fbbf24' : '#fde68a';
}

/** Balão de pensamento "?" para o NPC ainda não resolvido. */
function drawThinkBubble(ctx: Ctx, x: number, baseY: number, t: number) {
  const bob = Math.sin(t * 2.2) * 3;
  const y = baseY - 118 + bob;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.strokeStyle = 'rgba(15,23,42,0.35)';
  ctx.lineWidth = 2;
  for (const [dx, dy, r] of [[0, 0, 17], [-14, 12, 7], [-20, 21, 4]] as const) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#7c3aed';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', x, y + 1);
}

/* -------------------------------- partículas ------------------------------- */

export function drawParticles(ctx: Ctx, particles: Particle[], camX: number, pal: Palette, t: number) {
  for (const p of particles) {
    const x = p.x - camX;
    if (x < -30 || x > 1200) continue;
    const alpha = Math.min(1, p.life / 1.2) * Math.min(1, (p.maxLife - p.life) / 1.2 + 0.35);
    if (p.kind === 'leaf') {
      ctx.save();
      ctx.translate(x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha * 0.85;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'firefly') {
      const twinkle = 0.5 + Math.sin(t * 3 + p.x) * 0.5;
      const g = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.size * 5);
      g.addColorStop(0, `rgba(253,224,71,${alpha * twinkle})`);
      g.addColorStop(1, 'rgba(253,224,71,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - p.size * 5, p.y - p.size * 5, p.size * 10, p.size * 10);
    } else if (p.kind === 'sparkle') {
      ctx.save();
      ctx.translate(x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = pal.accent;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.lineTo(0, -p.size * 2);
        ctx.lineTo(p.size * 0.6, -p.size * 0.6);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'petal') {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha * 0.9;
      ctx.beginPath();
      ctx.ellipse(x, p.y, p.size, p.size * 0.6, p.rot, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // dust
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/* --------------------------------- quadro --------------------------------- */

export interface DrawFrameArgs {
  ctx: Ctx;
  w: number;
  h: number;
  t: number;
  camX: number;
  geom: LevelGeom;
  pal: Palette;
  hero: HeroRuntime;
  npcs: NpcRuntime[];
  particles: Particle[];
  finishOpen: boolean;
  reducedMotion: boolean;
}

/** Desenha um quadro completo do mundo (ordem de z explicitada). */
export function drawFrame(a: DrawFrameArgs) {
  const { ctx, w, h, t, camX, geom, pal, hero, npcs, particles, finishOpen, reducedMotion } = a;
  const wind = reducedMotion ? 0 : 1;
  void wind;

  drawSky(ctx, pal, w, h, reducedMotion ? 0 : t);
  drawClouds(ctx, camX, w, reducedMotion ? 0 : t, pal);

  if (pal.city) drawCity(ctx, camX, w, geom.groundY, pal, t);

  drawHills(ctx, camX, w, h, 0.18, pal.hillFar, geom.groundY - 128, 34, 1.2);
  drawHills(ctx, camX, w, h, 0.38, pal.hillMid, geom.groundY - 52, 46, 2.7);

  // Árvores de trás (fora do chão, só silhueta) — parallax médio.
  for (const tr of geom.trees) {
    const x = tr.x - camX * 0.62;
    if (x < -80 || x > w + 80) continue;
    ctx.globalAlpha = 0.55;
    drawTree(ctx, x, geom.groundY - 26, tr.size * 0.8, tr.kind, pal, reducedMotion ? 0 : t);
    ctx.globalAlpha = 1;
  }

  // Água (atrás do chão).
  if (pal.water) drawWater(ctx, geom.width, geom.groundY, w, h, camX, t);

  // Chão e plataformas.
  for (const r of geom.solids) {
    const sx = r.x - camX;
    if (sx + r.w < -40 || sx > w + 40) continue;
    if (r.h > 40) drawGroundRect(ctx, { ...r, x: sx }, pal, t);
    else drawFloatingPlatform(ctx, { ...r, x: sx }, pal, t);
  }

  // Vegetação do mundo.
  for (const tr of geom.trees) {
    const x = tr.x - camX;
    if (x < -90 || x > w + 90) continue;
    drawTree(ctx, x, geom.groundY, tr.size, tr.kind, pal, reducedMotion ? 0 : t);
  }
  for (const b of geom.bushes) {
    const x = b.x - camX;
    if (x < -60 || x > w + 60) continue;
    drawBush(ctx, x, geom.groundY, b.size, pal, t);
  }
  for (const f of geom.flowers) {
    const x = f.x - camX;
    if (x < -30 || x > w + 30) continue;
    drawFlower(ctx, x, geom.groundY - 8, f.kind, pal, t);
  }

  drawGate(ctx, geom.gateX, geom.groundY, finishOpen, t, camX);

  for (const npc of npcs) {
    const x = npc.x - camX;
    if (x < -80 || x > w + 80) continue;
    drawNpcFigure(ctx, x, geom.groundY, npc.look, npc.anim, npc.guardiao, t, npc.phase);
    if (npc.anim === 'thinking') drawThinkBubble(ctx, x, geom.groundY, t);
  }

  drawHero(ctx, hero, camX, t);
  drawParticles(ctx, particles, camX, pal, t);
}
