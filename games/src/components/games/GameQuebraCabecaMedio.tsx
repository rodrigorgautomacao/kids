import PuzzleGame, { type PuzzleLevel } from './PuzzleGame';
import type { GameLevel } from '../../lib/levels';

// ── Quebra-Cabeça Bíblico 3×3+ (5–6 anos) ────────────────────────────────
// Mesmos 10 níveis crescentes, com cenas diferentes das do 3–4.

const POOL = [
  { backdrop: 'mar-separado', ref: 'Êxodo 14.21 (NAA)', label: 'a travessia do mar' },
  { backdrop: 'muralha', ref: 'Josué 6.20 (NAA)', label: 'as muralhas de Jericó' },
  { backdrop: 'estabulo', ref: 'Lucas 2.7 (NAA)', label: 'o nascimento de Jesus' },
  { backdrop: 'monte', ref: '1 Reis 18.38 (NAA)', label: 'o fogo no monte Carmelo' },
  { backdrop: 'cidade', ref: 'Jonas 3.5 (NAA)', label: 'a cidade de Nínive' },
  { backdrop: 'arco-iris', ref: 'Gênesis 9.13 (NAA)', label: 'o arco-íris da promessa' },
  { backdrop: 'sarca', ref: 'Êxodo 3.2 (NAA)', label: 'a sarça em chamas' },
  { backdrop: 'cova', ref: 'Daniel 6.16 (NAA)', label: 'a cova dos leões' },
  { backdrop: 'prisao', ref: 'Atos 16.25 (NAA)', label: 'a prisão de Paulo' },
  { backdrop: 'estrada', ref: 'Atos 9.3 (NAA)', label: 'a luz no caminho' },
] as const;

const STEPS: [number, number][] = [
  [2, 2], [2, 3], [2, 4], [2, 5], [3, 4], [4, 4], [4, 5], [5, 5], [5, 6], [6, 6],
];

export const QUEBRA_MEDIO_LEVELS: GameLevel<PuzzleLevel>[] = STEPS.map(([rows, cols], i) => {
  const p = POOL[i % POOL.length];
  return {
    id: `n${i + 1}`,
    name: `${rows * cols} peças`,
    rounds: [{ id: `p${i + 1}`, ref: p.ref, backdrop: p.backdrop, label: p.label, rows, cols }],
  };
});

export default function GameQuebraCabecaMedio({ onExit }: { onExit: () => void }) {
  return (
    <PuzzleGame
      gameId="quebra-cabeca-medio"
      title="Quebra-Cabeça Bíblico"
      subtitle="Monte a cena com cada vez mais peças!"
      bg="bg-gradient-to-b from-indigo-100 via-sky-50 to-cyan-100"
      titleClass="text-indigo-600"
      levels={QUEBRA_MEDIO_LEVELS}
      onExit={onExit}
    />
  );
}
