import { useRef, useState } from 'react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import ForgivenessCard from '../ForgivenessCard';
import { completeLevel, loadLevels, nextUnfinishedLevel } from '../../lib/progress';
import { playCorrect, playWin, playWrong } from '../../lib/sound';
import type { StoryScenario } from '../../data/stories';

interface StoryGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  /** Exatamente 10 cenas (1 por nível) */
  scenarios: StoryScenario[];
  /** Fala de encerramento do capítulo */
  chapterLesson: string;
  onExit: () => void;
}

type Phase = 'story' | 'good' | 'bad';

/**
 * Jogo de leitura por níveis: 10 historinhas, em cada uma o jogador
 * lê a cena e escolhe a atitude certa (ou erra e recomeça o nível).
 */
export default function StoryGame({
  gameId,
  title,
  subtitle,
  bg,
  titleClass,
  scenarios,
  chapterLesson,
  onExit,
}: StoryGameProps) {
  const [level, setLevel] = useState(() =>
    nextUnfinishedLevel(loadLevels(), gameId, scenarios.length),
  );
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<Phase>('story');
  const recorded = useRef<Set<number>>(new Set());

  const totalLevels = scenarios.length;
  const scenario = scenarios[level - 1];
  const isLast = level === totalLevels;

  function starsFrom(attemptsCount: number): number {
    return attemptsCount === 0 ? 3 : attemptsCount === 1 ? 2 : 1;
  }

  function retryLevel() {
    setPhase('story');
  }

  function chooseGood() {
    playCorrect();
    const stars = starsFrom(attempts);
    if (!recorded.current.has(level)) {
      recorded.current.add(level);
      completeLevel(gameId, level, stars);
      if (isLast) playWin();
    }
    setPhase('good');
  }

  function chooseBad() {
    playWrong();
    setAttempts((a) => a + 1);
    setPhase('bad');
  }

  function nextLevel() {
    setLevel((l) => l + 1);
    setAttempts(0);
    setPhase('story');
  }

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-1 flex-col items-center gap-5 px-4 pb-8">
        <LevelHUD level={level} totalLevels={totalLevels} />

        {/* ------- cena ------- */}
        <div className="flex w-full max-w-lg flex-col items-center gap-3">
          <span className="rounded-full bg-white/20 px-4 py-1 text-xs font-black tracking-widest text-white shadow backdrop-blur-sm uppercase">
            Capítulo · Nível {level} · {scenario.title}
          </span>

          {phase === 'story' ? (
            <div className="w-full rounded-3xl bg-white/95 px-6 py-5 text-center shadow-xl">
              <p className="text-lg leading-relaxed font-bold text-slate-700 sm:text-xl">
                {scenario.story}
              </p>
            </div>
          ) : null}

          {phase === 'good' ? (
            <p className="animate-pop w-full rounded-3xl bg-emerald-100 px-6 py-5 text-center text-lg font-extrabold text-emerald-700 shadow-lg sm:text-xl">
              💚 {scenario.goodOutcome}
            </p>
          ) : null}

          {phase === 'bad' ? (
            <p className="animate-pop w-full rounded-3xl bg-slate-100 px-6 py-5 text-center text-lg font-extrabold text-slate-600 shadow-lg sm:text-xl">
              💔 {scenario.badOutcome}
            </p>
          ) : null}
        </div>

        {/* ------- decisão ------- */}
        {phase === 'story' ? (
          <div className="grid w-full max-w-lg grid-cols-2 gap-4">
            <button
              type="button"
              onClick={chooseGood}
              className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-3xl border-4 border-emerald-300 bg-emerald-50 px-4 py-4 text-lg font-black text-emerald-700 shadow-md transition-transform hover:scale-105 active:scale-95 sm:text-xl"
            >
              <span className="text-5xl">{scenario.goodEmoji}</span>
              {scenario.good}
            </button>
            <button
              type="button"
              onClick={chooseBad}
              className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-slate-200 bg-white px-4 py-4 text-lg font-bold text-slate-600 shadow-md transition-transform hover:scale-105 active:scale-95 sm:text-xl"
            >
              <span className="text-5xl">{scenario.badEmoji}</span>
              {scenario.bad}
            </button>
          </div>
        ) : null}

        {/* ------- consequência da escolha certa ------- */}
        {phase === 'good' ? (
          <LevelDone
            stars={starsFrom(attempts)}
            onNext={isLast ? undefined : nextLevel}
            onExit={onExit}
            headline={isLast ? undefined : 'Nível concluído!'}
            lesson={isLast ? chapterLesson : undefined}
          />
        ) : null}

        {/* ------- consequência da escolha errada ------- */}
        {phase === 'bad' ? (
          <ForgivenessCard onForgive={retryLevel} onExit={onExit} />
        ) : null}
      </div>
    </GameShell>
  );
}