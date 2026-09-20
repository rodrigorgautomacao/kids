import { useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Candy } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { completeLevel, loadLevels, nextUnfinishedLevel } from '../../lib/progress';
import { playCorrect, playWin, playWrong } from '../../lib/sound';

interface GameProps {
  onExit: () => void;
}

interface Question {
  prompt: string;
  candies?: string;
  options: string[];
  answer: string;
}

const TOTAL_LEVELS = 10;
const QUESTIONS_PER_LEVEL = 3;

function ri(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function divisionQuestion(
  level: number,
): Question {
  const withRemainder = level >= 6 && level <= 9;
  const d = level === 1 ? 2 : level === 2 ? ri(2, 3) : level === 3 ? ri(4, 5) : ri(2, 6);
  const factor =
    level <= 3 ? ri(2, 4) : level <= 7 ? ri(3, 6) : level <= 9 ? ri(4, 7) : ri(5, 8);
  const q = factor;
  const extra = withRemainder ? ri(1, d - 1) : 0;
  const n = q * d + extra;

  const peopleWord = level === 8 || level === 10 ? 'grupos' : 'amigos';
  const answer =
    extra > 0 ? `${q} e sobram ${extra}` : withRemainder ? `${q} e sobram ${extra}` : String(q);

  const prompt =
    level === 8 || level === 10
      ? `${n} brigadeiros para dividir igual com ${d} ${peopleWord}: quantos cada e quanto sobra?`
      : `${n} 🍬 divididos igualmente entre ${d} ${peopleWord}: quantos cada${
          withRemainder ? ' e quanto sobra?' : '?'
        }`;

  // opções próximas da resposta (quantidade e sobra)
  const opts = new Set<string>([answer]);
  while (opts.size < 4) {
    const dq = ri(1, 2);
    const dr = withRemainder ? ri(0, d - 1) : 0;
    const opt = dr > 0 ? `${q + dq} e sobram ${dr}` : String(q + dq);
    opts.add(opt);
  }

  return {
    prompt,
    candies: n <= 14 ? '🍬'.repeat(n) : undefined,
    options: shuffle([...opts]),
    answer,
  };
}

export default function GameSoMaisUmPedaco({ onExit }: GameProps) {
  const [level, setLevel] = useState(() =>
    nextUnfinishedLevel(loadLevels(), 'so-mais-um-pedaco', TOTAL_LEVELS),
  );
  const [q, setQ] = useState<Question>(() => divisionQuestion(1));
  const [qIndex, setQIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [shake, setShake] = useState(false);
  const [finished, setFinished] = useState(false);
  const recorded = useRef<Set<number>>(new Set());

  const isLast = level === TOTAL_LEVELS;

  function starsFrom(errCount: number): number {
    return errCount === 0 ? 3 : errCount <= 2 ? 2 : 1;
  }

  function pick(option: string) {
    if (finished) return;
    if (option === q.answer) {
      playCorrect();
      const nextQ = qIndex + 1;
      if (nextQ >= QUESTIONS_PER_LEVEL) {
        finishLevel();
        return;
      }
      setQIndex(nextQ);
      setQ(divisionQuestion(level));
    } else {
      playWrong();
      setErrors((e) => e + 1);
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
    }
  }

  function finishLevel() {
    const stars = starsFrom(errors);
    if (!recorded.current.has(level)) {
      recorded.current.add(level);
      completeLevel('so-mais-um-pedaco', level, stars);
      if (isLast) playWin();
    }
    setFinished(true);
  }

  function nextLevel() {
    const l = level + 1;
    setLevel(l);
    setQIndex(0);
    setErrors(0);
    setFinished(false);
    setQ(divisionQuestion(l));
  }

  return (
    <GameShell
      title="Só Mais um Pedaço"
      subtitle="10 níveis · Divida os doces certinhos para todo mundo!"
      onExit={onExit}
      bg="bg-gradient-to-b from-pink-100 via-rose-50 to-amber-100"
      titleClass="text-rose-600"
    >
      {finished ? <Confetti recycle={false} numberOfPieces={220} gravity={0.16} /> : null}

      <div aria-live="polite" className="sr-only">
        {finished
          ? 'Nível concluído!'
          : `Pergunta ${qIndex + 1} de ${QUESTIONS_PER_LEVEL}`}
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center gap-5 px-4 pb-8">
        <LevelHUD level={level} totalLevels={TOTAL_LEVELS} />

        {/* pergunta */}
        <div
          className={`flex w-full max-w-lg flex-col items-center gap-3 rounded-3xl bg-white/90 px-6 py-5 text-center shadow-xl ${shake ? 'animate-shake' : ''}`}
        >
          <span className="text-sm font-black tracking-widest text-rose-500/80 uppercase">
            Pergunta {qIndex + 1}/{QUESTIONS_PER_LEVEL}
          </span>
          <p className="text-xl font-black text-slate-800 sm:text-2xl">{q.prompt}</p>
          {q.candies ? (
            <p className="flex max-w-full flex-wrap justify-center gap-1 text-2xl leading-relaxed">
              {q.candies}
            </p>
          ) : null}
        </div>

        {/* opções */}
        <div className="grid w-full max-w-lg grid-cols-2 gap-3">
          {q.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => pick(opt)}
              disabled={finished}
              className="flex h-20 items-center justify-center rounded-2xl border-2 border-rose-300 bg-white px-3 text-xl font-black text-rose-600 shadow-md transition-transform hover:scale-105 active:scale-95 sm:text-2xl"
            >
              {opt}
            </button>
          ))}
        </div>

        {/* placar de erros */}
        <span
          className={`rounded-full px-5 py-1.5 text-sm font-black shadow ${
            errors === 0
              ? 'bg-emerald-400 text-emerald-950'
              : 'bg-rose-500 text-white'
          }`}
        >
          {errors === 0 ? '✨ Divisão perfeita!' : `💥 ${errors} erro${errors > 1 ? 's' : ''} neste nível`}
        </span>

        <span className="flex items-center gap-1 text-xs font-bold text-rose-600/60">
          <Candy className="h-4 w-4 text-rose-400" /> dividir igual agrada a Deus e dobra a alegria
        </span>

        {/* conclusão */}
        {finished ? (
          <div className="-mt-2 flex flex-col items-center">
            <LevelDone
              stars={starsFrom(errors)}
              onNext={isLast ? undefined : nextLevel}
              onExit={onExit}
              lesson={
                isLast
                  ? 'Quem divide com justiça enche o céu de estrelas e o coração de alegria! 🍬'
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}