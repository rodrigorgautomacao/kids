import PuzzleGame, { type PuzzleRound } from './PuzzleGame';

// ── Quebra-Cabeça Bíblico 3×3 (5–6 anos) ─────────────────────────────────
// Mesma mecânica do 2×2, com 9 peças (mais difícil) e cenas do AT e do NT.

const ROUNDS: PuzzleRound[] = [
  { id: 'mar', ref: 'Êxodo 14.21 (NAA)', backdrop: 'mar-separado', label: 'a travessia do mar' },
  { id: 'muralha', ref: 'Josué 6.20 (NAA)', backdrop: 'muralha', label: 'as muralhas de Jericó' },
  { id: 'estabulo', ref: 'Lucas 2.7 (NAA)', backdrop: 'estabulo', label: 'o nascimento de Jesus' },
  { id: 'monte', ref: '1 Reis 18.38 (NAA)', backdrop: 'monte', label: 'o fogo no monte Carmelo' },
  { id: 'cidade', ref: 'Jonas 3.5 (NAA)', backdrop: 'cidade', label: 'a cidade de Nínive' },
];

export default function GameQuebraCabecaMedio({ onExit }: { onExit: () => void }) {
  return (
    <PuzzleGame
      gameId="quebra-cabeca-medio"
      title="Quebra-Cabeça Bíblico"
      subtitle="Monte a cena com as 9 peças!"
      bg="bg-gradient-to-b from-indigo-100 via-sky-50 to-cyan-100"
      titleClass="text-indigo-600"
      grid={3}
      rounds={ROUNDS}
      onExit={onExit}
    />
  );
}
