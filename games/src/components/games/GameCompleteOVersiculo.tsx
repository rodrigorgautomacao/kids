import ChoiceGame, { type ChoiceRound } from './ChoiceGame';

// ── Complete o Versículo (7–9 anos) ──────────────────────────────────────
// Desafio de leitura: a criança escolhe a palavra que completa o versículo.
// O texto usa "___" como lacuna; a referência aparece depois do acerto.

const ROUNDS: ChoiceRound[] = [
  { prompt: 'Qual palavra completa o versículo?', detail: 'Lâmpada para os meus pés é a tua ___.', options: [{ id: 'palavra', label: 'palavra' }, { id: 'casa', label: 'casa' }, { id: 'luz', label: 'luz' }], correct: 'palavra', ref: 'Salmos 119.105 (NAA)', msg: 'A tua palavra! Ela guia os nossos passos. 📖' },
  { prompt: 'Qual palavra completa o versículo?', detail: 'O Senhor é o meu pastor; nada me ___.', options: [{ id: 'faltara', label: 'faltará' }, { id: 'sobrara', label: 'sobrará' }, { id: 'passara', label: 'passará' }], correct: 'faltara', ref: 'Salmos 23.1 (NAA)', msg: 'Nada me faltará! Deus cuida de nós. 🐑' },
  { prompt: 'Qual palavra completa o versículo?', detail: 'Deus é ___, e não há outro.', options: [{ id: 'amor', label: 'amor' }, { id: 'fogo', label: 'fogo' }, { id: 'vento', label: 'vento' }], correct: 'amor', ref: '1 João 4.8 (NAA)', msg: 'Deus é amor! 💛' },
  { prompt: 'Qual palavra completa o versículo?', detail: 'Bem-aventurados os que têm fome e sede de ___.', options: [{ id: 'justica', label: 'justiça' }, { id: 'comida', label: 'comida' }, { id: 'agua', label: 'água' }], correct: 'justica', ref: 'Mateus 5.6 (NAA)', msg: 'De justiça! Jesus ensinou no Sermão do Monte. ⛰️' },
  { prompt: 'Qual palavra completa o versículo?', detail: 'Eu sou o bom ___.', options: [{ id: 'pastor', label: 'pastor' }, { id: 'rei', label: 'rei' }, { id: 'mestre', label: 'mestre' }], correct: 'pastor', ref: 'João 10.11 (NAA)', msg: 'O bom pastor dá a vida pelas ovelhas. 🐑' },
  { prompt: 'Qual palavra completa o versículo?', detail: 'No princípio, Deus criou os ___ e a terra.', options: [{ id: 'ceus', label: 'céus' }, { id: 'mares', label: 'mares' }, { id: 'montes', label: 'montes' }], correct: 'ceus', ref: 'Gênesis 1.1 (NAA)', msg: 'Os céus e a terra! Deus é o Criador. 🌍' },
];

export default function GameCompleteOVersiculo({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="complete-o-versiculo"
      title="Complete o Versículo"
      subtitle="Escolha a palavra que falta!"
      bg="bg-gradient-to-b from-violet-100 via-indigo-50 to-blue-100"
      titleClass="text-violet-600"
      variant="verse"
      rounds={ROUNDS}
      onExit={onExit}
    />
  );
}
