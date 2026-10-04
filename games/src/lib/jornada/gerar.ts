// Gerador de terreno da "A Grande Jornada" (GAME_DESIGN.md §6.1).
//
// Por que gerar em vez de escrever 12 mapas à mão? Cada etapa tem 192×14 tiles
// (~32 mil caracteres no total). Gerando com PRNG **determinístico** (mulberry32)
// o mapa é grande, variado e — o mais importante para a criança — **idêntico em
// todo playtest**: ela aprende o trajeto em vez de brigar com um mapa aleatório.
//
// Regras de design que o gerador respeita (skill `jogos-game-design` §3):
//   · Erro não pune: cair num vale devolve ao Marco (o motor faz isso), então
//     vale largo é seguro.
//   · Sem pulo impossível: a "escada" de colunas nunca pede mais que 3 tiles de
//     subida followed por espaço para pousar.
//   · Nada de tela parada: chunk de 16 colunas é sempre alguma coisa
//     (plataforma, vale, degrau, Correction, semente ou marco).

import type { TileChar } from './types';

export const MAP_W = 192;
export const MAP_H = 14;
/**
 * Linha das entidades (a "rua" onde o jogador caminha) e topo do chão.
 * ⚠️ São ADJACENTES de propósito: se o chão começasse uma linha abaixo, todo
 * o mundo seria sólido e não existiria vale, semente nem inimigo — o primeiro
 * teste pegou exatamente isso (192/192 colunas de chão).
 */
export const RUA = MAP_H - 3; // 11 — entidades e o andar do jogador
export const CHAO = MAP_H - 2; // 12 — 1ª linha sólida do chão (o resto, 13, é preenchimento)
export const CHUNK = 16;
export const CHUNKS = MAP_W / CHUNK; // 12

/** PRNG determinístico (mulberry32). Mesma seed → mesmo mapa, sempre. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface OpcoesMapa {
  /** Semente — o mapa inteiro é função dela. */
  seed: number;
  /** 0..1 — quanto mais alto, mais degraus, mais inimigos e mais espinhos. */
  desafio: number;
  /** Caracteres extras forbidden neste bioma (ex.: '~' só no Rio). */
  /** Placement of the water surface at the bottom of the pits. */
  agua?: boolean;
  /** Coloca espinhos 'S' de patrulha. */
  espinhos?: boolean;
  /** Coloca o Muro de Espinhos 'x' (precisa de 2 sementes para romper). */
  muro?: boolean;
  /** Coloca o Grande Desespero 'd' (senta na estrada; passa com Escudo/luz). */
  desespero?: boolean;
  /** Coloca a Cancelinha 'c' (só aparece com luz). */
  cancelinha?: boolean;
  /** Quantidade de Sementes da Palavra 'o' espalhadas. */
  sementes?: number;
  /** Quantidade de Marcos 'g' intermediários. */
  marcos?: number;
  /** Escudos da Fé 'E' extras. */
  escudos?: number;
}

type Grid = TileChar[][];

function novaGrid(): Grid {
  return Array.from({ length: MAP_H }, () => Array.from({ length: MAP_W }, () => '.' as TileChar));
}

function emCima(g: Grid, x: number, y: number, ch: TileChar, w = 1): void {
  for (let i = 0; i < w; i++) {
    if (x + i >= 0 && x + i < MAP_W && y >= 0 && y < MAP_H) g[y][x + i] = ch;
  }
}

/** Chão sólido de `alt` tiles de altura a partir da linha `topo`. */
function blocoSolido(g: Grid, x0: number, x1: number, topo: number): void {
  for (let x = x0; x < x1; x++) {
    for (let y = topo; y < MAP_H; y++) g[y][x] = '#';
  }
}

