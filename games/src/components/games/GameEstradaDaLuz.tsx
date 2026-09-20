import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Cloud, Crown, RotateCcw, Smile, Sparkles, Star, Sun } from 'lucide-react';
import GameShell from '../GameShell';
import { completeGame } from '../../lib/progress';
import { playCorrect, playPop, playWin, playWrong } from '../../lib/sound';

interface GameProps {
  onExit: () => void;
}

interface Question {
  q: string;
  right: string;
  r: string; // emoji da opção certa
  wrong: string;
  w: string; // emoji da opção errada
}

const STEPS = 5;

const QUESTIONS: Question[] = [
  { q: 'Você encontra uma moeda no chão…', right: 'Devolvo ao dono', r: '🙂', wrong: 'Guardo escondido', w: '😜' },
  { q: 'O vaso quebrou sem querer…', right: 'Conto a verdade', r: '💛', wrong: 'Digo que não fui eu', w: '🙈' },
  { q: 'Tem 3 doces e 3 amigos…', right: 'Divido um pra cada', r: '🍬', wrong: 'Pego tudo pra mim', w: '🫣' },
  { q: 'A turma quer deixar um amigo de fora…', right: 'Fico com o amigo', r: '🤝', wrong: 'Vou junto e deixo ele', w: '🏃' },
  { q: 'Quando você conta mentira…', right: 'O coração pesa', r: '💙', wrong: 'Fica leve e feliz', w: '🎈' },
  { q: 'Uma boa escolha brilha como…', right: 'Uma estrela', r: '⭐', wrong: 'Uma pedra', w: '🪨' },
  { q: 'Seu nome está guardado no…', right: 'Livro da Vida', r: '📖', wrong: 'Chão do quarto', w: '🪑' },
  { q: 'Quando você erra, Deus…', right: 'Sempre pronta a perdoar', r: '🥹', wrong: 'Vai embora pra sempre', w: '😢' },
  { q: 'O caminho da luz leva para…', right: 'Perto de Deus', r: '☀️', wrong: 'O vale escuro', w: '🌑' },
  { q: 'A alegria fica maior quando…', right: 'A gente divide', r: '🎉', wrong: 'A gente fica sozinho', w: '🔒' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameEstradaDaLuz({ onExit }: GameProps) {
  const [queue, setQueue] = useState<Question[]>(() => shuffle(QUESTIONS));
  const [step, setStep] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState<{ text: string; good: boolean } | null>(null);
  const recorded = useRef(false);

  useEffect(() => {
    if (won && !recorded.current) {
      recorded.current = true;
      playWin();
      completeGame('estrada-da-luz', winStars());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  function winStars(): number {
    return Math.max(1, 3 - Math.min(2, wrongCount));
  }

  function answer(isRight: boolean) {
    if (won || queue.length === 0) return;

    if (isRight) {
      playCorrect();
      const next = Math.min(STEPS, step + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setMsg({
        good: true,
        text:
          nextStreak >= 4
            ? 'Você está brilhando como estrela! 🌟'
            : nextStreak >= 2
              ? `Caminho certo ×${nextStreak}!`
              : 'Mais perto da luz! ✨',
      });
      if (next === STEPS) {
        setStep(next);
        setWon(true);
        return;
      }
      if (next === 2 || next === 3) playPop();
      setStep(next);
    } else {
      playWrong();
      setWrongCount((c) => c + 1);
      setStreak(0);
      setStep((s) => Math.max(0, s - 1));
      setMsg({
        good: false,
        text: 'Opa… o vale escuro fica mais perto. Mas a luz continua te esperando! 💛',
      });
    }

    // próxima pergunta (reembaralha quando a fila acaba)
    setQueue((q) => {
      const rest = q.slice(1);
      return rest.length > 0 ? rest : shuffle(QUESTIONS);
    });
  }

  const current = queue[0];

  return (
    <GameShell
      title="A Estrada da Luz"
      subtitle="Responda a pergunta e caminhe até a luz!"
      onExit={onExit}
      bg="bg-gradient-to-b from-indigo-950 via-violet-800 to-amber-200"
      titleClass="text-yellow-300"
    >
      {won ? <Confetti recycle={false} numberOfPieces={420} gravity={0.14} /> : null}

      <div aria-live="polite" className="sr-only">
        {won
          ? 'Você chegou à Luz!'
          : msg
            ? msg.text
            : `${step} de ${STEPS} passos em direção à luz`}
      </div>

      <div
        className="pointer-events-none fixed inset-0 bg-slate-950 transition-opacity duration-1000"
        style={{ opacity: wrongCount > 0 ? Math.min(wrongCount * 0.06, 0.35) : 0 }}
      />

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-5 px-4 pb-8">
        {/* ------- trilha ------- */}
        <div className="relative h-60 w-full max-w-2xl">
          {/* vale escuro (cresce a cada erro) */}
          <div className="absolute bottom-2 left-0 flex flex-col items-start gap-1">
            <Cloud className="h-10 w-10 text-slate-700/80 animate-float-slow" />
            <span className="max-w-[130px] rounded-full bg-slate-800/70 px-3 py-1 text-xs font-bold text-slate-300 shadow">
              vale escuro
            </span>
          </div>

          {/* portão de luz */}
          <div className="absolute top-[26%] right-1 flex flex-col items-center">
            <Sun
              className={`h-14 w-14 text-yellow-300 drop-shadow-[0_0_18px_rgba(253,224,71,0.9)] ${
                won ? 'animate-spin' : 'animate-pulse'
              }`}
            />
            <Crown className="-mt-2 h-7 w-7 text-amber-300" />
            <span className="mt-1 rounded-full bg-yellow-300/20 px-3 py-1 text-xs font-bold text-yellow-100">
              A Luz
            </span>
          </div>

          {/* trilha */}
          <div className="absolute top-[52%] left-[4%] right-[4%] h-4 rounded-full bg-gradient-to-r from-slate-700 via-slate-500 to-yellow-300 shadow-lg" />

          {/* marcadores de passo */}
          {[1, 2, 3, 4].map((i) => {
            const reached = i <= step;
            return (
              <span
                key={i}
                className={`absolute top-[46%] flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  reached
                    ? 'scale-110 border-yellow-300 bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,0.9)]'
                    : 'border-slate-500 bg-slate-600/60'
                }`}
                style={{ left: `${(i / STEPS) * 100}%` }}
              >
                {reached ? (
                  <Star className="h-5 w-5 fill-amber-600 text-amber-600" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                )}
              </span>
            );
          })}

          {/* personagem */}
          <div
            className="absolute bottom-[26%] transition-all duration-700 ease-in-out"
            style={{ left: `${(step / STEPS) * 100}%` }}
          >
            <div className="-translate-x-1/2">
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-xl transition-colors duration-700 ${
                  won
                    ? 'animate-bounce border-yellow-200 bg-gradient-to-b from-yellow-300 to-amber-400'
                    : 'border-sky-200 bg-gradient-to-b from-sky-400 to-indigo-500'
                }`}
              >
                <Smile className="h-9 w-9 text-white" />
              </span>
            </div>
          </div>
        </div>

        {/* badges de gamificação */}
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-base font-black text-yellow-200 shadow backdrop-blur-sm">
            Ponto {Math.min(step, STEPS)}/{STEPS}
          </span>
          {streak >= 2 && !won ? (
            <span className="animate-pop rounded-full bg-orange-500/80 px-4 py-1.5 text-sm font-black text-white shadow">
              🔥 {streak} seguidas!
            </span>
          ) : null}
        </div>

        {/* mensagem de feedback */}
        {msg && !won ? (
          <p
            className={`animate-pop max-w-md rounded-3xl px-6 py-3 text-center text-base font-extrabold shadow-lg ${
              msg.good
                ? 'bg-yellow-200/90 text-amber-800'
                : 'bg-slate-800/80 text-slate-100'
            }`}
          >
            {msg.text}
          </p>
        ) : null}

        {/* ------- pergunta + respostas ------- */}
        {!won && current ? (
          <div className="flex w-full max-w-lg flex-col items-center gap-4">
            <p className="rounded-3xl bg-white/95 px-6 py-4 text-center text-xl font-black text-indigo-900 shadow-xl">
              {current.q}
            </p>
            <div className="grid w-full grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => answer(true)}
                className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-lg font-extrabold text-emerald-700 shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <span className="text-3xl">{current.r}</span> {current.right}
              </button>
              <button
                type="button"
                onClick={() => answer(false)}
                className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-600 shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <span className="text-3xl">{current.w}</span> {current.wrong}
              </button>
            </div>
          </div>
        ) : null}

        {/* ------- vitória: chegou à Luz ------- */}
        {won ? (
          <div className="animate-pop flex flex-col items-center gap-4">
            <p className="rounded-3xl bg-white/95 px-8 py-5 text-center text-2xl font-black text-amber-500 shadow-[0_0_30px_rgba(253,224,71,0.8)] sm:text-3xl">
              🏆 Você chegou à Luz! 🏆
              <span className="mt-1 block text-base font-extrabold text-indigo-700">
                Cada passo certo te trouxe pra perto de Deus. E se você errou no caminho?
                <br />
                A luz sempre te espera de volta! 💛
              </span>
            </p>

            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-4 py-1.5 shadow">
              <span className="text-sm font-extrabold text-amber-700">Estrelas do capítulo</span>
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i <= winStars() ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
                  }`}
                />
              ))}
            </span>

            <button
              type="button"
              onClick={() => {
                setQueue(shuffle(QUESTIONS));
                setStep(0);
                setStreak(0);
                setWrongCount(0);
                setWon(false);
                setMsg(null);
                recorded.current = false;
              }}
              className="flex items-center gap-3 rounded-full bg-yellow-400 px-10 py-5 text-2xl font-extrabold text-amber-950 shadow-[0_8px_0_rgba(202,138,4,0.9)] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none sm:text-3xl"
            >
              <RotateCcw className="h-8 w-8" /> Jogar Novamente
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-2 rounded-full bg-white/70 px-6 py-2 text-sm font-bold text-indigo-900 shadow active:scale-95"
            >
              <Sparkles className="h-4 w-4" /> Outros jogos
            </button>
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}