// As 12 silhuetas do cenário precisam rodar de verdade.
//
// Não usamos `node-canvas`: aqui o contexto é um stub que só registra chamadas.
// O que interessa é o erro de runtime — variávelundefined, método inexistente no
// CanvasRenderingContext2D, `NaN` em coordenada — que quebraria a tela preta do
// jogo no celular sem nenhum teste de pixel avisar.

import { describe, expect, it } from 'vitest';
import { CENARIOS, type Paleta } from './scenarios';

const PALETA: Paleta = { silhueta: '#123456', destaque: '#abcdef', clara: '#fefefe' };

interface Chamadas {
  n: number;
  nan: number;
}

function contextoStub(log: Chamadas): CanvasRenderingContext2D {
  const conta = (x?: number, y?: number) => {
    log.n++;
    for (const v of [x, y]) {
      if (typeof v === 'number' && !Number.isFinite(v)) log.nan++;
    }
  };
  const noop = (a?: number, b?: number) => {
    conta(a, b);
    return undefined as never;
  };
  const base = {
    canvas: {} as HTMLCanvasElement,
    save: noop,
    restore: noop,
    translate: noop,
    scale: noop,
    rotate: noop,
    transform: noop,
    setTransform: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    quadraticCurveTo: noop,
    bezierCurveTo: noop,
    arc: noop,
    ellipse: noop,
    rect: noop,
    fill: noop,
    stroke: noop,
    clip: noop,
    fillRect: noop,
    strokeRect: noop,
    clearRect: noop,
    fillText: noop,
    strokeText: noop,
    measureText: () => ({ width: 0 }) as TextMetrics,
    setLineDash: noop,
    drawImage: noop,
    putImageData: noop,
    getImageData: () => ({}) as ImageData,
    createImageData: () => ({}) as ImageData,
    createLinearGradient: () => ({ addColorStop: noop }) as unknown as CanvasGradient,
    createRadialGradient: () => ({ addColorStop: noop }) as unknown as CanvasGradient,
    createPattern: () => null,
  };
  // `globalAlpha` e as cores são atributos lidos/escritos normalmente.
  return new Proxy(base, {
    get(alvo, chave: string) {
      if (chave in alvo) return alvo[chave as keyof typeof alvo];
      return undefined;
    },
    set(alvo, chave: string, valor) {
      alvo[chave as keyof typeof alvo] = valor;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

describe('cenário da A Grande Jornada', () => {
  it('cobre os 12 marcos com silhuetas distintas', () => {
    expect(Object.keys(CENARIOS)).toHaveLength(12);
    expect(new Set(Object.values(CENARIOS)).size).toBe(12);
  });

  for (const [id, desenhar] of Object.entries(CENARIOS)) {
    it(`desenha "${id}" sem erro e sem coordenada inválida`, () => {
      const log: Chamadas = { n: 0, nan: 0 };
      const ctx = contextoStub(log);
      expect(() => desenhar(ctx, PALETA)).not.toThrow();
      expect(log.nan, `${id} desenhou coordenada NaN/Infinity`).toBe(0);
      expect(log.n, `${id} não desenhou nada`).toBeGreaterThan(3);
    });
  }
});