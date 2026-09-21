import CountGame, { type CountRound } from './CountGame';

// ── Conta na Arca (3–4 anos) — Antigo Testamento ─────────────────────────
// Contagem simples com os animais e sinais da história de Noé.

const ROUNDS: CountRound[] = [
  { id: 'elefantes', emojis: ['🐘', '🐘'], question: 'Quantos elefantes entraram na arca?', options: [1, 2, 3], correct: 2, ref: 'Gênesis 7.9 (NAA)', msg: 'Dois! Os animais entraram de dois em dois. 🐘' },
  { id: 'pomba', emojis: ['🕊️'], question: 'Quantas pombas voltaram com o ramo?', options: [1, 2, 3], correct: 1, ref: 'Gênesis 8.11 (NAA)', msg: 'Uma pomba trouxe o raminho de oliveira! 🕊️' },
  { id: 'ovelhas', emojis: ['🐑', '🐑', '🐑'], question: 'Quantas ovelhas você vê?', options: [2, 3, 4], correct: 3, ref: 'Gênesis 7.9 (NAA)', msg: 'Três ovelhas! Deus cuidou de todas. 🐑' },
  { id: 'arco', emojis: ['🌈'], question: 'Quantos arco-íris Deus colocou no céu?', options: [1, 2, 3], correct: 1, ref: 'Gênesis 9.13 (NAA)', msg: 'Um arco-íris, o sinal da promessa! 🌈' },
  { id: 'total', emojis: ['🐘', '🐘', '🦁', '🦁'], question: 'Quantos animais ao todo?', options: [3, 4, 5], correct: 4, ref: 'Gênesis 7.9 (NAA)', msg: 'Quatro animais! A arca ficou cheia. 🚢' },
];

export default function GameContaNaArca({ onExit }: { onExit: () => void }) {
  return (
    <CountGame
      gameId="conta-na-arca"
      title="Conta na Arca"
      subtitle="Conte e toque no número certo!"
      bg="bg-gradient-to-b from-lime-100 via-emerald-50 to-teal-100"
      titleClass="text-teal-600"
      rounds={ROUNDS}
      onExit={onExit}
    />
  );
}
