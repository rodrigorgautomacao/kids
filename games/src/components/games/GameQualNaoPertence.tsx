import ChoiceGame, { type ChoiceRound } from './ChoiceGame';

// ── Qual Não Pertence? (5–6 anos) ────────────────────────────────────────
// A criança acha, entre três figuras, a que não combina com a história.

const ROUNDS: ChoiceRound[] = [
  { prompt: 'Qual não pertence aos animais da arca?', options: [{ id: 'elefante', emoji: '🐘', label: 'Elefante' }, { id: 'leao', emoji: '🦁', label: 'Leão' }, { id: 'carro', emoji: '🚗', label: 'Carro' }], correct: 'carro', ref: 'Gênesis 7.9 (NAA)', msg: 'O carro não é animal! Só bichos entraram na arca. 🚗' },
  { prompt: 'Qual não é um presente dos magos?', options: [{ id: 'ouro', emoji: '🥇', label: 'Ouro' }, { id: 'incenso', emoji: '🕯️', label: 'Incenso' }, { id: 'pizza', emoji: '🍕', label: 'Pizza' }], correct: 'pizza', ref: 'Mateus 2.11 (NAA)', msg: 'Pizza não! Os magos trouxeram ouro, incenso e mirra. 🎁' },
  { prompt: 'Qual não é um personagem da Bíblia?', options: [{ id: 'noe', emoji: '🚢', label: 'Noé' }, { id: 'davi', emoji: '🪨', label: 'Davi' }, { id: 'robo', emoji: '🤖', label: 'Robô' }], correct: 'robo', ref: 'Hebreus 11.1-40 (NAA)', msg: 'O robô não! A Bíblia fala de pessoas de verdade. 🤖' },
  { prompt: 'Qual não é fruto do Espírito?', options: [{ id: 'amor', emoji: '💛', label: 'Amor' }, { id: 'alegria', emoji: '😊', label: 'Alegria' }, { id: 'doce', emoji: '🍬', label: 'Doce' }], correct: 'doce', ref: 'Gálatas 5.22 (NAA)', msg: 'Doce não é fruto do Espírito — mas é gostoso! 🍬' },
  { prompt: 'Qual não ajudou a construir o templo de Salomão?', options: [{ id: 'pedra', emoji: '🧱', label: 'Pedra' }, { id: 'madeira', emoji: '🪵', label: 'Madeira' }, { id: 'sorvete', emoji: '🍦', label: 'Sorvete' }], correct: 'sorvete', ref: '1 Reis 6.1 (NAA)', msg: 'Sorvete não! O templo foi feito de pedra e madeira. 🏗️' },
];

export default function GameQualNaoPertence({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="qual-nao-pertence"
      title="Qual Não Pertence?"
      subtitle="Toque na figura que não combina!"
      bg="bg-gradient-to-b from-fuchsia-100 via-pink-50 to-rose-100"
      titleClass="text-fuchsia-600"
      variant="grid"
      rounds={ROUNDS}
      onExit={onExit}
    />
  );
}
