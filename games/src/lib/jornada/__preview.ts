import { CENARIOS, type Paleta } from './scenarios';

const SKY: [string, string][] = [
  ['#283593', '#fdba74'], ['#0ea5e9', '#bae6fd'], ['#7dd3fc', '#e0f7fa'],
  ['#a5d6ff', '#f1f5f9'], ['#c7e6ff', '#fef9c3'], ['#4b5563', '#1e293b'],
  ['#93c5fd', '#fef3c7'], ['#6b7280', '#111827'], ['#7dd3fc', '#cffafe'],
  ['#86efac', '#fef08a'], ['#94a3b8', '#1f2937'], ['#c9e6ff', '#fef3c7'],
];
const SOLO: [string, string][] = [
  ['#8b5a2b', '#65a30d'], ['#a16207', '#4ade80'], ['#8d6748', '#22c55e'],
  ['#7f5539', '#84cc16'], ['#7a5230', '#4ade80'], ['#5f4327', '#3f6212'],
  ['#7a5230', '#65a30d'], ['#654321', '#365314'], ['#8b5a2b', '#4ade80'],
  ['#7f5539', '#84cc16'], ['#6b4e2a', '#365314'], ['#7d5a40', '#22c55e'],
];

function lighten(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const f = (v: number) => Math.round(v + (255 - v) * amount);
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
function escurecer(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const f = (v: number) => Math.round(v * (1 - amount));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

export function desenharTudo(cv: HTMLCanvasElement) {
  const cols = 3, cw = 360, ch = 240;
  cv.width = cols * cw; cv.height = Math.ceil(12 / cols) * ch;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, cv.width, cv.height);
  Object.entries(CENARIOS).forEach(([id, fn], i) => {
    const cx = (i % cols) * cw, cy = Math.floor(i / cols) * ch;
    ctx.save(); ctx.translate(cx, cy);
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, SKY[i][0]); g.addColorStop(1, SKY[i][1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    // chão
    ctx.fillStyle = SOLO[i][0]; ctx.fillRect(0, ch - 46, cw, 46);
    ctx.fillStyle = SOLO[i][1]; ctx.fillRect(0, ch - 46, cw, 7);
    const pal: Paleta = { silhueta: escurecer(SOLO[i][0], 0.34), destaque: lighten(SOLO[i][1], 0.12), clara: lighten(SKY[i][1], 0.42) };
    ctx.save(); ctx.translate(cw * 0.28, ch - 40); ctx.scale(1.15, 1.15);
    fn(ctx, pal); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 17px sans-serif'; ctx.fillText(id, 12, 24);
    ctx.restore();
  });
}
