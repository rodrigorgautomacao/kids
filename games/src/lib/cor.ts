// Cor que se pode medir — o gate de daltonismo e contraste da vertical
// (skill `jogos-forma` §5.1 · `jogos-crianca` §5).
//
// 🔒 Por que existe: no *Dixit Kids* as peças foram tingidas com contraste
// suficiente para daltonismo **porque a criança precisa identificar o que é o
// quê**. No nosso caso é mais forte: **quando a cor carrega o sentido da
// lição, a cor é conteúdo**. Um par de cores que se funde no filtro da criança
// não é detalhe estético — é ela perdendo a informação.
//
// Sem isto, "está bonito" era o único teste de cor do projeto.

/** Canal sRGB 0..1 a partir de `#rrggbb`. */
export function hexParaRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const srgbParaLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearParaSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

/** RGB sRGB → RGB linear (o espaço em que a simulação de daltonismo é válida). */
export function paraLinear(rgb: [number, number, number]): [number, number, number] {
  return [srgbParaLinear(rgb[0]), srgbParaLinear(rgb[1]), srgbParaLinear(rgb[2])];
}

export type Daltonismo = 'protanopia' | 'deuteranopia' | 'tritanopia';

/**
 * Matrizes de Machado et al. (2009), severidade 1.0, aplicadas em RGB linear.
 * É a mesma usada pelas ferramentas de acessibilidade de navegador.
 */
const MATRIZES: Record<Daltonismo, number[]> = {
  protanopia: [
    0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998,
  ],
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039,
  ],
};

/** Simula como a cor é vista com a deficiência indicada (mantém o matiz do buffer). */
export function simularDaltonismo(hex: string, tipo: Daltonismo): string {
  const [r, g, b] = paraLinear(hexParaRgb(hex));
  const m = MATRIZES[tipo];
  const conv = (lin: [number, number, number]) =>
    lin.map((v) => Math.round(Math.min(1, Math.max(0, linearParaSrgb(v))) * 255))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('');
  return `#${conv([m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b])}`;
}

/** RGB → CIELAB (D65). */
export function paraLab(hex: string): [number, number, number] {
  const [r, g, b] = paraLinear(hexParaRgb(hex));
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** Distância perceptual ΔE76 entre duas cores hex. */
export function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = paraLab(a);
  const [l2, a2, b2] = paraLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** Luminância relativa (WCAG 2.1). */
export function luminancia(hex: string): number {
  const [r, g, b] = paraLinear(hexParaRgb(hex));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG (1:1 … 21:1). */
export function contraste(a: string, b: string): number {
  const l1 = luminancia(a);
  const l2 = luminancia(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const DALTONISMOS: Daltonismo[] = ['protanopia', 'deuteranopia', 'tritanopia'];

/**
 * Menor ΔE entre as duas cores em **qualquer** visão (normal + as três
 * deficiências). É este número que diz se a criança distingue os dois
 * elementos — e é ele que precisa passar da régua.
 */
export function menorDeltaE(a: string, b: string): { tipo: Daltonismo | 'normal'; de: number } {
  let pior: { tipo: Daltonismo | 'normal'; de: number } = {
    tipo: 'normal',
    de: deltaE(a, b),
  };
  for (const tipo of DALTONISMOS) {
    const de = deltaE(simularDaltonismo(a, tipo), simularDaltonismo(b, tipo));
    if (de < pior.de) pior = { tipo, de };
  }
  return pior;
}

/** As cores ainda se distinguem depois do filtro? */
export function distinguiveis(a: string, b: string, minimo = 20): boolean {
  return menorDeltaE(a, b).de >= minimo;
}