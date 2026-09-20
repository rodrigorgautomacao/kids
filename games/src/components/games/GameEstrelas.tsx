import { useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Star } from 'lucide-react';
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
  stars?: string; // fileira de estrelas visual (contagem)
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

function numericQuestion(prompt: string, answer: number, spread = 4): Question {
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const d = ri(1, spread);
    opts.add(answer + (Math.random() < 0.5 ? -d : d));
  }
  const options = shuffle([...opts]).map(String);
  return { prompt, options, answer: String(answer) };
}

function makeQuestion(level: number): Question {
  switch (level) {
    case 1: {
      // contagem
      const n = ri(6, 12);
      const base = numericQuestion('', n, 3);
      return {
        prompt: 'Conte as estrelas 👇',
        stars: '⭐'.repeat(n),
        options: base.options,
        answer: base.answer,
      };
    }
    case 2: {
      const a = ri(2, 7);
      const b = ri(2, 8 - Math.min(a, 3));
      return numericQuestion(`${a} + ${b} = ?`, a + b);
    }
    case 3: {
      const a = ri(8, 12);
      const b = ri(4, 9);
      return numericQuestion(`${a} + ${b} = ?`, a + b);
    }
    case 4: {
      const a = ri(8, 14);
      const b = ri(2, a - 3);
      return numericQuestion(`${a} − ${b} = ?`, a - b);
    }
    case 5: {
      const a = ri(8, 15);
      const b = ri(4, 8);
      return Math.random() < 0.5
        ? numericQuestion(`${a} + ${b} = ?`, a + b)
        : numericQuestion(`${a} − ${b} = ?`, a - b);
    }
    case 6: {
      const a = ri(2, 6);
      const b = ri(2, 6);
      const c = ri(2, 6);
      return numericQuestion(`${a} + ${b} + ${c} = ?`, a + b + c);
    }
    case 7: {
      const b = ri(3, 9);
      const ans = ri(4, 12);
      return numericQuestion(`? + ${b} = ${ans + b}`, ans);
    }
    case 8: {
      const a1 = ri(3, 9);
      const b1 = ri(3, 9);
      const a2 = ri(3, 9);
      const b2 = ri(3, 9);
      const left = a1 + b1;
      const right = a2 + b2;
      const opts = ['A é maior', 'B é maior', 'São iguais'];
      return {
        prompt: `Qual é maior? A = ${a1}+${b1} · B = ${a2}+${b2}`,
        options: shuffle(opts),
        answer: left > right ? 'A é maior' : left < right ? 'B é maior' : 'São iguais',
      };
    }
    case 9: {
      const a = ri(6, 10);
      const b = ri(4, 9);
      const c = ri(2, 8);
      return Math.random() < 0.5
        ? numericQuestion(`${a} + ${b} − ${c} = ?`, a + b - c)
        : numericQuestion(`${a} − ${b} + ${c} = ?`, a - b + c);
    }
    default: {
      // problema com contexto (nível 10)
      const had = ri(8, 15);
      const won = ri(5, 12);
      return numericQuestion(
        `Você tinha ${had} ⭐ e Deus te abençoou com mais ${won}. Quantas tem agora?`,
        had + won,
        5,
      );
    }
  }
}

export default function GameEstrelas({ onExit }: GameProps) {
  const [level, setLevel] = useState(() =>
    nextUnfinishedLevel(loadLevels(), 'conte-as-estrelas', TOTAL_LEVELS),
  );
  const [q, setQ] = useState<Question>(() => makeQuestion(1));
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
      setQ(makeQuestion(level));
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
      completeLevel('conte-as-estrelas', level, stars);
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
    setQ(makeQuestion(l));
  }

  return (
    <GameShell
      title="Conte as Estrelas"
      subtitle="10 níveis · Resolva a conta e ganhe estrelas!"
      onExit={onExit}
      bg="bg-gradient-to-b from-[#0b1029] via-[#1e1b4b] to-[#312e81]"
      titleClass="text-yellow-300"
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
          className={`flex w-full max-w-lg flex-col items-center gap-3 rounded-3xl bg-white/10 px-6 py-5 text-center shadow-xl backdrop-blur-sm ${shake ? 'animate-shake' : ''}`}
        >
          <span className="text-sm font-black tracking-widest text-yellow-200/80 uppercase">
            Pergunta {qIndex + 1}/{QUESTIONS_PER_LEVEL}
          </span>
          <p className="text-2xl font-black text-white sm:text-3xl">
            {level === 1 ? 'Conte as estrelas 👇' : q.prompt}
          </p>
          {q.stars ? (
            <p className="flex max-w-full flex-wrap justify-center gap-1 text-3xl leading-relaxed">
              {q.stars}
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
              className="flex h-20 items-center justify-center rounded-2xl border-2 border-yellow-300/50 bg-white/95 px-3 text-2xl font-black text-indigo-900 shadow-md transition-transform hover:scale-105 active:scale-95"
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
          {errors === 0 ? '✨ Zero erros!' : `💥 ${errors} erro${errors > 1 ? 's' : ''} neste nível`}
        </span>

        <span className="flex items-center gap-1 text-xs font-bold text-white/50">
          <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" /> cada conta certa é uma estrela no céu
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
                  ? 'Deus prometeu estrelas como a areia do mar: cada boa escolha acende uma! ⭐'
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}