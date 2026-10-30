import type { Faixa } from '../../data/games';

/**
 * Paleta neon de cada faixa no escuro do salão.
 *
 * Mora fora do catálogo (`data/games`) de propósito: `FAIXAS` é conteúdo e não
 * precisa saber de brilho, moldura ou retrato. Aqui é decisão de *fliperama*.
 */
export interface FaixaNeon {
  /** Borda de repouso do bloco/cartucho. */
  border: string;
  /** Borda do bloco em foco (acesa). */
  borderFocus: string;
  /** Filete de luz no topo da seção. */
  bar: string;
  /** Cor do título da faixa. */
  name: string;
  /** Pílula de texto. */
  chip: string;
  /** Halo do bloco em foco. */
  glow: string;
  /** Anel pulsante do bloco em foco. */
  ring: string;
  /** Cores do retrato (`FaixaArt`). */
  art: {
    base: string;
    soft: string;
    cloth1: string;
    cloth2: string;
  };
}

export const FAIXA_NEON: Record<Faixa, FaixaNeon> = {
  '3-4': {
    border: 'border-amber-300/35',
    borderFocus: 'border-amber-300',
    bar: 'from-amber-300 via-rose-300 to-pink-400',
    name: 'text-amber-200',
    chip: 'bg-amber-400/15 text-amber-100',
    glow: 'shadow-[0_0_38px_-4px_rgba(251,191,36,0.65)]',
    ring: 'ring-amber-300/90',
    art: { base: '#fbbf24', soft: '#fb7185', cloth1: '#f59e0b', cloth2: '#b45309' },
  },
  '5-6': {
    border: 'border-sky-300/35',
    borderFocus: 'border-sky-300',
    bar: 'from-sky-300 via-cyan-300 to-emerald-300',
    name: 'text-sky-200',
    chip: 'bg-sky-400/15 text-sky-100',
    glow: 'shadow-[0_0_38px_-4px_rgba(56,189,248,0.65)]',
    ring: 'ring-sky-300/90',
    art: { base: '#38bdf8', soft: '#34d399', cloth1: '#0ea5e9', cloth2: '#0c4a6e' },
  },
  '7-9': {
    border: 'border-violet-300/35',
    borderFocus: 'border-violet-300',
    bar: 'from-violet-300 via-fuchsia-300 to-indigo-400',
    name: 'text-violet-200',
    chip: 'bg-violet-400/15 text-violet-100',
    glow: 'shadow-[0_0_38px_-4px_rgba(167,139,250,0.65)]',
    ring: 'ring-violet-300/90',
    art: { base: '#a78bfa', soft: '#f0abfc', cloth1: '#8b5cf6', cloth2: '#4c1d95' },
  },
};