/** Garante um vão andável (o chão nunca some inteiro sob o jogador). */
function chaoBase(g: Grid, r: () => number, o: OpcoesMapa): void {
  // O chão é contínuo com vales — a base nunca some inteira.
  // 🔒 Regra de ouro do `jogos-game-feel` §2: vale NUNCA encosta em vale e o
  // vão fica em ≤3 colunas (72px) — o alcance do pulo cobre com ≥20% de folga
  // até no Modo Pequeninos. Vale+vale empilhado gerava vãos de 13 colunas.
  let x = 0;
  let lastWasValley = false;
  while (x < MAP_W) {
    const tipo = r();
    if (tipo < 0.62 || lastWasValley) {
      // trecho firme, comprimento variável
      const len = 3 + Math.floor(r() * 6);
      blocoSolido(g, x, Math.min(MAP_W, x + len), CHAO);
      x += len;
      lastWasValley = false;
    } else {
      // vale: 2 a 3 colunas de vão (o pulo de 3,5 tiles cobre com folga).
      // As linhas 12/13 já vêm apagadas de `limparChao` e ficam vazias — cair
      // devolve ao Marco (skill jogos-game-design §3: erro não pune).
      const gap = 2 + Math.floor(r() * 2);
      lastWasValley = true;
      if (o.agua) {
        // Rio da Morte: o vale é água. Caiu nela, volta ao Marco — a água é
        // a "travessia", não um castigo.
        emCima(g, x, CHAO, '~', gap);
        emCima(g, x, CHAO + 1, '~', gap);
      }
      x += gap;
    }
  }
  // Fecha as bordas para o jogador não cair no primeiro pixel.
  blocoSolido(g, 0, 2, CHAO);
  blocoSolido(g, MAP_W - 2, MAP_W, CHAO);
}

/** Plataformas flutuantes (one-way) em alturas variadas. */
function plataformas(g: Grid, r: () => number, o: OpcoesMapa): void {
  // Duas ou três "faixas" de altura, para dar verticalidade sem obrigar pulo longo.
  const faixas = [RUA - 4, RUA - 6, RUA - 7];
  const quantas = Math.round(6 + o.desafio * 10);
  for (let i = 0; i < quantas; i++) {
    const x = 3 + Math.floor(r() * (MAP_W - 8));
    const y = faixas[Math.floor(r() * faixas.length)];
    const len = 2 + Math.floor(r() * 4);
    emCima(g, x, y, '=', len);
  }
}

/** Sementes da Palavra — sempre em cima de chão ou plataforma, ao alcance do pulo. */
function sementes(g: Grid, r: () => number, o: OpcoesMapa): void {
  const n = o.sementes ?? Math.round(10 + o.desafio * 8);
  let placed = 0;
  let guard = 0;
  while (placed < n && guard++ < 400) {
    const x = 2 + Math.floor(r() * (MAP_W - 4));
    // tenta colocar na altura da rua e, se houver chão logo abaixo, sobe um pouco
    const y = RUA;
    if (g[y][x] === '.' && g[CHAO][x] === '#') {
      emCima(g, x, y, 'o');
      placed++;
    } else if (g[y - 3][x] === '=' && g[y - 4][x] === '.') {
      // Em cima da plataforma: a semente fica na linha em que o jogador pisa.
      emCima(g, x, y - 4, 'o');
      placed++;
    }
  }
}

/** Espinhos 'S' no chão da rua. */
function espinhos(g: Grid, r: () => number, o: OpcoesMapa): void {
  if (!o.espinhos) return;
  let placed = 0;
  const alvo = Math.round(3 + o.desafio * 8);
  let guard = 0;
  while (placed < alvo && guard++ < 400) {
    const x = 4 + Math.floor(r() * (MAP_W - 8));
    if (g[RUA][x] === '.' && g[CHAO][x] === '#' && g[RUA - 1][x] === '.') {
      emCima(g, x, RUA, 'S');
      placed++;
    }
  }
}

/** Marcos 'g' intermediários —Divide a etapa em trechos com respiro. */
function marcos(g: Grid, o: OpcoesMapa): void {
  const n = o.marcos ?? 3;
  for (let i = 1; i <= n; i++) {
    const x = Math.floor((MAP_W * i) / (n + 1));
    // procura o primeiro chão firme a partir do ponto para não cair no vale
    for (let dx = 0; dx < 12; dx++) {
      const cx = Math.min(MAP_W - 3, x + dx);
      if (g[RUA][cx] === '.' && g[CHAO][cx] === '#') {
        emCima(g, cx, RUA, 'g');
        break;
      }
    }
  }
}

/** Muro de Espinhos 'x' (rompe com 2 sementes de luz) e Muro que Cai 'w'. */
function muros(g: Grid, r: () => number, o: OpcoesMapa): void {
  if (!o.muro) return;
  const x = Math.floor(MAP_W * (0.3 + r() * 0.4));
  // procura chão firme
  for (let dx = 0; dx < 12; dx++) {
    const cx = Math.min(MAP_W - 4, x + dx);
    if (g[RUA][cx] === '.' && g[CHAO][cx] === '#') {
      emCima(g, cx, RUA, 'x', 1);
      emCima(g, cx, RUA - 1, 'x', 1);
      break;
    }
  }
}

