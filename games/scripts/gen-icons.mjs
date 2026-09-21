// Gera os ícones PNG do PWA sem dependências externas (não há ImageMagick/PIL).
// Usa supersampling 4x para antialias e encode PNG com node:zlib.
// Uso: bun run /tmp/opencode/gen-icons.mjs <dir-de-saida>

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = process.argv[2] ?? '.';

/* --------------------------------- PNG --------------------------------- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filtro "none"
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* -------------------------------- desenho -------------------------------- */

const TOP = [0x24, 0x1a, 0x52]; // roxo do cabinet
const BOTTOM = [0x0f, 0x08, 0x22]; // quase preto
const GLOW = [0xfb, 0xbf, 0x24]; // âmbar
const STAR = [0xfd, 0xe0, 0x47]; // amarelo
const STAR_EDGE = [0xb4, 0x53, 0x09]; // âmbar escuro (borda)

function starPolygon(cx, cy, outer, inner) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function inPolygon(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// distância normalizada de um ponto ao polígono (para achar a borda)
function edgeFactor(pts, x, y, width) {
  let best = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [x1, y1] = pts[j];
    const [x2, y2] = pts[i];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
    const d = Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
    if (d < best) best = d;
  }
  return best / width; // 0 = na borda
}

function renderLayer(size, scale, starRatio) {
  const N = size * scale;
  const buf = Buffer.alloc(N * N * 4);
  const starOuter = size * starRatio * scale;
  const starInner = starOuter * 0.42;
  const cx = N / 2;
  const cy = N * 0.47;
  const poly = starPolygon(cx, cy, starOuter, starInner);
  const glowR = N * 0.42;

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      const t = y / (N - 1);

      // fundo: gradiente vertical
      let r = TOP[0] + (BOTTOM[0] - TOP[0]) * t;
      let g = TOP[1] + (BOTTOM[1] - TOP[1]) * t;
      let b = TOP[2] + (BOTTOM[2] - TOP[2]) * t;

      // halo âmbar atrás da estrela
      const d = Math.hypot(x - cx, y - cy);
      const glow = Math.exp(-(d * d) / (glowR * glowR)) * 0.55;
      r += (GLOW[0] - r) * glow;
      g += (GLOW[1] - g) * glow;
      b += (GLOW[2] - b) * glow;

      if (inPolygon(poly, x, y)) {
        const e = edgeFactor(poly, x, y, N);
        const mix = Math.min(1, Math.max(0, 1 - e / 0.012)); // borda escura
        r = STAR[0] + (STAR_EDGE[0] - STAR[0]) * mix;
        g = STAR[1] + (STAR_EDGE[1] - STAR[1]) * mix;
        b = STAR[2] + (STAR_EDGE[2] - STAR[2]) * mix;
      }

      buf[i] = Math.round(r);
      buf[i + 1] = Math.round(g);
      buf[i + 2] = Math.round(b);
      buf[i + 3] = 255;
    }
  }
  return buf;
}

function downsample(buf, size, scale) {
  const N = size * scale;
  const out = Buffer.alloc(size * size * 4);
  const area = scale * scale;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const i = ((y * scale + dy) * N + (x * scale + dx)) * 4;
          r += buf[i];
          g += buf[i + 1];
          b += buf[i + 2];
        }
      }
      const o = (y * size + x) * 4;
      out[o] = Math.round(r / area);
      out[o + 1] = Math.round(g / area);
      out[o + 2] = Math.round(b / area);
      out[o + 3] = 255;
    }
  }
  return out;
}

function icon(size, starRatio = 0.33) {
  const scale = 4;
  return encodePNG(size, size, downsample(renderLayer(size, scale, starRatio), size, scale));
}

/* --------------------------------- saída --------------------------------- */

mkdirSync(OUT, { recursive: true });

const files = [
  ['apple-touch-icon-180.png', icon(180)],
  ['icon-192.png', icon(192)],
  ['icon-512.png', icon(512)],
  // maskable: estrela menor, dentro da "safe zone" de 80% que o Android recorta
  ['icon-maskable-512.png', icon(512, 0.23)],
];

for (const [name, data] of files) {
  writeFileSync(`${OUT}/${name}`, data);
  console.log(`${name}  ${(data.length / 1024).toFixed(1)} kB`);
}
