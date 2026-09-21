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

// ── Conte com a Bíblia ───────────────────────────────────────────────────
// A criança conta os elementos da cena (ou resolve um probleminha simples da
// história) e toca no número certo. Trabalha contagem e soma curta sem
// transformar em prova: errar não pune.

export interface CountRound {
  id: string;
  emojis: string[];
  question: string;
  options: number[];
  correct: number;
  ref: string;
  msg: string;
}

interface CountGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  rounds: CountRound[];
  onExit: () => void;
}

const PTS_ACERTO = 100;

export default function CountGame({
  gameId,
  title,
  subtitle,
  bg,
  titleClass,
  rounds,
  onExit,
}: CountGameProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(3);
  const [picked, setPicked] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState<{ text: string; good: boolean; ref?: string } | null>(null);
  const wrongRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(gameId);
  const round = rounds[idx];

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (idx >= rounds.length) return;
    setOrder(shuffle(rounds[idx].options));
    setPicked(null);
    setMsg(null);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (finished || !round) return;
    const t = window.setTimeout(() => voice.speak(round.question), 400);
    return () => window.clearTimeout(t);
  }, [idx, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handlePick(num: number, ev: { currentTarget: HTMLElement }) {
    if (picked !== null || won || finished) return;
    const el = ev.currentTarget;
    const box = stageRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - (box?.left ?? 0);
    const y = r.top + r.height / 2 - (box?.top ?? 0);
    setPicked(num);

    if (num === round.correct) {
      sfx.correct();
      setWon(true);
      setScore((s) => s + PTS_ACERTO);
      burst(stageRef.current, x, y, { kind: 'spark', count: 18 });
      ring(stageRef.current, x, y, '#facc15', 42);
      flyNumber(stageRef.current, x, y, `+${PTS_ACERTO}`);
      setMsg({ text: round.msg, good: true, ref: round.ref });
      voice.speak(round.msg);

      later(() => {
        if (idx + 1 >= rounds.length) {
          setStars(starsForWrong(wrongRef.current));
          setFinished(true);
          submitScore(gameId, score + PTS_ACERTO);
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
      setMsg({ text: 'Quase! Conta de novo com calma. ✊', good: false });
      voice.speak('Quase! Conta de novo!');
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
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-lime-100 via-emerald-50 to-teal-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={stars}
          onExit={onExit}
          wrong={wrongTotal}
          headline={stars === 3 ? 'Incrível! ⭐⭐⭐' : stars === 2 ? 'Muito bem! ⭐⭐' : 'Bom esforço! ⭐'}
        />
        <p className="-mt-1 text-sm font-black text-teal-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={handleReplay}
          className="ui-press rounded-full bg-teal-400 px-8 py-3 text-lg font-black text-teal-950 shadow-[0_6px_0_rgba(13,148,136,0.9)]"
        >
          Jogar de novo 🔁
        </button>
      </div>
    );
  }

  if (!round) return null;

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={1} totalLevels={1} step={idx + 1} steps={rounds.length} />
          <div className="flex items-center gap-2">
            {score > 0 ? (
              <span className="ui-press flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-900 shadow">
                <StarItem size={18} /> {score}
              </span>
            ) : null}
            {record > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-teal-700 shadow">
                🏆 {Math.max(record, score)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative w-full rounded-3xl bg-white/95 px-6 py-4 text-center shadow-xl">
          <p className="text-xl font-black text-indigo-900">{round.question}</p>
          <button
            type="button"
            onClick={() => {
              sfx.pop();
              voice.speak(round.question);
            }}
            aria-label="Ouvir a pergunta de novo"
            className="ui-press absolute top-2 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white shadow"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-2 rounded-3xl bg-white/80 px-4 py-5 shadow-inner">
          {round.emojis.map((e, i) => (
            <span key={i} className="text-5xl sm:text-6xl">
              {e}
            </span>
          ))}
        </div>

        <div ref={stageRef} className="relative grid w-full grid-cols-3 gap-3">
          {order.map((num) => (
            <button
              key={num}
              type="button"
              disabled={won || picked === num}
              onClick={(ev) => handlePick(num, ev)}
              className={`ui-press flex min-h-24 items-center justify-center rounded-3xl border-4 text-5xl font-black shadow-lg transition-transform ${
                picked === num && num === round.correct
                  ? 'animate-pop border-emerald-400 bg-emerald-50 text-emerald-700'
                  : picked === num
                    ? 'border-rose-200 bg-rose-50 text-rose-300'
                    : 'border-slate-200 bg-white text-indigo-800 hover:scale-105'
              }`}
            >
              {num}
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
