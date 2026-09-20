import StoryGame from './StoryGame';
import { MOEDA_SCENARIOS } from '../../data/stories';

interface GameProps {
  onExit: () => void;
}

/** Capítulo "A Moeda no Chão" — 10 historinhas de honestidade. */
export default function GameMoedaNoChao({ onExit }: GameProps) {
  return (
    <StoryGame
      gameId="moeda-no-chao"
      title="A Moeda no Chão"
      subtitle="10 níveis · Leia a história e escolha o caminho certo!"
      onExit={onExit}
      bg="bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100"
      titleClass="text-sky-700"
      scenarios={MOEDA_SCENARIOS}
      chapterLesson="Quem devolve e fala a verdade carrega a consciência leve e a recompensa do céu! 💛"
    />
  );
}