/** Grande Desespero 'd' — senta na estrada e cresce enquanto a criança hesita. */
function desesperos(g: Grid, r: () => number, o: OpcoesMapa): void {
  if (!o.desespero) return;
  const x = Math.floor(MAP_W * (0.55 + r() * 0.25));
  for (let dx = 0; dx < 12; dx++) {
    const cx = Math.min(MAP_W - 4, x + dx);
    if (g[RUA][cx] === '.' && g[CHAO][cx] === '#') {
      emCima(g, cx, RUA, 'd');
      break;
    }
  }
}

/**
 * Cancelinha 'c' — prêmio opcional que só aparece com a luz.
 *
 * 🔒 Fica na **rua**, sobre chão firme. Antes ia a `RUA - 3` (96 px do chão),
 * acima do ápice medido do pulo (82 px, ver `clearability.test.ts`): o prêmio
 * existia no mapa e nenhuma criança conseguia chegar nele.
 */
function cancelinha(g: Grid, r: () => number, o: OpcoesMapa): void {
  if (!o.cancelinha) return;
  const x = 4 + Math.floor(r() * (MAP_W - 8));
  // Procura um pedaço de chão firme (nunca sobre um vale, nunca sobre o Portão).
  for (let dx = 0; dx < 16; dx++) {
    const cx = Math.min(MAP_W - 3, x + dx);
    if (g[RUA][cx] === '.' && g[CHAO][cx] === '#' && g[RUA + 1][cx] === '#') {
      emCima(g, cx, RUA, 'c');
      return;
    }
  }
}

/** Ponto de partida 'g' (o primeiro) — sempre em chão firme no início. */
function partida(g: Grid): void {
  for (let x = 1; x < 24; x++) {
    if (g[RUA][x] === '.' && g[CHAO][x] === '#') {
      emCima(g, x, RUA, 'g');
      return;
    }
  }
  emCima(g, 1, RUA, 'g');
}

/**
 * Portão '!' — fim da etapa. Garante chão firme **embaixo** dele: se o ponto
 * escolhido caiu num vale, cava o vale (preenche as linhas do chão) antes de
 * plantar o portão. Sem isso a criança chega ao Portão e não consegue tocá-lo.
 */
function portao(g: Grid): void {
  const alvo = MAP_W - 8;
  for (let dx = 0; dx < 14; dx++) {
    const cx = alvo - dx;
    if (cx <= 2) break;
    if (g[CHAO][cx] === '#') {
      emCima(g, cx, RUA, '!');
      return;
    }
  }
  // Nenhum chão firme perto: nivela a faixa do portão e planta o '!' no meio.
  const meio = Math.floor(MAP_W / 2) - 4;
  blocoSolido(g, meio, meio + 10, CHAO);
  emCima(g, meio + 5, RUA, '!');
}

/** Zera as linhas do chão para AR. `chaoBase` é quem cava os vales depois. */
function limparChao(g: Grid): void {
  for (let x = 0; x < MAP_W; x++) {
    for (let y = CHAO; y < MAP_H; y++) g[y][x] = '.';
  }
}

/**
 * Monta a etapa completa: 14 linhas × 192 colunas, todas do mesmo tamanho.
 */
export function gerarMapa(o: OpcoesMapa): string[] {
  const r = prng(o.seed);
  const g = novaGrid();

  limparChao(g);
  // Bordas firmes primeiro: o começo e o fim do mapa nunca podem ser um vale.
  blocoSolido(g, 0, 4, CHAO);
  blocoSolido(g, MAP_W - 4, MAP_W, CHAO);
  chaoBase(g, r, o);
  espinhos(g, r, o);
  plataformas(g, r, o);
  marcos(g, o);
  muros(g, r, o);
  desesperos(g, r, o);
  sementes(g, r, o);
  // Depois das sementes: a Cancelinha é o prêmio opcional e não pode ser
  // sobrescrita por uma semente no mesmo tile.
  cancelinha(g, r, o);
  partida(g);
  portao(g);

  return g.map((linha) => linha.join(''));
}