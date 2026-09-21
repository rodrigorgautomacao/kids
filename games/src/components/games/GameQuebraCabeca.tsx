import PuzzleGame, { type PuzzleRound } from './PuzzleGame';

// ── Quebra-Cabeça Bíblico (3–4 anos) ─────────────────────────────────────
// Imagem 2×2 de cenas do Antigo e do Novo Testamento.

const ROUNDS: PuzzleRound[] = [
  { id: 'arca', ref: 'Gênesis 6.14 (NAA)', backdrop: 'arca', label: 'a arca de Noé' },
  { id: 'mar', ref: 'Êxodo 14.21 (NAA)', backdrop: 'mar-separado', label: 'o mar aberto' },
  { id: 'natal', ref: 'Lucas 2.7 (NAA)', backdrop: 'estabulo', label: 'o nascimento de Jesus' },
  { id: 'muralha', ref: 'Josué 6.20 (NAA)', backdrop: 'muralha', label: 'as muralhas de Jericó' },
];

export default function GameQuebraCabeca({ onExit }: { onExit: () => void }) {
  return (
    <PuzzleGame
      gameId="quebra-cabeca"
      title="Quebra-Cabeça Bíblico"
      subtitle="Troque as peças até montar a cena!"
      bg="bg-gradient-to-b from-sky-100 via-indigo-50 to-purple-100"
      titleClass="text-indigo-600"
      grid={2}
      rounds={ROUNDS}
      onExit={onExit}
    />
  );
}
