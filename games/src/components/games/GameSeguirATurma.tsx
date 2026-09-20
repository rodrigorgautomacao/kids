import StoryGame from './StoryGame';
import { TURMA_SCENARIOS } from '../../data/stories';

interface GameProps {
  onExit: () => void;
}

/** Capítulo "Seguir a Turma" — 10 historinhas de inclusão. */
export default function GameSeguirATurma({ onExit }: GameProps) {
  return (
    <StoryGame
      gameId="seguir-a-turma"
      title="Seguir a Turma"
      subtitle="10 níveis · Quando incluir é maior que seguir!"
      onExit={onExit}
      bg="bg-gradient-to-b from-violet-100 via-fuchsia-50 to-indigo-100"
      titleClass="text-violet-700"
      scenarios={TURMA_SCENARIOS}
      chapterLesson="Cada amigo importa! Quem inclui e cuida obedece a Deus. 💜"
    />
  );
}