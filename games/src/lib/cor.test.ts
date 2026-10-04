// A matemática de cor em si (o gate que usa isto está em `data/paleta.test.ts`).
import { describe, expect, it } from 'vitest';
import { contraste, deltaE, hexParaRgb, menorDeltaE, paraLab, simularDaltonismo } from './cor';

describe('cor (lib/cor.ts)', () => {
  it('lê hex de 3 e de 6 dígitos', () => {
    expect(hexParaRgb('#abc')).toEqual(hexParaRgb('#aabbcc'));
    expect(hexParaRgb('#ffffff')).toEqual([1, 1, 1]);
    expect(hexParaRgb('#000000')).toEqual([0, 0, 0]);
  });

  it('contraste bate com o WCAG (preto/branco = 21:1)', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 2);
    expect(contraste('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    // ordem não importa
    expect(contraste('#000000', '#ffffff')).toBe(contraste('#ffffff', '#000000'));
  });

  it('distância: cor igual = 0, cores muito diferentes = grande', () => {
    expect(deltaE('#abcdef', '#abcdef')).toBe(0);
    expect(deltaE('#ff0000', '#00ff00')).toBeGreaterThan(100);
  });

  it('Lab é simétrico e L vai de 0 (preto) a ~100 (branco)', () => {
    const [preto] = paraLab('#000000');
    const [branco] = paraLab('#ffffff');
    expect(preto).toBeCloseTo(0, 1);
    expect(branco).toBeCloseTo(100, 0);
    expect(deltaE('#123456', '#654321')).toBeCloseTo(deltaE('#654321', '#123456'), 6);
  });

  it('a simulação afasta vermelho de verde (é para isso que ela existe)', () => {
    const normal = deltaE('#ff0000', '#00ff00');
    const deuter = deltaE(simularDaltonismo('#ff0000', 'deuteranopia'), simularDaltonismo('#00ff00', 'deuteranopia'));
    expect(deuter).toBeLessThan(normal * 0.4);
  });

  it('menorDeltaE devolve a PIOR visão das quatro', () => {
    const par = menorDeltaE('#ff0000', '#00ff00');
    expect(par.tipo).toBe('deuteranopia'); // o par que some é o clássico
    expect(par.de).toBeLessThan(deltaE('#ff0000', '#00ff00'));
    // cinza não tem par: nenhuma visão o desfaz
    expect(menorDeltaE('#808080', '#808080').de).toBe(0);
  });
});
