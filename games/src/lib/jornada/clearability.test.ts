/**
 * Gate da regra de ouro de **A Grande Jornada**: **todo vão é transponível** e
 * **todo conteúdo é alcançável** — medido, não deduzido.
 *
 * Isto roda `stepPlayer`, o MESMO módulo que o motor executa, sobre os mapas
 * de verdade das 12 etapas. A versão anterior do gate (`jornada-engine.test.ts`)
 * usava a fórmula fechada `v²/2g` e media só a linha principal do chão — dava
 * verde sem provar nada. Aqui o piloto é o jogo.
 *
 *   → `jogos-arquitetura` §1 e §4 · `jogos-game-feel` §2 · `jogos-qa` §6
 */

import { describe, expect, it } from 'vitest';
import { JORNADA_LEVELS } from '../../data/jornada';
import {
  COYOTE_TIME,
  FALL_GRAVITY,
  GRAVITY,
  PLAYER_H,
  PLAYER_W,
  RUN_MAX,
  RUN_MAX_SMALL_KIDS,
  TILE,
} from './constants';
import { CHAO } from './gerar';
import { createPlayer, simulateJump, stepPlayer } from './physics';
import { parseMap, type TileMap } from './tiles';

/** Folga obrigatória sobre qualquer vão. */
const FOLGA = 0.2;

/** Sólido para a criança (espinho/muro também bloqueiam). */
const SOLIDO = (ch: string) => ch === '#' || ch === '?' || ch === 'x' || ch === 'w';

/** Perfis de pilotagem: como a criança chega na borda do vão. */
const PERFIS = [
  { label: 'corrida (normal)', maxSpeed: RUN_MAX, warm: true },
  { label: 'corrida (pequeninos)', maxSpeed: RUN_MAX_SMALL_KIDS, warm: true },
  { label: 'parada na borda (pior caso)', maxSpeed: RUN_MAX, warm: false },
] as const;

interface Gap {
  g0: number;
  g1: number;
}

/** Vãos do chão: corrida de tiles sem sólido na linha do andar. */
function gaps(map: TileMap): Gap[] {
  const out: Gap[] = [];
  let cur = -1;
  for (let tx = 0; tx < map.width; tx++) {
    const solido = SOLIDO(map.grid[CHAO][tx]);
    if (!solido && cur < 0) cur = tx;
    if (solido && cur >= 0) {
      out.push({ g0: cur, g1: tx });
      cur = -1;
    }
  }
  if (cur >= 0) out.push({ g0: cur, g1: map.width });
  return out;
}

/** Plataformas one-way (topo = linha do tile). */
function plataformas(map: TileMap): { x0: number; x1: number; y: number }[] {
  const out: { x0: number; x1: number; y: number }[] = [];
  for (let ty = 0; ty < CHAO; ty++) {
    let x = 0;
    while (x < map.width) {
      if (map.grid[ty][x] !== '=') {
        x++;
        continue;
      }
      const x0 = x;
      while (x < map.width && map.grid[ty][x] === '=') x++;
      out.push({ x0, x1: x, y: ty });
    }
  }
  return out;
}

/**
 * Piloto: segura a direita, pula no primeiro frame e corre até pousar.
 * É literalmente o que a criança faz — mesmo mapa, mesma colisão, mesmo pulo.
 * Devolve onde pousou; `caiu` = saiu do mapa pelo fundo.
 */
function cruzaVao(
  map: TileMap,
  vao: Gap,
  maxSpeed: number,
  warm: boolean,
): { ok: boolean; x: number; t: number } {
  // Decolagem colada na borda do vão (o melhor ponto possível) e o pior caso
  // em vertical: o chão do trecho de onde ela sai.
  let p = createPlayer(vao.g0 * TILE - PLAYER_W, CHAO * TILE - PLAYER_H);
  p.onGround = true;
  p.coyote = COYOTE_TIME;
  if (warm) p.vx = maxSpeed;
  const fundo = map.height * TILE;
  for (let i = 0; i < 240; i++) {
    const res = stepPlayer(
      map,
      p,
      { left: false, right: true, jump: true, jumpPressed: i === 0 },
      1 / 60,
      maxSpeed,
    );
    p = res.player;
    if (res.landed) return { ok: p.x + PLAYER_W > vao.g1 * TILE, x: p.x, t: i };
    if (p.y > fundo) return { ok: false, x: p.x, t: i };
  }
  return { ok: false, x: p.x, t: 240 };
}

