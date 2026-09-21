import PuzzleGame, { type PuzzleLevel } from './PuzzleGame';
import type { GameLevel } from '../../lib/levels';

// ── Quebra-Cabeça Bíblico (3–4 anos) ─────────────────────────────────────
// 10 níveis: o 1º tem 4 peças (2×2) e cada nível seguinte ganha mais peças,
// até 36 (6×6). A criança troca duas peças de lugar até remontar a cena.

const POOL = [
  { backdrop: 'arca', ref: 'Gênesis 6.14 (NAA)', label: 'a arca de Noé' },
  { backdrop: 'mar-separado', ref: 'Êxodo 14.21 (NAA)', label: 'o mar aberto' },
  { backdrop: 'estabulo', ref: 'Lucas 2.7 (NAA)', label: 'o nascimento de Jesus' },
  { backdrop: 'muralha', ref: 'Josué 6.20 (NAA)', label: 'as muralhas de Jericó' },
  { backdrop: 'monte', ref: '1 Reis 18.38 (NAA)', label: 'o fogo no monte Carmelo' },
  { backdrop: 'cidade', ref: 'Jonas 3.5 (NAA)', label: 'a cidade de Nínive' },
  { backdrop: 'campo', ref: '1 Samuel 16.11 (NAA)', label: 'o campo dos pastores' },
  { backdrop: 'rio', ref: '2 Reis 5.14 (NAA)', label: 'o rio Jordão' },
  { backdrop: 'palacio', ref: '1 Samuel 16.23 (NAA)', label: 'o palácio do rei' },
  { backdrop: 'deserto', ref: '1 Reis 17.6 (NAA)', label: 'o deserto de Elias' },
] as const;

/** Peças por nível: 4, 6, 8, 10, 12, 16, 20, 25, 30, 36. */
const STEPS: [number, number][] = [
  [2, 2], [2, 3], [2, 4], [2, 5], [3, 4], [4, 4], [4, 5], [5, 5], [5, 6], [6, 6],
];

export const QUEBRA_LEVELS: GameLevel<PuzzleLevel>[] = STEPS.map(([rows, cols], i) => {
  const p = POOL[i % POOL.length];
  return {
    id: `n${i + 1}`,
    name: `${rows * cols} peças`,
    rounds: [{ id: `p${i + 1}`, ref: p.ref, backdrop: p.backdrop, label: p.label, rows, cols }],
  };
});

export default function GameQuebraCabeca({ onExit }: { onExit: () => void }) {
  return (
    <PuzzleGame
      gameId="quebra-cabeca"
      title="Quebra-Cabeça Bíblico"
      subtitle="Troque as peças até montar a cena!"
      bg="bg-gradient-to-b from-sky-100 via-indigo-50 to-purple-100"
      titleClass="text-indigo-600"
      levels={QUEBRA_LEVELS}
      onExit={onExit}
    />
  );
}
