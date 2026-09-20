import { useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Crown, Flame, Smile, Sparkles, Star, Sun } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { completeLevel, loadLevels, nextUnfinishedLevel } from '../../lib/progress';
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
const TOTAL_TRECHOS = 3;
const QUESTIONS_PER_TRECHO = 10;

// 30 perguntas da lição: 3 trechos × 10
const QUESTIONS: Question[] = [
  { q: 'Você encontra uma moeda no chão…', right: 'Devolvo ao dono', r: '🙂', wrong: 'Guardo escondido', w: '😜' },
  { q: 'O vaso quebrou sem querer…', right: 'Conto a verdade', r: '💛', wrong: 'Digo que não fui eu', w: '🙈' },
  { q: 'Tem 3 doces e 3 amigos…', right: 'Divido um pra cada', r: '🍬', wrong: 'Pego tudo pra mim', w: '🫣' },
  { q: 'A turma quer deixar um amigo de fora…', right: 'Fico com o amigo', r: '🤝', wrong: 'Vou junto e deixo ele', w: '🏃' },
  { q: 'Quando você conta mentira…', right: 'O coração pesa', r: '💙', wrong: 'Fica leve e feliz', w: '🎈' },
  { q: 'Uma boa escolha brilha como…', right: 'Uma estrela', r: '⭐', wrong: 'Uma pedra', w: '🪨' },
  { q: 'Seu nome está guardado no…', right: 'Livro da Vida', r: '📖', wrong: 'Chão do quarto', w: '🪑' },
  { q: 'Quando você erra, Deus…', right: 'Sempre pronto a perdoar', r: '🥹', wrong: 'Vai embora pra sempre', w: '😢' },
  { q: 'O caminho da luz leva para…', right: 'Perto de Deus', r: '☀️', wrong: 'O fogo do inferno', w: '🔥' },
  { q: 'A alegria fica maior quando…', right: 'A gente divide', r: '🎉', wrong: 'Fica sozinho', w: '🔒' },
  { q: 'O moço te deu troco a mais…', right: 'Devolvo o troco', r: '💵', wrong: 'Guardar e sair', w: '🏃' },
  { q: 'Você acha uma carteira no parque…', right: 'Entrego a um adulto', r: '👮', wrong: 'Escondo para mim', w: '🥷' },
  { q: 'Nota de 50 no chão do mercado…', right: 'Entrego no caixa', r: '💛', wrong: 'Pego rápido', w: '🫥' },
  { q: 'O vendedor te deu um doce a mais…', right: 'Devolvo o doce', r: '🍭', wrong: 'Como e fico quieto', w: '🤫' },
  { q: 'Contar a verdade deixa Deus…', right: 'Feliz!', r: '😄', wrong: 'Triste e longe', w: '😞' },
  { q: 'Quem é digno de confiança?', right: 'Quem diz a verdade', r: '🫶', wrong: 'Quem engana', w: '🎭' },
  { q: 'A mentirinha de todo dia…', right: 'Cresce e pesa', r: '🌱', wrong: 'Desaparece sozinha', w: '🪄' },
  { q: 'O que é tesouro no céu?', right: 'As boas ações', r: '🏆', wrong: 'O dinheiro escondido', w: '💰' },
  { q: 'Quem você deve amar?', right: 'Todos, até quem erra', r: '💕', wrong: 'Só quem é igual a você', w: '🚫' },
  { q: 'Um colega novo chegou na escola…', right: 'Chamo para brincar', r: '🫂', wrong: 'Deixo ele de fora', w: '🙄' },
  { q: 'O menorzinho quer jogar com vocês…', right: 'Deixo ele jogar', r: '🤗', wrong: 'Digo que não alcança', w: '😤' },
  { q: 'A turma ri de um colega…', right: 'Defendo o colega', r: '🛡️', wrong: 'Rio junto', w: '🤭' },
  { q: 'Perdoar quem te magoou…', right: 'É obedecer a Deus', r: '🕊️', wrong: 'É ser fraco', w: '💪' },
  { q: 'Deus prometeu recompensa…', right: 'Eterna, junto dele', r: '👑', wrong: 'Só de brinquedo', w: '🎁' },
  { q: 'O coração que pede perdão…', right: 'Fica leve de novo', r: '🕊️', wrong: 'Vira pedra', w: '🪨' },
  { q: 'Quem faz o bem sem esperar nada…', right: 'Recebe a bênção de Deus', r: '🌈', wrong: 'Perde tempo', w: '⏳' },
  { q: 'A maior lição de Jesus foi…', right: 'Amar uns aos outros', r: '❤️', wrong: 'Ganhar sempre', w: '🥇' },
  { q: 'Seu amigo confiou um segredo…', right: 'Você guarda também', r: '🤐', wrong: 'Conta para a turma', w: '🗣️' },
  { q: 'Você quebrou algo sem querer…', right: 'Assumo na hora', r: '🙋', wrong: 'Culpo o irmãozinho', w: '😈' },
  { q: 'O final da Estrada da Luz é…', right: 'Estar com Deus para sempre', r: '🌟', wrong: 'Caminhar sem fim', w: '🌀' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pathOf(trecho: number): Question[] {
  return QUESTIONS.slice((trecho - 1) * QUESTIONS_PER_TRECHO, trecho * QUESTIONS_PER_TRECHO);
}

export default function GameEstradaDaLuz({ onExit }: GameProps) {
  const [trecho, setTrecho] = useState(() =>
    nextUnfinishedLevel(loadLevels(), 'estrada-da-luz', TOTAL_TRECHOS),
  );
  const [queue, setQueue] = useState<Question[]>(() => shuffle(pathOf(1)));
  const [step, setStep] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState<{ text: string; good: boolean } | null>(null);
  const recorded = useRef<Set<number>>(new Set());

  const isLast = trecho === TOTAL_TRECHOS;

  function starsFrom(errCount: number): number {
    return errCount === 0 ? 3 : errCount <= 3 ? 2 : 1;
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
        finishTrecho();
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
        text: 'Opa… o erro afasta você de Deus e o fogo do inferno fica mais perto! Mas a luz continua te esperando. 🙏',
      });
    }

    // próxima pergunta (reembaralha o trecho quando a fila acaba)
    setQueue((qu) => {
      const rest = qu.slice(1);
      return rest.length > 0 ? rest : shuffle(pathOf(trecho));
    });
  }

  function finishTrecho() {
    const stars = starsFrom(wrongCount);
    if (!recorded.current.has(trecho)) {
      recorded.current.add(trecho);
      completeLevel('estrada-da-luz', trecho, stars);
      if (isLast) playWin();
    }
    setWon(true);
  }

  function nextTrecho() {
    const t = trecho + 1;
    setTrecho(t);
    setQueue(shuffle(pathOf(t)));
    setStep(0);
    setStreak(0);
    setWrongCount(0);
    setWon(false);
    setMsg(null);
  }

  const current = queue[0];

  return (
    <GameShell
      title="A Estrada da Luz"
      subtitle="3 trechos · Responda certo e caminhe até a luz!"
      onExit={onExit}
      bg="bg-gradient-to-b from-indigo-950 via-violet-800 to-amber-200"
      titleClass="text-yellow-300"
    >
      {won ? <Confetti recycle={false} numberOfPieces={420} gravity={0.14} /> : null}

      <div aria-live="polite" className="sr-only">
        {won
          ? 'Trecho concluído!'
          : msg
            ? msg.text
            : `${step} de ${STEPS} passos em direção à luz`}
      </div>

      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-r from-red-950 via-slate-950 to-slate-900 transition-opacity duration-1000"
        style={{ opacity: wrongCount > 0 ? Math.min(wrongCount * 0.07, 0.4) : 0 }}
      />

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-5 px-4 pb-8">
        <LevelHUD level={trecho} totalLevels={TOTAL_TRECHOS} />

        {/* ------- trilha ------- */}
        <div className="relative h-60 w-full max-w-2xl">
          {/* inferno (pega fogo a cada erro) */}
          <div className="absolute bottom-2 left-0 z-10 flex flex-col items-start gap-1">
            <div className="flex items-center gap-1">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-2xl shadow-[0_0_16px_rgba(239,68,68,0.6)]">
                <Flame className="h-7 w-7 text-orange-500" />
                {wrongCount >= 3 ? (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 animate-ping rounded-full bg-red-500/90" />
                ) : null}
              </span>
              {Array.from({ length: Math.min(wrongCount, 3) }).map((_, i) => (
                <span
                  key={i}
                  className="animate-pop text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  style={{ animationDelay: `${i * 130}ms` }}
                >
                  🔥
                </span>
              ))}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black shadow ${
                wrongCount > 0
                  ? 'animate-pulse bg-red-600/90 text-white'
                  : 'bg-slate-800/80 text-red-300'
              }`}
            >
              inferno
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
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-base font-black text-yellow-200 shadow backdrop-blur-sm">
            Ponto {Math.min(step, STEPS)}/{STEPS}
          </span>
          {streak >= 2 && !won ? (
            <span className="animate-pop rounded-full bg-orange-500/80 px-4 py-1.5 text-sm font-black text-white shadow">
              🔥 {streak} seguidas!
            </span>
          ) : null}
          {wrongCount >= 2 && !won ? (
            <span className="animate-pulse rounded-full bg-red-600/90 px-4 py-1.5 text-sm font-black text-white shadow-[0_0_14px_rgba(220,38,38,0.7)]">
              ⚠️ Muito perto do inferno!
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

        {/* ------- trecho vencido ------- */}
        {won ? (
          <div className="animate-pop flex flex-col items-center gap-4">
            <p className="rounded-3xl bg-white/95 px-8 py-4 text-center text-2xl font-black text-amber-500 shadow-[0_0_30px_rgba(253,224,71,0.8)] sm:text-3xl">
              🏆 Você chegou à Luz! 🏆
              <span className="mt-1 block text-base font-extrabold text-indigo-700">
                Se você errou no caminho? A luz sempre te espera de volta! 💛
              </span>
            </p>
            <LevelDone
              stars={starsFrom(wrongCount)}
              onNext={isLast ? undefined : nextTrecho}
              onExit={onExit}
              headline={isLast ? undefined : `Trecho ${trecho} de ${TOTAL_TRECHOS} concluído!`}
              lesson={
                isLast
                  ? 'Você chegou ao fim da Estrada da Luz! Quem faz o certo tem a recompensa eterna pertinho de Deus! 👑'
                  : undefined
              }
            />
          </div>
        ) : null}

        <span className="flex items-center gap-1 text-xs font-bold text-white/50">
          <Sparkles className="h-4 w-4 text-yellow-300" /> cada passo certo é a luz de Deus no caminho
        </span>
      </div>
    </GameShell>
  );
}