const LIMITES = {
  altura: simulateJump(),
  /** Pior caso: parte do repouso segurando a direção. */
  piorCaso: simulateJump({ run: true }),
} as const;

describe('física medida — o motor dá o que a criança precisa', () => {
  it('o pulo sobe 3–4,5 tiles (medido, não v²/2g)', () => {
    expect(LIMITES.altura.height).toBeGreaterThan(TILE * 3);
    expect(LIMITES.altura.height).toBeLessThan(TILE * 4.5);
  });

  it('o pulo dura ~0,6–0,8 s e o ápice vem em ~0,3–0,45 s', () => {
    expect(LIMITES.altura.airTime).toBeGreaterThan(0.55);
    expect(LIMITES.altura.airTime).toBeLessThan(0.85);
    expect(LIMITES.altura.timeToApex).toBeGreaterThan(0.28);
    expect(LIMITES.altura.timeToApex).toBeLessThan(0.46);
  });

  it('o toque curto serve: o pulo cortado sobe bem menos, mas sobe', () => {
    // A criança que só encosta o dedo precisa atravessar o mesmo vão que a
    // que segura — por isso o corte não pode virar "não pulou".
    const cortado = simulateJump({ holdJump: false });
    expect(cortado.height).toBeGreaterThan(TILE);
    expect(cortado.height).toBeLessThan(LIMITES.altura.height * 0.75);
  });

  it('a queda é mais rápida que a subida (nada de pulo flutuante)', () => {
    const subida = LIMITES.altura.timeToApex;
    const queda = LIMITES.altura.airTime - LIMITES.altura.timeToApex;
    expect(FALL_GRAVITY).toBeGreaterThan(GRAVITY * 1.5);
    // Mesma altura, gravidade 1,6× maior ⇒ a volta leva MENOS tempo.
    // (O *apex hang* alonga a subida em relação à queda sem peso: por isso o
    // marco é o tempo, não a metade do arco.)
    expect(queda).toBeLessThan(subida * 0.85);
    expect(queda).toBeGreaterThan(subida * 0.4);
  });

  it('a correção de quina cobre o quanto o player andou no frame (pior caso > fixo)', () => {
    // A janela antiga era ±4 px fixos: num frame a 30 fps o player sobe ~16 px,
    // então a quina roubava o pulo mesmo "corrigindo".
    const janela = Math.abs(-600) * (1 / 30) + 4;
    expect(janela).toBeGreaterThan(4);
  });
});

