import StoryGame from './StoryGame';
import { MENTIRA_SCENARIOS } from '../../data/stories';

interface GameProps {
  onExit: () => void;
}

/** Capítulo "A Mentirinha que Cresce" — 10 historinhas de verdade. */
export default function GameMentirinhaQueCresce({ onExit }: GameProps) {
  return (
    <StoryGame
      gameId="mentirinha-que-cresce"
      title="A Mentirinha que Cresce"
      subtitle="10 níveis · A verdade liberta, a mentira pesa!"
      onExit={onExit}
      bg="bg-gradient-to-b from-slate-100 via-indigo-50 to-indigo-100"
      titleClass="text-indigo-700"
      scenarios={MENTIRA_SCENARIOS}
      chapterLesson="A verdade desata qualquer nó do coração! Deus sempre acolhe quem volta. 💛"
    />
  );
}