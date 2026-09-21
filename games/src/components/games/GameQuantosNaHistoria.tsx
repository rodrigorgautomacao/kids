import CountGame, { type CountRound } from './CountGame';
import { chunkLevels } from '../../lib/levels';

// ── Quantos na História? (5–6 anos) — Antigo Testamento ──────────────────
// Probleminhas de somar/subtrair com os números das histórias.

const ROUNDS: CountRound[] = [
  { id: 'animais', emojis: ['🐘', '🐘', '🦁', '🦁'], question: 'Noé levou 2 elefantes e 2 leoas. Quantos animais?', options: [3, 4, 5], correct: 4, ref: 'Gênesis 7.9 (NAA)', msg: 'Quatro animais! Dois de cada. 🐘🦁' },
  { id: 'rebanho', emojis: ['🐑', '🐑', '🐑', '🐑', '🐑'], question: 'Moisés tinha 3 ovelhas e ganhou mais 2. Quantas ficou?', options: [4, 5, 6], correct: 5, ref: 'Êxodo 3.1 (NAA)', msg: 'Cinco ovelhas! Moisés cuidava do rebanho. 🐑' },
  { id: 'pedras', emojis: ['🪨', '🪨', '🪨', '🪨', '🪨'], question: 'Davi escolheu 5 pedras e usou 1. Quantas sobraram?', options: [3, 4, 5], correct: 4, ref: '1 Samuel 17.40 (NAA)', msg: 'Quatro pedrinhas sobraram! 🪨' },
  { id: 'corvos', emojis: ['🐦', '🐦', '🐦', '🐦'], question: 'Elias viu 2 corvos e mais 2 corvos. Quantos corvos?', options: [3, 4, 5], correct: 4, ref: '1 Reis 17.6 (NAA)', msg: 'Quatro corvos trouxeram comida! 🐦' },
  { id: 'presentes', emojis: ['🎁', '🎁', '🎁'], question: 'Os magos trouxeram ouro, incenso e mirra. Quantos presentes?', options: [2, 3, 4], correct: 3, ref: 'Mateus 2.11 (NAA)', msg: 'Três presentes para o menino Jesus! 🎁' },
];

export default function GameQuantosNaHistoria({ onExit }: { onExit: () => void }) {
  return (
    <CountGame
      gameId="quantos-na-historia"
      title="Quantos na História?"
      subtitle="Resolva e toque no número certo!"
      bg="bg-gradient-to-b from-teal-100 via-emerald-50 to-lime-100"
      titleClass="text-teal-600"
      levels={chunkLevels(ROUNDS, 1)}
      onExit={onExit}
    />
  );
}
