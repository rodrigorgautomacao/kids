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
import { burst, flyNumber, ring } from '../../lib/fx';
import { starsForWrong } from '../../lib/minigame';

// ── Ache o Escondido ─────────────────────────────────────────────────────
// Numa cena cheia de figuras, a criança procura e toca no item pedido.
// Trabalha atenção visual e vocabulário; a pista é sempre narrada e escrita.

export interface HiddenRound {
  id: string;
  /** Figuras espalhadas na cena. */
  field: string[];
  /** O item a encontrar (deve aparecer exatamente uma vez no field). */
  find: { emoji: string; label: string };
  ref: string;
  msg: string;
}

interface HiddenGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  rounds: HiddenRound[];
  onExit: () => void;
}

const PTS_ACERTO = 100;

export default function HiddenGame({
  gameId,
  title,
  subtitle,
  bg,
  titleClass,
  rounds,
  onExit,
}: HiddenGameProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(3);
  const [found, setFound] = useState(false);
  const [shaking, setShaking] = useState<number | null>(null);
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
    setFound(false);
    setShaking(null);
    setMsg(null);
    const t = window.setTimeout(() => voice.speak(`Ache: ${rounds[idx].find.label}!`), 350);
    return () => window.clearTimeout(t);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handleTap(i: number, emoji: string, ev: { currentTarget: HTMLElement }) {
    if (found || finished) return;
    if (emoji === round.find.emoji) {
      const el = ev.currentTarget;
      const box = stageRef.current?.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2 - (box?.left ?? 0);
      const y = r.top + r.height / 2 - (box?.top ?? 0);
      sfx.correct();
      setFound(true);
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
          setIdx((v) => v + 1);
        }
      }, 2400);
    } else {
      sfx.wrong();
      wrongRef.current += 1;
      setWrongTotal((w) => w + 1);
      setShaking(i);
      later(() => setShaking(null), 500);
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
    setFound(false);
    setMsg(null);
  }

  if (finished) {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-orange-100 via-amber-50 to-yellow-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={stars}
          onExit={onExit}
          wrong={wrongTotal}
          headline={stars === 3 ? 'Incrível! ⭐⭐⭐' : stars === 2 ? 'Muito bem! ⭐⭐' : 'Bom esforço! ⭐'}
        />
        <p className="-mt-1 text-sm font-black text-orange-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={handleReplay}
          className="ui-press rounded-full bg-orange-400 px-8 py-3 text-lg font-black text-orange-950 shadow-[0_6px_0_rgba(234,88,12,0.9)]"
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
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-orange-700 shadow">
                🏆 {Math.max(record, score)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative w-full rounded-3xl bg-white/95 px-6 py-4 text-center shadow-xl">
          <p className="text-xl font-black text-indigo-900">
            Ache: {round.find.label} {round.find.emoji}
          </p>
          <button
            type="button"
            onClick={() => {
              sfx.pop();
              voice.speak(`Ache: ${round.find.label}!`);
            }}
            aria-label="Ouvir de novo"
            className="ui-press absolute top-2 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={stageRef}
          className="relative grid w-full grid-cols-5 gap-2 rounded-3xl bg-gradient-to-b from-sky-50 to-emerald-50 px-3 py-4 shadow-inner"
        >
          {round.field.map((emoji, i) => (
            <button
              key={i}
              type="button"
              onClick={(ev) => handleTap(i, emoji, ev)}
              aria-label={emoji}
              className={`ui-press flex items-center justify-center rounded-2xl bg-white/70 py-2 text-4xl shadow ${
                shaking === i ? 'animate-shake' : ''
              } ${found && emoji === round.find.emoji ? 'animate-pop ring-4 ring-emerald-400' : ''}`}
              style={{ transform: `rotate(${((i % 5) - 2) * 5}deg)` }}
            >
              {emoji}
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
