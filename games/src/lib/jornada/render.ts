// Render da "A Grande Jornada" em Canvas 2D — pixel art placeholder (retângulos),
// paleta da vertical, luz/sombra e HUD leve. Sem emoji no mundo (skill §8).

import { PLAYER_H, PLAYER_W, TILE, VIEW_H, VIEW_W } from './constants';
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

export function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, s: Scene) {
  const scale = Math.min(w / VIEW_W, h / VIEW_H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = s.level.sky[1];
  ctx.fillRect(0, 0, w, h);
  ctx.translate((w - VIEW_W * scale) / 2, (h - VIEW_H * scale) / 2);
  ctx.scale(scale, scale);

  const camLeft = s.camX - VIEW_W / 2;
  const camTop = s.camY - VIEW_H / 2;

  drawSky(ctx, s, camLeft, camTop);
  drawTiles(ctx, s, camLeft, camTop);
  drawPickups(ctx, s, camLeft, camTop);
  drawEnemies(ctx, s, camLeft, camTop);
  drawPlayer(ctx, s, camLeft, camTop);
  drawDarkness(ctx, s);
  drawHud(ctx, s);
}

/* --------------------------------- céu ----------------------------------- */

function drawSky(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number) {
  const g = ctx.createLinearGradient(0, -camTop * 0.1, 0, VIEW_H);
  g.addColorStop(0, s.level.sky[0]);
  g.addColorStop(1, s.level.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(-40, -40, VIEW_W + 80, VIEW_H + 80);

  // Parallax: morros suaves (a "estrada com morros" da vertical).
  const hills = s.level.ground[1];
  ctx.fillStyle = hills;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 6; i++) {
    const hx = (((i * 160 - camLeft * 0.35) % (VIEW_W + 320)) + VIEW_W + 320) % (VIEW_W + 320) - 160;
    const hy = VIEW_H * 0.62 + Math.sin(i * 1.7) * 18 - camTop * 0.08;
    ctx.beginPath();
    ctx.ellipse(hx, hy + 60, 120, 70, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* --------------------------------- tiles --------------------------------- */

function drawTiles(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number) {
  const { map } = s;
  const x0 = Math.max(0, Math.floor(camLeft / TILE) - 1);
  const x1 = Math.min(map.width - 1, Math.ceil((camLeft + VIEW_W) / TILE) + 1);
  const y0 = Math.max(0, Math.floor(camTop / TILE) - 1);
  const y1 = Math.min(map.height - 1, Math.ceil((camTop + VIEW_H) / TILE) + 1);

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const ch = map.grid[ty][tx];
      if (ch === '.') continue;
      drawTile(ctx, ch, tx * TILE - camLeft, ty * TILE - camTop, s);
    }
  }
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  s: Scene,
) {
  const [gBase, gDetail] = s.level.ground;
  switch (ch) {
    case '#':
      ctx.fillStyle = gBase;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = gDetail;
      ctx.fillRect(x, y, TILE, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x + 3, y + 8, 6, 4);
      break;
    case '=':
      ctx.fillStyle = gDetail;
      roundRect(ctx, x, y, TILE, 8, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x + 2, y + 1, TILE - 4, 2);
      break;
    case '?':
      // A Rocha que Responde: pedra marcada com pegada (nada do Mario).
      ctx.fillStyle = '#c9a227';
      roundRect(ctx, x + 2, y + 2, TILE - 4, TILE - 4, 6);
      ctx.fill();
      ctx.fillStyle = '#8a6d1d';
      ctx.fillRect(x + 8, y + 8, 8, 10);
      ctx.fillRect(x + 6, y + 16, 5, 3);
      ctx.fillRect(x + 13, y + 16, 5, 3);
      break;
    case 'x': {
      // Muro de Espinhos — rompe com a luz (sementes), não com força.
      ctx.fillStyle = '#7a5c3e';
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#4e7a3c';
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 2 + i * 8, y + 6 + (i % 2) * 6, 4, 4);
      break;
    }
    case 'w': {
      // O Muro que Cai (Jericó) — cai com o canto.
      ctx.fillStyle = '#b9a48a';
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#8d7a62';
      ctx.fillRect(x, y, TILE, 3);
      ctx.fillRect(x + 10, y + 6, 3, 8);
      ctx.fillRect(x + 3, y + 16, 12, 3);
      break;
    }
    case 'g': {
      // A Rocha do Marco (checkpoint).
      ctx.fillStyle = '#9aa5b1';
      roundRect(ctx, x + 3, y + 4, TILE - 6, TILE - 6, 8);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 9, y + 9, 6, 8);
      break;
    }
    case 'c': {
      // A Cancelinha — só aparece com a luz.
      if (s.lightLevel <= 0.5) break;
      ctx.globalAlpha = 0.55 + Math.sin(s.time * 3) * 0.15;
      ctx.fillStyle = '#f472b6';
      roundRect(ctx, x + 1, y + 10, TILE - 2, 10, 4);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case '~':
      ctx.fillStyle = 'rgba(96,165,250,0.35)';
      ctx.fillRect(x, y + TILE * 0.4, TILE, TILE * 0.6);
      break;
    default:
      break;
  }
}

/* --------------------------------- itens --------------------------------- */

function drawPickups(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number) {
  const bob = s.reducedMotion ? 0 : Math.sin(s.time * 3) * 3;
  for (const seed of s.seeds) {
    if (seed.got) continue;
    const x = seed.x + TILE / 2 - camLeft;
    const y = seed.y + TILE / 2 - camTop + bob;
    // Semente da Palavra: luz (a metáfora é lampeiro, não bagagem).
    const glow = ctx.createRadialGradient(x, y, 1, x, y, 12);
    glow.addColorStop(0, 'rgba(253,224,71,0.9)');
    glow.addColorStop(1, 'rgba(253,224,71,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 7, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a3e635';
    ctx.fillRect(x - 1, y - 11, 2, 5);
  }
  for (const sh of s.shields) {
    if (sh.got) continue;
    const x = sh.x + TILE / 2 - camLeft;
    const y = sh.y + TILE / 2 - camTop + bob;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x + 9, y - 5);
    ctx.lineTo(x + 9, y + 4);
    ctx.lineTo(x, y + 11);
    ctx.lineTo(x - 9, y + 4);
    ctx.lineTo(x - 9, y - 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(x - 2, y - 5, 4, 10);
    ctx.fillRect(x - 5, y - 2, 10, 4);
  }
}

/* ------------------------------- inimigos -------------------------------- */

function drawEnemies(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number) {
  for (const e of s.enemies) {
    const x = e.x - camLeft;
    const y = e.y - camTop;
    if (e.transformed) {
      if (e.kind === 'spike') {
        // Stomp transforma: vira flor (nunca morre).
        if (e.timer > 2.5) continue;
        ctx.fillStyle = '#f472b6';
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + s.time;
          ctx.beginPath();
          ctx.arc(x + e.w / 2 + Math.cos(a) * 7, y + e.h / 2 + Math.sin(a) * 7, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(x + e.w / 2, y + e.h / 2, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.kind === 'bug') {
        if (e.timer > 2.5) continue;
        // Figurinha (a criança coleta, não elimina).
        ctx.fillStyle = '#fde047';
        roundRect(ctx, x + 2, y + 2, e.w - 4, e.h - 4, 5);
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + e.w / 2 - 2, y + e.h / 2 - 2, 4, 4);
      }
      continue;
    }

    if (e.kind === 'spike') {
      // Espinho: patrulha lenta, sem rosto de mau.
      ctx.fillStyle = '#65a30d';
      roundRect(ctx, x, y, e.w, e.h, 6);
      ctx.fill();
      ctx.fillStyle = '#4d7c0f';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 3 + i * 7, y + 2);
        ctx.lineTo(x + 6 + i * 7, y - 6);
        ctx.lineTo(x + 9 + i * 7, y + 2);
        ctx.fill();
      }
    } else if (e.kind === 'bug') {
      ctx.fillStyle = '#a3e635';
      roundRect(ctx, x, y, e.w, e.h, 8);
      ctx.fill();
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(x + 4, y + 6, 3, 3);
      ctx.fillRect(x + e.w - 7, y + 6, 3, 3);
    } else if (e.kind === 'snake') {
      // Serpente da Haste: pula por cima — ela não causa dano (Nm 21.4-9).
      ctx.fillStyle = '#c2a24a';
      roundRect(ctx, x - 4, y, e.w + 8, e.h, 10);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + e.w / 2 - 2, y - 14, 4, 16);
      ctx.beginPath();
      ctx.arc(x + e.w / 2, y - 16, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.kind === 'despair') {
      // Grande Desespero: senta na estrada e cresce — sem cara, sem rugido.
      const grow = e.grow * 18;
      ctx.fillStyle = `rgba(71,85,105,${0.75 + e.grow * 0.2})`;
      roundRect(ctx, x - 6, y - grow, e.w + 12, e.h + grow, 14);
      ctx.fill();
    }
  }
}

/* -------------------------------- player --------------------------------- */

function drawPlayer(ctx: CanvasRenderingContext2D, s: Scene, camLeft: number, camTop: number) {
  const p = s.player;
  const x = p.x - camLeft;
  const y = p.y - camTop;
  const squash = p.onGround ? 1 : 1.06;

  // Sombra de contato.
  ctx.fillStyle = 'rgba(15,23,42,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + PLAYER_W / 2, y + PLAYER_H, PLAYER_W * 0.55, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Corpo do peregrino (pixel art placeholder).
  ctx.save();
  ctx.translate(x + PLAYER_W / 2, y + PLAYER_H);
  ctx.scale(1 / squash, squash);
  ctx.translate(-PLAYER_W / 2, -PLAYER_H);
  ctx.fillStyle = '#7c3aed';
  roundRect(ctx, 1, 6, PLAYER_W - 2, PLAYER_H - 6, 6);
  ctx.fill();
  ctx.fillStyle = '#fcd9b8';
  ctx.beginPath();
  ctx.arc(PLAYER_W / 2, 5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  const look = p.facing > 0 ? 2 : -2;
  ctx.fillRect(PLAYER_W / 2 - 3 + look, 3, 2, 2);
  ctx.fillRect(PLAYER_W / 2 + 1 + look, 3, 2, 2);
  ctx.restore();

  // Escudo da Fé ativo: brilho suave à volta (sem armadura de combate).
  if (p.shield) {
    ctx.strokeStyle = 'rgba(56,189,248,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + PLAYER_W / 2, y + PLAYER_H / 2, PLAYER_W, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/* --------------------------------- luz ----------------------------------- */

function drawDarkness(ctx: CanvasRenderingContext2D, s: Scene) {
  const base = s.level.darkness ?? 0;
  const alpha = base * (0.85 - 0.6 * s.lightLevel) + (1 - s.lightLevel) * 0.12;
  if (alpha <= 0.02) return;
  const px = s.player.x + PLAYER_W / 2 - (s.camX - VIEW_W / 2);
  const py = s.player.y + PLAYER_H / 2 - (s.camY - VIEW_H / 2);
  const g = ctx.createRadialGradient(px, py, s.lightRadius * 0.25, px, py, s.lightRadius);
  g.addColorStop(0, 'rgba(15,23,42,0)');
  g.addColorStop(1, `rgba(15,23,42,${Math.min(0.92, alpha)})`);
  ctx.fillStyle = g;
  ctx.fillRect(-40, -40, VIEW_W + 80, VIEW_H + 80);
}

/* ---------------------------------- HUD ---------------------------------- */

function drawHud(ctx: CanvasRenderingContext2D, s: Scene) {
  // Sementes coletadas (a luz acumulada).
  ctx.fillStyle = 'rgba(15,23,42,0.55)';
  roundRect(ctx, 12, 12, 96, 30, 15);
  ctx.fill();
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.ellipse(30, 27, 5, 7, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px ui-rounded, system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(`× ${s.seedCount}`, 44, 28);

  // Comunhão (oração) — estado, nunca moeda.
  const bx = VIEW_W - 132;
  ctx.fillStyle = 'rgba(15,23,42,0.55)';
  roundRect(ctx, bx, 12, 120, 30, 15);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, bx + 8, 22, 104, 10, 5);
  ctx.fill();
  const bw = Math.max(0, Math.min(1, s.comunhao)) * 104;
  if (bw > 1) {
    const grad = ctx.createLinearGradient(bx + 8, 0, bx + 112, 0);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(1, '#fde047');
    ctx.fillStyle = grad;
    roundRect(ctx, bx + 8, 22, bw, 10, 5);
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px ui-rounded, system-ui, sans-serif';
  ctx.fillText('Comunhão', bx + 10, 16);

  if (s.flash > 0) {
    ctx.fillStyle = `rgba(253,224,71,${s.flash * 0.18})`;
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
