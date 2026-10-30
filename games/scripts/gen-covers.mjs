#!/usr/bin/env node
/**
 * Gera as capas do menu de cartuchos a partir dos próprios jogos.
 *
 * Para cada jogo pronto do catálogo:
 *   1. abre em 1280×720 com deviceScaleFactor 2 (2560×1440 reais),
 *   2. esconde a barra do GameShell (a capa é só o jogo),
 *   3. tira o print e mede a imagem (desvio-padrão/cores distintas),
 *   4. se o print vier "vazio" (menu em branco, tela sem conteúdo), desenha
 *      uma capa SVG ilustrada com a cor do jogo, um ícone grande e o título,
 *   5. exporta, no próprio navegador, WebP:
 *        public/assets/covers/<id>.webp       1280×720  (q 92)
 *        public/assets/covers/<id>@2x.webp    2560×1440 (q 80)
 *        public/assets/covers/<id>-sq.webp    512×512   (q 90, recorte central)
 *        public/assets/covers/<id>-sq@2x.webp 1024×1024 (q 82)
 *
 * Uso: bun run covers   (com o dev server no ar, ou BASE_URL apontando p/ build)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:5199/kids/';
/** `only=<id>,<id>` gera só esses; `force_svg=1` força a capa ilustrada. */
const SOMENTE = (process.env.only ?? process.env.ONLY) ? (process.env.only ?? process.env.ONLY).split(',') : null;
const FORCAR_SVG = (process.env.force_svg ?? process.env.FORCE_SVG) === '1';
const OUT = path.resolve('public/assets/covers');
const REPORT = process.env.REPORT ?? '/tmp/opencode/covers-report.json';

/** Cores de apoio por família do Tailwind (para a capa de fallback). */
const HEX = {
  amber: '#f59e0b', yellow: '#eab308', lime: '#84cc16', emerald: '#10b981',
  teal: '#14b8a6', cyan: '#06b6d4', sky: '#0ea5e9', blue: '#3b82f6',
  indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7', fuchsia: '#d946ef',
  pink: '#ec4899', rose: '#f43f5e', orange: '#f97316', slate: '#64748b',
};

const ICONE_TIPO = { at: '📜', nt: '✝️', 'at-nt': '📖' };

