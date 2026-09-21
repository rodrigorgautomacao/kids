import ChoiceGame, { type ChoiceRound } from './ChoiceGame';
import { chunkLevels } from '../../lib/levels';

// ── Quem Falou? (7–9 anos) — Novo Testamento ─────────────────────────────
// A criança lê uma frase e descobre quem a disse.

const ROUNDS: ChoiceRound[] = [
  { prompt: 'Quem disse esta frase?', detail: 'Deixem vir a mim as crianças.', options: [{ id: 'jesus', emoji: '🕊️', label: 'Jesus' }, { id: 'moises', emoji: '📜', label: 'Moisés' }, { id: 'davi', emoji: '🎼', label: 'Davi' }], correct: 'jesus', ref: 'Marcos 10.14 (NAA)', msg: 'Jesus! Ele sempre acolheu as crianças. 🕊️' },
  { prompt: 'Quem disse esta frase?', detail: 'Não tenham medo! Deus vai nos salvar.', options: [{ id: 'paulo', emoji: '✉️', label: 'Paulo' }, { id: 'pedro', emoji: '🎣', label: 'Pedro' }, { id: 'jonas', emoji: '🐳', label: 'Jonas' }], correct: 'paulo', ref: 'Atos 27.25 (NAA)', msg: 'Paulo, no meio da tempestade! ⛵' },
  { prompt: 'Quem disse esta frase?', detail: 'Eu sou o caminho, a verdade e a vida.', options: [{ id: 'jesus', emoji: '🕊️', label: 'Jesus' }, { id: 'joao', emoji: '📖', label: 'João' }, { id: 'salomao', emoji: '🦉', label: 'Salomão' }], correct: 'jesus', ref: 'João 14.6 (NAA)', msg: 'Jesus! Ele é o caminho para Deus. 🕊️' },
  { prompt: 'Quem disse esta frase?', detail: 'Hoje nasceu o Salvador!', options: [{ id: 'anjo', emoji: '👼', label: 'O anjo' }, { id: 'maria', emoji: '👩', label: 'Maria' }, { id: 'jose', emoji: '🧔', label: 'José' }], correct: 'anjo', ref: 'Lucas 2.11 (NAA)', msg: 'O anjo anunciou aos pastores! 👼' },
  { prompt: 'Quem disse esta frase?', detail: 'Não tenha medo, Maria!', options: [{ id: 'gabriel', emoji: '👼', label: 'O anjo Gabriel' }, { id: 'paulo', emoji: '✉️', label: 'Paulo' }, { id: 'pedro', emoji: '🎣', label: 'Pedro' }], correct: 'gabriel', ref: 'Lucas 1.30 (NAA)', msg: 'O anjo Gabriel, que trouxe a boa notícia! 👼' },
  { prompt: 'Quem disse esta frase?', detail: 'Alegrem-se sempre no Senhor!', options: [{ id: 'paulo', emoji: '✉️', label: 'Paulo' }, { id: 'jesus', emoji: '🕊️', label: 'Jesus' }, { id: 'joao', emoji: '📖', label: 'João' }], correct: 'paulo', ref: 'Filipenses 4.4 (NAA)', msg: 'Paulo, escrevendo aos amigos! ✉️' },
];

export default function GameQuemFalou({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="quem-falou"
      title="Quem Falou?"
      subtitle="Leia a frase e escolha quem disse!"
      bg="bg-gradient-to-b from-sky-100 via-blue-50 to-indigo-100"
      titleClass="text-sky-600"
      variant="quote"
      levels={chunkLevels(ROUNDS, 1)}
      onExit={onExit}
    />
  );
}
