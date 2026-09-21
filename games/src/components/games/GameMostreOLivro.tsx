import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { StarItem } from '../art';
import { bestScore, submitScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, ring, shake } from '../../lib/fx';
import { shuffle, starsForWrong } from '../../lib/minigame';
import { isSmallKidsMode } from '../../lib/prefs';

// ── Mostre o Livro (5–6 anos) ────────────────────────────────────────────
// A criança ouve/lê uma pista curta e toca no livro da Bíblia de onde ela vem.
// Trabalha classificação e conhecimento bíblico; a referência aparece depois do
// acerto, como prêmio. Erro não pune.

interface Round {
  pista: string;
  options: [string, string, string];
  certo: string;
  ref: string;
  msg: string;
}

const ROUNDS: Round[] = [
  { pista: 'Noé construiu uma arca bem grande.', options: ['Gênesis', 'Jonas', 'Atos'], certo: 'Gênesis', ref: 'Gênesis 6.14 (NAA)', msg: 'Isso! A história de Noé está em Gênesis! 🚢' },
  { pista: 'Moisés abriu o Mar Vermelho.', options: ['Êxodo', 'Lucas', 'Josué'], certo: 'Êxodo', ref: 'Êxodo 14.21 (NAA)', msg: 'Muito bem! Êxodo conta a saída do Egito! 🌊' },
  { pista: 'As muralhas de Jericó caíram.', options: ['Josué', 'Daniel', 'Mateus'], certo: 'Josué', ref: 'Josué 6.20 (NAA)', msg: 'Isso! Josué liderou o povo de Deus! 📯' },
  { pista: 'Davi venceu o gigante Golias.', options: ['1 Samuel', 'Jonas', 'Atos'], certo: '1 Samuel', ref: '1 Samuel 17.50 (NAA)', msg: 'Certo! Davi e Golias estão em 1 Samuel! 🪨' },
  { pista: 'Jonas ficou dentro do grande peixe.', options: ['Jonas', 'Êxodo', 'Lucas'], certo: 'Jonas', ref: 'Jonas 1.17 (NAA)', msg: 'Isso! O livro leva o nome dele! 🐳' },
  { pista: 'Daniel foi protegido na cova dos leões.', options: ['Daniel', 'Gênesis', 'Marcos'], certo: 'Daniel', ref: 'Daniel 6.22 (NAA)', msg: 'Muito bem! Daniel confiou em Deus! 🦁' },
  { pista: 'Jesus nasceu em Belém.', options: ['Lucas', 'Josué', 'Daniel'], certo: 'Lucas', ref: 'Lucas 2.6-7 (NAA)', msg: 'Certo! Lucas conta o nascimento de Jesus! ⭐' },
  { pista: 'Paulo viu uma luz no caminho de Damasco.', options: ['Atos', 'Gênesis', '1 Samuel'], certo: 'Atos', ref: 'Atos 9.3 (NAA)', msg: 'Isso! Atos conta a história da igreja! ✨' },
];

const GAME_ID = 'mostre-o-livro';
const PTS_ACERTO = 100;

