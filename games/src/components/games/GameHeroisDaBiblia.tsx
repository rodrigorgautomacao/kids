import { useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { BookHeart, BookOpen, Sparkles, Star } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { completeLevel, loadLevels, nextUnfinishedLevel } from '../../lib/progress';
import { playCorrect, playPop, playWin, playWrong } from '../../lib/sound';

interface GameProps {
  onExit: () => void;
}

interface Choice {
  t: string;
  e: string; // emoji
}

interface Question {
  q: string;
  right: Choice; // resposta certa
  wrongs: Choice[]; // distratores (4)
}

interface PreparedQuestion extends Question {
  options: Choice[]; // as 5 opções embaralhadas
}

const STEPS = 5;
const TOTAL_TRECHOS = 3;
const QUESTIONS_PER_TRECHO = 10;

// 30 perguntas da lição: 3 trechos × 10 (cada uma com 5 opções parecidas)
const QUESTIONS: Question[] = [
  // ------- Trecho 1: grandes histórias do Antigo Testamento -------
  { q: 'Quem construiu a arca para salvar os animais do dilúvio?', right: { t: 'Noé', e: '🕊️' }, wrongs: [{ t: 'Moisés', e: '🗿' }, { t: 'Abraão', e: '🏕️' }, { t: 'Davi', e: '🎯' }, { t: 'Elias', e: '⚡' }] },
  { q: 'Depois do dilúvio, Deus mostrou um arco-íris. Em qual livro está essa história?', right: { t: 'Gênesis', e: '🌈' }, wrongs: [{ t: 'Êxodo', e: '🏜️' }, { t: 'Levítico', e: '📜' }, { t: 'Números', e: '🔢' }, { t: 'Deuteronômio', e: '📖' }] },
  { q: 'Quem foi chamado por Deus para sair da sua terra e virar pai de uma grande nação?', right: { t: 'Abraão', e: '🌟' }, wrongs: [{ t: 'Isaque', e: '🐑' }, { t: 'Jacó', e: '🪜' }, { t: 'José', e: '🌾' }, { t: 'Noé', e: '🕊️' }] },
  { q: 'Quem foi vendido pelos irmãos e depois salvou o Egito da fome?', right: { t: 'José', e: '🌾' }, wrongs: [{ t: 'Moisés', e: '🗿' }, { t: 'Samuel', e: '📜' }, { t: 'Davi', e: '🎯' }, { t: 'Josué', e: '⚔️' }] },
  { q: 'A história de José do Egito está em qual livro?', right: { t: 'Gênesis', e: '📖' }, wrongs: [{ t: 'Êxodo', e: '🏜️' }, { t: 'Números', e: '🔢' }, { t: 'Josué', e: '⚔️' }, { t: 'Juízes', e: '🎗️' }] },
  { q: 'Quem foi colocado num cesto no rio e depois libertou Israel do Egito?', right: { t: 'Moisés', e: '🗿' }, wrongs: [{ t: 'Arão', e: '🪔' }, { t: 'José', e: '🌾' }, { t: 'Josué', e: '⚔️' }, { t: 'Gideão', e: '🌿' }] },
  { q: 'Em qual livro a Bíblia conta a saída do Egito?', right: { t: 'Êxodo', e: '🏜️' }, wrongs: [{ t: 'Gênesis', e: '🌀' }, { t: 'Levítico', e: '📜' }, { t: 'Deuteronômio', e: '📖' }, { t: 'Josué', e: '⚔️' }] },
  { q: 'Quem tocou as trombetas e as muralhas de Jericó caíram?', right: { t: 'Josué', e: '⚔️' }, wrongs: [{ t: 'Moisés', e: '🗿' }, { t: 'Sansão', e: '💪' }, { t: 'Gideão', e: '🌿' }, { t: 'Samuel', e: '📜' }] },
  { q: 'Quem derrubou o gigante Golias com uma pedra e uma funda?', right: { t: 'Davi', e: '🎯' }, wrongs: [{ t: 'Saul', e: '👑' }, { t: 'Salomão', e: '🦉' }, { t: 'Sansão', e: '💪' }, { t: 'Josué', e: '⚔️' }] },
  { q: 'A história de Davi e Golias está em qual livro?', right: { t: '1 Samuel', e: '📖' }, wrongs: [{ t: '2 Samuel', e: '📜' }, { t: '1 Reis', e: '👑' }, { t: '2 Reis', e: '🏰' }, { t: '1 Crônicas', e: '📚' }] },
  // ------- Trecho 2: profetas, reis e escolhidos -------
  { q: 'Quem foi engolido por um grande peixe quando fugiu de Deus?', right: { t: 'Jonas', e: '🐋' }, wrongs: [{ t: 'Elias', e: '⚡' }, { t: 'Eliseu', e: '🐻' }, { t: 'Daniel', e: '🦁' }, { t: 'Jeremias', e: '😢' }] },
  { q: 'A história de Jonas dentro do grande peixe está em qual livro?', right: { t: 'Jonas', e: '🐋' }, wrongs: [{ t: 'Oseias', e: '🤍' }, { t: 'Joel', e: '🌾' }, { t: 'Amós', e: '🐑' }, { t: 'Miqueias', e: '🏔️' }] },
  { q: 'Quem subiu ao céu num carro de fogo?', right: { t: 'Elias', e: '⚡' }, wrongs: [{ t: 'Eliseu', e: '🐻' }, { t: 'Moisés', e: '🗿' }, { t: 'Samuel', e: '📜' }, { t: 'Davi', e: '🎯' }] },
  { q: 'Depois que Elias subiu ao céu, quem recebeu o seu manto?', right: { t: 'Eliseu', e: '🧥' }, wrongs: [{ t: 'Isaías', e: '📖' }, { t: 'Samuel', e: '📜' }, { t: 'Jeremias', e: '😢' }, { t: 'Ezequiel', e: '👁️' }] },
  { q: 'As histórias de Elias e Eliseu estão em qual livro?', right: { t: '2 Reis', e: '🏰' }, wrongs: [{ t: '1 Reis', e: '👑' }, { t: '2 Samuel', e: '📖' }, { t: '1 Crônicas', e: '📚' }, { t: '2 Crônicas', e: '🗞️' }] },
  { q: 'Quem mandou uma ursa atacar os garotos que zombavam dele?', right: { t: 'Eliseu', e: '🐻' }, wrongs: [{ t: 'Elias', e: '⚡' }, { t: 'Josué', e: '⚔️' }, { t: 'Sansão', e: '💪' }, { t: 'Gideão', e: '🌿' }] },
  { q: 'Quem foi lançado na cova dos leões e saiu vivo porque confiou em Deus?', right: { t: 'Daniel', e: '🦁' }, wrongs: [{ t: 'Jonas', e: '🐋' }, { t: 'Sadraque', e: '🔥' }, { t: 'José', e: '🌾' }, { t: 'Davi', e: '🎯' }] },
  { q: 'A história de Daniel na cova dos leões está em qual livro?', right: { t: 'Daniel', e: '🦁' }, wrongs: [{ t: 'Ezequiel', e: '👁️' }, { t: 'Jeremias', e: '😢' }, { t: 'Jonas', e: '🐋' }, { t: 'Oseias', e: '🤍' }] },
  { q: 'Quem foi o rei mais sábio de Israel, filho de Davi?', right: { t: 'Salomão', e: '🦉' }, wrongs: [{ t: 'Saul', e: '👑' }, { t: 'Josias', e: '📖' }, { t: 'Ezequias', e: '🙏' }, { t: 'Davi', e: '🎯' }] },
  { q: 'Qual livro traz os conselhos sábios de Salomão?', right: { t: 'Provérbios', e: '📜' }, wrongs: [{ t: 'Salmos', e: '🎵' }, { t: 'Eclesiastes', e: '🍃' }, { t: 'Cantares', e: '💕' }, { t: 'Jó', e: '🤔' }] },
  // ------- Trecho 3: Jesus, apóstolos e o Novo Testamento -------
  { q: 'Quem nasceu numa manjedoura em Belém?', right: { t: 'Jesus', e: '🎄' }, wrongs: [{ t: 'João Batista', e: '🐫' }, { t: 'Pedro', e: '🎣' }, { t: 'Paulo', e: '📜' }, { t: 'José', e: '🪚' }] },
  { q: 'Quem contou sobre os pastores que visitaram o menino Jesus?', right: { t: 'Lucas', e: '📖' }, wrongs: [{ t: 'Mateus', e: '📜' }, { t: 'Marcos', e: '⚒️' }, { t: 'João', e: '🕊️' }, { t: 'Atos', e: '⛵' }] },
  { q: 'Quem contou sobre os sábios do Oriente que seguiram a estrela?', right: { t: 'Mateus', e: '⭐' }, wrongs: [{ t: 'Lucas', e: '📖' }, { t: 'Marcos', e: '⚒️' }, { t: 'João', e: '🕊️' }, { t: 'Apocalipse', e: '🌟' }] },
  { q: 'Quem batizou Jesus no rio Jordão?', right: { t: 'João Batista', e: '🐫' }, wrongs: [{ t: 'Pedro', e: '🎣' }, { t: 'Paulo', e: '📜' }, { t: 'André', e: '🫂' }, { t: 'Tomé', e: '🤔' }] },
  { q: 'Quem andou sobre as águas com Jesus depois de sair do barco?', right: { t: 'Pedro', e: '🚶' }, wrongs: [{ t: 'João', e: '🕊️' }, { t: 'Tiago', e: '⚓' }, { t: 'Tomé', e: '🤔' }, { t: 'Judas', e: '🪙' }] },
  { q: 'Quem traiu Jesus por 30 moedas de prata?', right: { t: 'Judas', e: '🪙' }, wrongs: [{ t: 'Pedro', e: '🎣' }, { t: 'João', e: '🕊️' }, { t: 'Tomé', e: '🤔' }, { t: 'Filipe', e: '👥' }] },
  { q: 'Em qual livro o Espírito Santo desceu sobre os discípulos?', right: { t: 'Atos', e: '⛵' }, wrongs: [{ t: 'Romanos', e: '✉️' }, { t: '1 Coríntios', e: '✉️' }, { t: 'Gálatas', e: '✉️' }, { t: 'Efésios', e: '✉️' }] },
  { q: 'A criação do céu e da terra está em qual livro?', right: { t: 'Gênesis', e: '🌀' }, wrongs: [{ t: 'Êxodo', e: '🏜️' }, { t: 'Salmos', e: '🎵' }, { t: 'Jó', e: '🤔' }, { t: 'Apocalipse', e: '🌟' }] },
  { q: 'Quem viu Jesus no caminho de Damasco e virou apóstolo?', right: { t: 'Paulo', e: '📜' }, wrongs: [{ t: 'Pedro', e: '🎣' }, { t: 'Barnabé', e: '🤝' }, { t: 'Estêvão', e: '🪨' }, { t: 'Mateus', e: '📖' }] },
  { q: 'Qual é o último livro da Bíblia, que fala do novo céu e da nova terra?', right: { t: 'Apocalipse', e: '🌟' }, wrongs: [{ t: 'Gênesis', e: '🌀' }, { t: 'Atos', e: '⛵' }, { t: 'Romanos', e: '✉️' }, { t: 'Salmos', e: '🎵' }] },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Monta a pergunta com as 5 opções já embaralhadas (a certa muda de posição). */
function prepare(q: Question): PreparedQuestion {
  return { ...q, options: shuffle([q.right, ...q.wrongs]) };
}

function pathOf(trecho: number): PreparedQuestion[] {
  return QUESTIONS.slice((trecho - 1) * QUESTIONS_PER_TRECHO, trecho * QUESTIONS_PER_TRECHO).map(
    prepare,
  );
}

export default function GameHeroisDaBiblia({ onExit }: GameProps) {
  const [trecho, setTrecho] = useState(() =>
    nextUnfinishedLevel(loadLevels(), 'herois-da-biblia', TOTAL_TRECHOS),
  );
  const [queue, setQueue] = useState<PreparedQuestion[]>(() => shuffle(pathOf(1)));
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

  function answer(chosen: Choice) {
    if (won || queue.length === 0) return;

    const isRight = chosen === current.right;

    if (isRight) {
      playCorrect();
      const next = Math.min(STEPS, step + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setMsg({
        good: true,
        text:
          nextStreak >= 4
            ? 'Você conhece a Bíblia demais! 🌟'
            : nextStreak >= 2
              ? `Resposta certa ×${nextStreak}!`
              : 'Muito bem, continue assim! 📖',
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
        text: 'Quase! As histórias são parecidas mesmo… leia com calma e tente de novo. 💪',
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
      completeLevel('herois-da-biblia', trecho, stars);
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
      title="Heróis da Bíblia"
      subtitle="3 trechos · Conheça as histórias e descubra em qual livro estão!"
      onExit={onExit}
      bg="bg-gradient-to-b from-emerald-950 via-emerald-800 to-amber-200"
      titleClass="text-amber-300"
    >
      {won ? <Confetti recycle={false} numberOfPieces={420} gravity={0.14} /> : null}

      <div aria-live="polite" className="sr-only">
        {won
          ? 'Trecho concluído!'
          : msg
            ? msg.text
            : `${step} de ${STEPS} passos em direção ao conhecimento`}
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-5 px-4 pb-8">
        <LevelHUD level={trecho} totalLevels={TOTAL_TRECHOS} />

        {/* ------- trilha do conhecimento ------- */}
        <div className="relative h-56 w-full max-w-2xl">
          {/* livro aberto (começo) */}
          <div className="absolute bottom-2 left-0 z-10 flex flex-col items-start gap-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/20 text-2xl shadow-[0_0_14px_rgba(252,211,77,0.5)]">
              <BookOpen className="h-7 w-7 text-amber-300" />
            </span>
            <span className="rounded-full bg-emerald-900/80 px-3 py-1 text-xs font-black text-amber-200">
              começo
            </span>
          </div>

          {/* sabedoria (fim) */}
          <div className="absolute top-[24%] right-1 flex flex-col items-center">
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-200 bg-gradient-to-b from-amber-300 to-yellow-400 shadow-[0_0_24px_rgba(252,211,77,0.9)] ${
                won ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              <BookHeart className="h-9 w-9 text-amber-900" />
            </span>
            <span className="mt-1 rounded-full bg-amber-300/20 px-3 py-1 text-xs font-bold text-amber-100">
              Sabedoria
            </span>
          </div>

          {/* trilha */}
          <div className="absolute top-[52%] left-[4%] right-[4%] h-4 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-amber-300 shadow-lg" />

          {/* marcadores de passo */}
          {[1, 2, 3, 4].map((i) => {
            const reached = i <= step;
            return (
              <span
                key={i}
                className={`absolute top-[46%] flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  reached
                    ? 'scale-110 border-amber-300 bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]'
                    : 'border-emerald-500 bg-emerald-700/60'
                }`}
                style={{ left: `${(i / STEPS) * 100}%` }}
              >
                {reached ? (
                  <Star className="h-5 w-5 fill-amber-600 text-amber-600" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
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
                    ? 'animate-bounce border-amber-200 bg-gradient-to-b from-amber-300 to-yellow-400'
                    : 'border-emerald-200 bg-gradient-to-b from-emerald-400 to-teal-600'
                }`}
              >
                <BookOpen className="h-9 w-9 text-white" />
              </span>
            </div>
          </div>
        </div>

        {/* badges de gamificação */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-base font-black text-amber-200 shadow backdrop-blur-sm">
            Ponto {Math.min(step, STEPS)}/{STEPS}
          </span>
          {streak >= 2 && !won ? (
            <span className="animate-pop rounded-full bg-orange-500/80 px-4 py-1.5 text-sm font-black text-white shadow">
              🔥 {streak} seguidas!
            </span>
          ) : null}
          {wrongCount >= 2 && !won ? (
            <span className="animate-pulse rounded-full bg-red-600/90 px-4 py-1.5 text-sm font-black text-white shadow-[0_0_14px_rgba(220,38,38,0.7)]">
              ⚠️ Cuidado: leia a referência com atenção!
            </span>
          ) : null}
        </div>

        {/* mensagem de feedback */}
        {msg && !won ? (
          <p
            className={`animate-pop max-w-md rounded-3xl px-6 py-3 text-center text-base font-extrabold shadow-lg ${
              msg.good
                ? 'bg-amber-200/90 text-amber-800'
                : 'bg-emerald-900/80 text-emerald-100'
            }`}
          >
            {msg.text}
          </p>
        ) : null}

        {/* ------- pergunta + respostas ------- */}
        {!won && current ? (
          <div className="flex w-full max-w-2xl flex-col items-center gap-4">
            <p className="rounded-3xl bg-white/95 px-6 py-4 text-center text-xl font-black text-emerald-900 shadow-xl">
              {current.q}
            </p>
            <div className="grid w-full grid-cols-2 gap-3">
              {current.options.map((opt, i) => (
                <button
                  key={opt.t}
                  type="button"
                  onClick={() => answer(opt)}
                  className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-600 shadow-md transition-transform hover:scale-105 active:scale-95 ${
                    i === current.options.length - 1 ? 'col-span-2' : ''
                  }`}
                >
                  <span className="text-3xl">{opt.e}</span> {opt.t}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* ------- trecho vencido ------- */}
        {won ? (
          <div className="animate-pop flex flex-col items-center gap-4">
            <p className="rounded-3xl bg-white/95 px-8 py-4 text-center text-2xl font-black text-amber-500 shadow-[0_0_30px_rgba(252,211,77,0.8)] sm:text-3xl">
              🏆 Você venceu o trecho! 🏆
              <span className="mt-1 block text-base font-extrabold text-emerald-700">
                Cada história da Bíblia é uma luz para o nosso caminho! 💛
              </span>
            </p>
            <LevelDone
              stars={starsFrom(wrongCount)}
              onNext={isLast ? undefined : nextTrecho}
              onExit={onExit}
              headline={isLast ? undefined : `Trecho ${trecho} de ${TOTAL_TRECHOS} concluído!`}
              lesson={
                isLast
                  ? 'Você conheceu os heróis da fé! Agora procure cada história na sua Bíblia e guarde o livro onde ela está. 📖✨'
                  : undefined
              }
            />
          </div>
        ) : null}

        <span className="flex items-center gap-1 text-xs font-bold text-white/70">
          <Sparkles className="h-4 w-4 text-amber-300" /> cada acerto acende uma luz de sabedoria
        </span>
      </div>
    </GameShell>
  );
}