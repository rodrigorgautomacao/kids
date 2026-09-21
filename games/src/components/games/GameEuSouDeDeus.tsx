import ChoiceGame, { type ChoiceRound } from './ChoiceGame';
import { chunkLevels } from '../../lib/levels';

// ── Eu Sou de Deus (3–4 anos) ────────────────────────────────────────────
// Identidade em Deus: quem eu sou aos olhos dele. Linguagem simples, tom de
// graça — a criança descobre que é amada, conhecida e chamada de filha de Deus.
// Todas as opções têm som (🔊) e a resposta certa é narrada ao ser escolhida.

const ROUNDS: ChoiceRound[] = [
  { prompt: 'Quem me ama mais que tudo?', options: [{ id: 'jesus', emoji: '❤️', label: 'Jesus' }, { id: 'brinquedo', emoji: '🧸', label: 'Um brinquedo' }, { id: 'doce', emoji: '🍬', label: 'Um doce' }], correct: 'jesus', ref: '1 João 3.1 (NAA)', msg: 'Deus me ama como um pai ama o filho! ❤️' },
  { prompt: 'Quando eu nasci, quem me fez?', options: [{ id: 'deus', emoji: '🌟', label: 'Deus' }, { id: 'tv', emoji: '📺', label: 'A TV' }, { id: 'carro', emoji: '🚗', label: 'O carro' }], correct: 'deus', ref: 'Salmos 139.13 (NAA)', msg: 'Deus me formou com muito cuidado! 🌟' },
  { prompt: 'Deus me conhece pelo meu…', options: [{ id: 'nome', emoji: '📛', label: 'Nome' }, { id: 'sapato', emoji: '👟', label: 'Sapato' }, { id: 'brinquedo', emoji: '🧸', label: 'Brinquedo' }], correct: 'nome', ref: 'Isaías 43.1 (NAA)', msg: 'Deus me chama pelo meu nome! 📛' },
  { prompt: 'Eu sou muito especial porque…', options: [{ id: 'criou', emoji: '💛', label: 'Deus me criou' }, { id: 'brinquedos', emoji: '🎁', label: 'Tenho brinquedos' }, { id: 'alto', emoji: '📏', label: 'Sou alto' }], correct: 'criou', ref: 'Salmos 139.14 (NAA)', msg: 'Deus me fez de um jeito maravilhoso! 💛' },
  { prompt: 'O que Deus quer que eu seja?', options: [{ id: 'filho', emoji: '👶', label: 'Filho dele' }, { id: 'melhor', emoji: '🥇', label: 'O melhor' }, { id: 'forte', emoji: '💪', label: 'O mais forte' }], correct: 'filho', ref: 'João 1.12 (NAA)', msg: 'Eu sou filho de Deus! Que presente! 👶' },
  { prompt: 'Quem está sempre comigo?', options: [{ id: 'deus', emoji: '🙏', label: 'Deus' }, { id: 'papagaio', emoji: '🦜', label: 'O papagaio' }, { id: 'robo', emoji: '🤖', label: 'O robô' }], correct: 'deus', ref: 'Mateus 28.20 (NAA)', msg: 'Deus nunca me deixa sozinho! 🙏' },
  { prompt: 'Deus me deu um coração para…', options: [{ id: 'amar', emoji: '💛', label: 'Amar' }, { id: 'brigar', emoji: '😠', label: 'Brigar' }, { id: 'gritar', emoji: '📢', label: 'Gritar' }], correct: 'amar', ref: 'Marcos 12.31 (NAA)', msg: 'Meu coração foi feito para amar! 💛' },
  { prompt: 'Quando eu oro, quem me ouve?', options: [{ id: 'deus', emoji: '👂', label: 'Deus' }, { id: 'parede', emoji: '🧱', label: 'A parede' }, { id: 'gato', emoji: '🐱', label: 'O gato' }], correct: 'deus', ref: 'Salmos 34.15 (NAA)', msg: 'Deus escuta a minha oração! 👂' },
  { prompt: 'Eu posso falar com Deus…', options: [{ id: 'sempre', emoji: '🕐', label: 'Sempre' }, { id: 'noite', emoji: '🌙', label: 'Só de noite' }, { id: 'nunca', emoji: '🙈', label: 'Nunca' }], correct: 'sempre', ref: '1 Tessalonicenses 5.17 (NAA)', msg: 'Posso falar com Deus a qualquer hora! 🕐' },
  { prompt: 'Deus quer que eu trate os outros com…', options: [{ id: 'amor', emoji: '💕', label: 'Amor' }, { id: 'raiva', emoji: '😠', label: 'Raiva' }, { id: 'medo', emoji: '😨', label: 'Medo' }], correct: 'amor', ref: 'João 13.34 (NAA)', msg: 'Amar como Jesus ama — esse é o jeito dele! 💕' },
];

const LEVELS = chunkLevels(ROUNDS, 2);

export default function GameEuSouDeDeus({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="eu-sou-de-deus"
      title="Eu Sou de Deus"
      subtitle="Quem eu sou aos olhos de Deus?"
      bg="bg-gradient-to-b from-rose-100 via-amber-50 to-yellow-100"
      titleClass="text-rose-600"
      variant="grid"
      levels={LEVELS}
      onExit={onExit}
    />
  );
}