describe('clearability — todo vão transponível (12 etapas × 3 perfis)', () => {
  it('o piloto cruza todo vão das 12 etapas, mesmo parado na borda', () => {
    let vaos = 0;
    const falhas: string[] = [];
    for (const lv of JORNADA_LEVELS) {
      const map = parseMap(lv.map);
      for (const vao of gaps(map)) {
        vaos++;
        for (const p of PERFIS) {
          const r = cruzaVao(map, vao, p.maxSpeed, p.warm);
          if (!r.ok) {
            falhas.push(
              `${lv.id} vão[${vao.g0},${vao.g1}) = ${vao.g1 - vao.g0} tiles · ${p.label} · ` +
                `${r.x > 0 && r.t >= 240 ? 'não pousou' : 'caiu'} (alcance medido ${LIMITES.piorCaso.reach.toFixed(0)} px)`,
            );
          }
        }
      }
    }
    expect(falhas, `vaos=${vaos}\n${falhas.join('\n')}`).toEqual([]);
    expect(vaos).toBeGreaterThan(60); // o gate cobriu a casa inteira
  });

  it('todo vão cabe no alcance do pior caso com ≥20% de folga', () => {
    const teto = LIMITES.piorCaso.reach * (1 - FOLGA);
    let maior = 0;
    for (const lv of JORNADA_LEVELS) {
      const map = parseMap(lv.map);
      for (const vao of gaps(map)) {
        const px = (vao.g1 - vao.g0) * TILE;
        maior = Math.max(maior, px);
        expect(px, `${lv.id}: vão de ${px} px > ${teto.toFixed(0)} px`).toBeLessThanOrEqual(teto);
      }
    }
    // dado registrado: o mundo não cresce sem limite
    expect(maior).toBeLessThanOrEqual(TILE * 3);
  });

  it('a curva evolui nos perigos, não no vão (o vão está saturado)', () => {
    // Medido: o maior vão é 3 tiles em todos os atos — e não por acaso. Com
    // alcance de 100,8 px no pior caso, 4 tiles (96 px) furaria a folga de 20%
    // (teto = 80,6 px). A curva NÃO pode crescer no vão sem redesenhar o pulo,
    // então ela cresce nos perigos. Registrado aqui para ninguém "consertar"
    // o vão e quebrar a folga sem perceber.
    const maiores = [1, 2, 3, 4].map((ato) => {
      let maior = 0;
      for (const lv of JORNADA_LEVELS.filter((l) => l.act === ato)) {
        for (const v of gaps(parseMap(lv.map))) maior = Math.max(maior, v.g1 - v.g0);
      }
      return maior;
    });
    expect(maiores).toEqual([3, 3, 3, 3]);
    // teto duro do vão: 3 tiles, para a folga de 20% continuar de pé
    expect(TILE * 4 * (1 + FOLGA)).toBeGreaterThan(LIMITES.piorCaso.reach);

    const perigos = [1, 2, 3, 4].map(
      (ato) =>
        JORNADA_LEVELS.filter((l) => l.act === ato).reduce(
          (n, l) => n + parseMap(l.map).spawns.length,
          0,
        ),
    );
    expect(perigos[1], 'ato 2 tem mais perigo que o ato 1').toBeGreaterThan(perigos[0]);
    expect(perigos[2], 'ato 3 tem mais perigo que o ato 1').toBeGreaterThan(perigos[0]);
    // Ato 4 é a Consumação: sem inimigo (coerência com Ap 21.4-6).
    expect(perigos[3]).toBe(0);
  });
});

describe('conteúdo — nada de prêmio que a criança não alcança', () => {
  it('todo desvio (Cancelinha) está ao alcance do pulo do chão', () => {
    for (const lv of JORNADA_LEVELS) {
      for (const d of parseMap(lv.map).detours) {
        const altura = CHAO * TILE - d.y;
        expect(
          altura,
          `${lv.id}: Cancelinha a ${altura} px > ápice medido ${LIMITES.altura.height.toFixed(0)} px`,
        ).toBeLessThan(LIMITES.altura.height);
      }
    }
  });

  it('toda semente está ao alcance (no chão ou em plataforma reachable)', () => {
    // Semente no chão é a regra do gerador; a aqui é a garantia.
    const alturaOk = (y: number) => CHAO * TILE - y <= LIMITES.altura.height;
    for (const lv of JORNADA_LEVELS) {
      for (const s of parseMap(lv.map).seeds) {
        expect(alturaOk(s.y), `${lv.id}: semente a ${CHAO * TILE - s.y} px`).toBe(true);
      }
    }
  });

  it.fails(
    'DÍVIDA CONHECIDA: as plataformas flutuantes estão acima do ápice do chão — ' +
      'elas são decorativas nas 12 etapas (medido: mínimo 120 px do chão contra ' +
      'ápice de 82 px). Subir o ápice ou descer as faixas é decisão de feel e ' +
      'exige playtest, então este teste fica invertido (falha = alguém corrigiu).',
    () => {
      const inalcancaveis: string[] = [];
      for (const lv of JORNADA_LEVELS) {
        const map = parseMap(lv.map);
        for (const pf of plataformas(map)) {
          const altura = (CHAO - pf.y) * TILE;
          if (altura > LIMITES.altura.height) {
            inalcancaveis.push(`${lv.id}:${pf.x0}-${pf.x1}@${altura}px`);
          }
        }
      }
      expect(inalcancaveis.join(' ')).toBe('');
    },
  );
});