export default function GameMostreOLivro({ onExit }: { onExit: () => void }) {
  const smallKids = isSmallKidsMode();
  const reducedMotion = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [order, setOrder] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(3);
  const [picked, setPicked] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState<{ text: string; good: boolean; ref?: string } | null>(null);
  const wrongRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(GAME_ID);
  const round = ROUNDS[idx];

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (idx >= ROUNDS.length) return;
    setOrder(shuffle(ROUNDS[idx].options));
    setPicked(null);
    setMsg(null);
  }, [idx]);

  useEffect(() => {
    if (finished || !round) return;
    const t = window.setTimeout(() => voice.speak(round.pista), 400);
    return () => window.clearTimeout(t);
  }, [idx, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handlePick(book: string, ev: { currentTarget: HTMLElement }) {
    if (picked || won || finished) return;
    const el = ev.currentTarget;
    const box = stageRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - (box?.left ?? 0);
    const y = r.top + r.height / 2 - (box?.top ?? 0);
    setPicked(book);

    if (book === round.certo) {
      sfx.correct();
      setWon(true);
      setScore((s) => s + PTS_ACERTO);
      burst(stageRef.current, x, y, { kind: 'spark', count: 18 });
      ring(stageRef.current, x, y, '#facc15', 42);
      flyNumber(stageRef.current, x, y, `+${PTS_ACERTO}`);
      setMsg({ text: round.msg, good: true, ref: round.ref });
      voice.speak(round.msg);

      later(() => {
        if (idx + 1 >= ROUNDS.length) {
          setStars(starsForWrong(wrongRef.current));
          setFinished(true);
          submitScore(GAME_ID, score + PTS_ACERTO);
        } else {
          setIdx((i) => i + 1);
          setWon(false);
        }
      }, 2600);
    } else {
      sfx.wrong();
      wrongRef.current += 1;
      setWrongTotal((w) => w + 1);
      shake(el);
      setMsg({ text: 'Quase! Pensa em qual livro conta essa história! ✊', good: false });
      voice.speak('Quase! Tenta de novo!');
      later(() => setPicked(null), 900);
    }
  }

  function handleReplay() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setIdx(0);
    setScore(0);
    setWrongTotal(0);
    wrongRef.current = 0;
    setFinished(false);
    setWon(false);
    setMsg(null);
  }

  if (finished) {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-cyan-100 via-sky-50 to-blue-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={stars}
          onExit={onExit}
          wrong={wrongTotal}
          headline={stars === 3 ? 'Incrível! ⭐⭐⭐' : stars === 2 ? 'Muito bem! ⭐⭐' : 'Bom esforço! ⭐'}
        />
        <p className="-mt-1 text-sm font-black text-cyan-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={handleReplay}
          className="ui-press rounded-full bg-cyan-400 px-8 py-3 text-lg font-black text-cyan-950 shadow-[0_6px_0_rgba(8,145,178,0.9)]"
        >
          Jogar de novo 🔁
        </button>
      </div>
    );
  }

  if (!round) return null;

  return (
    <GameShell
      title="Mostre o Livro"
      subtitle="De qual livro da Bíblia é essa história?"
      onExit={onExit}
      bg="bg-gradient-to-b from-cyan-100 via-sky-50 to-blue-100"
      titleClass="text-cyan-600"
    >
      <div className="relative flex w-full flex-col items-center gap-5 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={1} totalLevels={1} step={idx + 1} steps={ROUNDS.length} />
          <div className="flex items-center gap-2">
            {score > 0 ? (
              <span className="ui-press flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-900 shadow">
                <StarItem size={18} /> {score}
              </span>
            ) : null}
            {record > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-cyan-700 shadow">
                🏆 {Math.max(record, score)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative w-full rounded-3xl bg-white/95 px-6 py-4 text-center shadow-xl">
          <p className="text-xl font-black text-indigo-900">{round.pista}</p>
          <button
            type="button"
            onClick={() => {
              sfx.pop();
              voice.speak(round.pista);
            }}
            aria-label="Ouvir a pista de novo"
            className="ui-press absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-500 text-white shadow"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>

        <div ref={stageRef} className="relative grid w-full grid-cols-3 gap-3">
          {order.map((book) => (
            <button
              key={book}
              type="button"
              disabled={won}
              onClick={(ev) => handlePick(book, ev)}
              className={`ui-press flex flex-col items-center gap-2 rounded-3xl border-4 bg-white px-3 py-6 shadow-lg transition-transform ${
                picked === book && book === round.certo
                  ? 'animate-pop border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 hover:scale-105'
              } ${smallKids ? 'min-h-40' : 'min-h-32'}`}
            >
              <span className={smallKids ? 'text-6xl' : 'text-5xl'}>📖</span>
              <span className="text-center text-base font-black text-indigo-800">{book}</span>
            </button>
          ))}
        </div>

        {msg ? (
          <p
            className={`animate-pop rounded-3xl px-6 py-3 text-center text-base font-extrabold shadow-lg ${
              msg.good ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {msg.text}
            {msg.ref ? <span className="mt-1 block text-xs opacity-80">📖 {msg.ref}</span> : null}
          </p>
        ) : null}
      </div>
    </GameShell>
  );
}
