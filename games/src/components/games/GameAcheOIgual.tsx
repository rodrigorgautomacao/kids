import ChoiceGame, { type ChoiceRound } from './ChoiceGame';

// ── Ache o Igual (3–4 anos) ──────────────────────────────────────────────
// Discriminação visual: a criança acha a figura igual ao alvo.

const ROUNDS: ChoiceRound[] = [
  { prompt: 'Ache a ovelha igual!', target: { emoji: '🐑' }, options: [{ id: 'ovelha', emoji: '🐑' }, { id: 'carneiro', emoji: '🐏' }, { id: 'cabra', emoji: '🐐' }], correct: 'ovelha', ref: '1 Samuel 16.11 (NAA)', msg: 'Essa é a ovelha! Davi cuidava delas. 🐑' },
  { prompt: 'Ache a arca igual!', target: { emoji: '🚢' }, options: [{ id: 'arca', emoji: '🚢' }, { id: 'barco', emoji: '⛵' }, { id: 'canoa', emoji: '🛶' }], correct: 'arca', ref: 'Gênesis 6.14 (NAA)', msg: 'Essa é a arca grande de Noé! 🚢' },
  { prompt: 'Ache a estrela igual!', target: { emoji: '⭐' }, options: [{ id: 'estrela', emoji: '⭐' }, { id: 'lua', emoji: '🌙' }, { id: 'sol', emoji: '☀️' }], correct: 'estrela', ref: 'Mateus 2.2 (NAA)', msg: 'A estrela guiou os magos! ⭐' },
  { prompt: 'Ache o leão igual!', target: { emoji: '🦁' }, options: [{ id: 'leao', emoji: '🦁' }, { id: 'tigre', emoji: '🐯' }, { id: 'gato', emoji: '🐱' }], correct: 'leao', ref: 'Daniel 6.16 (NAA)', msg: 'O leão! Deus protegeu Daniel deles. 🦁' },
  { prompt: 'Ache o peixe igual!', target: { emoji: '🐟' }, options: [{ id: 'peixe', emoji: '🐟' }, { id: 'peixinho', emoji: '🐠' }, { id: 'baiacu', emoji: '🐡' }], correct: 'peixe', ref: 'Jonas 1.17 (NAA)', msg: 'O peixe grande! Ele levou Jonas à praia. 🐟' },
];

export default function GameAcheOIgual({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="ache-o-igual"
      title="Ache o Igual"
      subtitle="Toque na figura igual ao modelo!"
      bg="bg-gradient-to-b from-pink-100 via-rose-50 to-amber-100"
      titleClass="text-rose-600"
      variant="target"
      rounds={ROUNDS}
      onExit={onExit}
    />
  );
}