function entradasDoCatalogo(fonte) {
  const inicio = fonte.indexOf('const GAMES');
  const corpo = fonte.slice(inicio);
  const ids = [...corpo.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m.index ?? 0);
  const saida = [];
  for (let i = 0; i < ids.length; i++) {
    const trecho = corpo.slice(ids[i], ids[i + 1] ?? corpo.length);
    const id = trecho.match(/id:\s*'([a-z0-9-]+)'/)?.[1];
    if (!id) continue;
    if (!/status:\s*'pronto'/.test(trecho)) continue;
    if (/faixa:\s*'3-4'|faixa:\s*'5-6'|faixa:\s*'7-9'/.test(trecho) && !/title:/.test(trecho)) continue;
    if (!/title:/.test(trecho)) continue;
    saida.push({
      id,
      title: trecho.match(/title:\s*'([^']+)'/)?.[1] ?? id,
      tipo: trecho.match(/tipo:\s*'([a-z-]+)'/)?.[1] ?? 'at-nt',
      cor: (trecho.match(/color:\s*'bg-([a-z]+)-/) || [])[1] ?? 'violet',
    });
  }
  return saida;
}

function svgFallback(jogo) {
  const cor = HEX[jogo.cor] ?? HEX.violet;
  const escuro = '#0b0618';
  const titulo = jogo.title.replace(/[<>&]/g, '');
  const linhas = [];
  let atual = '';
  for (const palavra of titulo.split(' ')) {
    const proximo = atual ? `${atual} ${palavra}` : palavra;
    if (proximo.length > 16 && atual) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = proximo;
    }
  }
  if (atual) linhas.push(atual);
  const tituloSvg = linhas
    .slice(0, 3)
    .map((l, i, arr) => {
      const y = 486 + (i - (arr.length - 1) / 2) * 62;
      return `<text x="640" y="${y}" text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="40" fill="#fde68a">${l}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="70%">
      <stop offset="0%" stop-color="${cor}" stop-opacity=".95"/>
      <stop offset="55%" stop-color="${cor}" stop-opacity=".35"/>
      <stop offset="100%" stop-color="${escuro}" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="piso" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${escuro}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${escuro}" stop-opacity=".95"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="${escuro}"/>
  <rect width="1280" height="720" fill="url(#g)"/>
  <g stroke="#ffffff" stroke-opacity=".12" stroke-width="2">
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${(i + 1) * 72}" x2="1280" y2="${(i + 1) * 72}"/>`).join('')}
  </g>
  <circle cx="640" cy="272" r="152" fill="none" stroke="${cor}" stroke-width="10" stroke-opacity=".55"/>
  <text x="640" y="322" text-anchor="middle" font-size="132" font-family="'Segoe UI Emoji','Noto Color Emoji',sans-serif">${ICONE_TIPO[jogo.tipo] ?? '📖'}</text>
  ${tituloSvg}
  <rect x="0" y="600" width="1280" height="120" fill="url(#piso)"/>
</svg>`;
}

/** Embaralha e mede a imagem: detecta print "vazio". */
async function medir(page, dataUrl) {
  return page.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 90;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, 160, 90);
    const d = ctx.getImageData(0, 0, 160, 90).data;
    let soma = 0;
    let soma2 = 0;
    const cores = new Set();
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      soma += l;
      soma2 += l * l;
      cores.add(((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4));
    }
    const n = d.length / 4;
    const media = soma / n;
    return { media, dp: Math.sqrt(Math.max(0, soma2 / n - media * media)), cores: cores.size };
  }, dataUrl);
}

/** Converte/recorta em WebP dentro do navegador. */
async function paraWebp(page, dataUrl, { w, h, sx = 0, sy = 0, sw = 2560, sh = 1440, q = 0.9 }) {
  const b64 = await page.evaluate(
    async ({ url, w, h, sx, sy, sw, sh, q }) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      return c.toDataURL('image/webp', q).split(',')[1];
    },
    { url: dataUrl, w, h, sx, sy, sw, sh, q },
  );
  return Buffer.from(b64, 'base64');
}

async function main() {
  const fonte = await readFile(path.resolve('src/data/games.tsx'), 'utf8');
  const jogos = entradasDoCatalogo(fonte).filter((g) => !SOMENTE || SOMENTE.includes(g.id));
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const relatorio = [];

  for (const jogo of jogos) {
    // Contexto novo por jogo: nenhum progresso/modal salvo de outro cartucho.
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 2,
      locale: 'pt-BR',
      colorScheme: 'light',
    });
    const page = await ctx.newPage();
    let png;
    let stats = { media: 0, dp: 0, cores: 0 };
    try {
      await page.goto(`${BASE}?jogo=${jogo.id}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2200);
      // Fecha o "vamos jogar?" de abertura, se houver, para a capa pegar o jogo.
      // Tenta 3 vezes: em jogo sob demanda a intro pode montar depois da espera.
      const iniciar = page.locator('button', { hasText: /^(jogar|começar|comecar|vamos|ok|entendi|bora)/i }).first();
      for (let tentativa = 0; tentativa < 3; tentativa++) {
        if (!(await iniciar.isVisible().catch(() => false))) {
          await page.waitForTimeout(700);
          continue;
        }
        await iniciar.click({ timeout: 2500 }).catch(() => {});
        await page.waitForTimeout(900);
        break;
      }
      await page.addStyleTag({
        content: '[data-game-bar]{display:none!important} html,body{background:#000!important}',
      });
      await page.waitForTimeout(350);
      png = await page.screenshot({ type: 'png' });
      const url = `data:image/png;base64,${png.toString('base64')}`;
      stats = await medir(page, url);
    } catch (erro) {
      relatorio.push({ id: jogo.id, modo: 'erro', erro: String(erro).slice(0, 120) });
    }

    const ruim = FORCAR_SVG || !png || stats.dp < 9 || stats.cores < 14;
    let origem = png;
    let origemStats = stats;

    if (ruim) {
      await page.goto(`${BASE}robots.txt`, { waitUntil: 'domcontentloaded' });
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.evaluate((svg) => {
        document.open();
        document.write(
          `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;width:1280px;height:720px;overflow:hidden}@font-face{font-family:'Press Start 2P';src:url('/kids/fonts/press-start-2p-latin.woff2') format('woff2')}</style>${svg}`,
        );
        document.close();
      }, svgFallback(jogo));
      await page.waitForTimeout(600);
      origem = await page.screenshot({ type: 'png' });
      const url = `data:image/png;base64,${origem.toString('base64')}`;
      origemStats = await medir(page, url);
      relatorio.push({ id: jogo.id, modo: 'capa-svg', stats, origemStats });
    } else {
      relatorio.push({ id: jogo.id, modo: 'print', stats });
    }

    const url = `data:image/png;base64,${origem.toString('base64')}`;

    await writeFile(path.join(OUT, `${jogo.id}.webp`), await paraWebp(page, url, { w: 1280, h: 720, q: 0.92 }));
    await writeFile(path.join(OUT, `${jogo.id}@2x.webp`), await paraWebp(page, url, { w: 2560, h: 1440, q: 0.8 }));
    await writeFile(
      path.join(OUT, `${jogo.id}-sq.webp`),
      await paraWebp(page, url, { w: 512, h: 512, sx: 560, sy: 0, sw: 1440, sh: 1440, q: 0.9 }),
    );
    await writeFile(
      path.join(OUT, `${jogo.id}-sq@2x.webp`),
      await paraWebp(page, url, { w: 1024, h: 1024, sx: 560, sy: 0, sw: 1440, sh: 1440, q: 0.82 }),
    );
    console.log(`✓ ${jogo.id} (${relatorio.at(-1).modo})`);
    await ctx.close();
  }

  await browser.close();
  await writeFile(REPORT, JSON.stringify(relatorio, null, 2));
  console.log(`\n${jogos.length} capas em ${OUT}`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
