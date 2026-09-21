import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { StarItem } from '../art';
import { bestScore, submitScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, shake } from '../../lib/fx';
import { starsForWrong } from '../../lib/minigame';

// ── Separe por Testamento (AT × NT) ──────────────────────────────────────
// Cada rodada traz histórias/personagens para colocar no cesto certo:
// Antigo Testamento ou Novo Testamento. Ensina a organização da Bíblia.
// Um item por vez, com dois cestos grandes; errar não pune.

export interface SortItem {
  id: string;
  emoji: string;
  label: string;
  bucket: string;
}

export interface SortBucket {
  id: string;
  emoji: string;
  label: string;
}

export interface SortRound {
  id: string;
  ref: string;
  buckets: SortBucket[];
  items: SortItem[];
}

interface SortGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  question: string;
  rounds: SortRound[];
  onExit: () => void;
}

const PTS_ITEM = 100;

export default function SortGame({
  gameId,
  title,
  subtitle,
  bg,
  titleClass,
  question,
  rounds,
  onExit,
}: SortGameProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(3);
  const [placed, setPlaced] = useState<Record<string, SortItem[]>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const wrongRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(gameId);
  const round = rounds[idx];
  const item = round?.items[itemIdx];

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (idx >= rounds.length) return;
    setItemIdx(0);
    setPlaced({});
    setMsg(null);
    const t = window.setTimeout(() => voice.speak(rounds[idx].items[0]?.label ?? ''), 350);
    return () => window.clearTimeout(t);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function place(bucketId: string, ev: { currentTarget: HTMLElement }) {
    if (!item || finished) return;
    if (bucketId === item.bucket) {
      const el = ev.currentTarget;
      const box = stageRef.current?.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2 - (box?.left ?? 0);
      const y = r.top + r.height / 2 - (box?.top ?? 0);
      sfx.correct();
      burst(stageRef.current, x, y, { kind: 'spark', count: 14 });
      flyNumber(stageRef.current, x, y, `+${PTS_ITEM}`);
      setScore((s) => s + PTS_ITEM);
      setPlaced((p) => ({ ...p, [bucketId]: [...(p[bucketId] ?? []), item] }));
      setMsg(`Isso! ${item.label} entra aqui. 🎉`);

      const nextItem = itemIdx + 1;
      if (nextItem >= round.items.length) {
        later(() => {
          if (idx + 1 >= rounds.length) {
            setStars(starsForWrong(wrongRef.current));
            setFinished(true);
            submitScore(gameId, score + PTS_ITEM);
            voice.speak('Muito bem! Você separou tudo certinho!');
          } else {
            setIdx((i) => i + 1);
          }
        }, 1000);
      } else {
        setItemIdx(nextItem);
        later(() => voice.speak(round.items[nextItem].label), 700);
      }
    } else {
      sfx.wrong();
      shake(ev.currentTarget);
      wrongRef.current += 1;
      setWrongTotal((w) => w + 1);
      setMsg('Quase! Pensa: essa história é antes ou depois de Jesus? ✊');
      voice.speak('Quase! Tenta o outro cesto!');
    }
  }

  function handleReplay() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setIdx(0);
    setItemIdx(0);
    setScore(0);
    setWrongTotal(0);
    wrongRef.current = 0;
    setPlaced({});
    setFinished(false);
    setMsg(null);
  }

  if (finished) {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-indigo-100 via-sky-50 to-cyan-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={stars}
          onExit={onExit}
          wrong={wrongTotal}
          headline={stars === 3 ? 'Incrível! ⭐⭐⭐' : stars === 2 ? 'Muito bem! ⭐⭐' : 'Bom esforço! ⭐'}
        />
        <p className="-mt-1 text-sm font-black text-indigo-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={handleReplay}
          className="ui-press rounded-full bg-indigo-400 px-8 py-3 text-lg font-black text-indigo-950 shadow-[0_6px_0_rgba(99,102,241,0.9)]"
        >
          Jogar de novo 🔁
        </button>
      </div>
    );
  }

  if (!round || !item) return null;

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={idx + 1} totalLevels={rounds.length} step={itemIdx} steps={round.items.length} />
          <div className="flex items-center gap-2">
            {score > 0 ? (
              <span className="ui-press flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-900 shadow">
                <StarItem size={18} /> {score}
              </span>
            ) : null}
            {record > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-indigo-700 shadow">
                🏆 {Math.max(record, score)}
              </span>
            ) : null}
          </div>
        </div>

        <div ref={stageRef} className="relative flex w-full flex-col items-center gap-4">
          <p className="text-sm font-black text-slate-500">{question}</p>

          <div className="flex w-full flex-col items-center gap-2 rounded-3xl bg-white/95 px-6 py-4 shadow-xl">
            <span className="text-6xl">{item.emoji}</span>
            <span className="text-xl font-black text-indigo-900">{item.label}</span>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            {round.buckets.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={(ev) => place(b.id, ev)}
                className="ui-press flex min-h-36 flex-col items-center justify-between gap-2 rounded-3xl border-4 border-slate-200 bg-white p-3 shadow-lg hover:scale-[1.02]"
              >
                <span className="text-3xl">{b.emoji}</span>
                <span className="text-base font-black text-indigo-800">{b.label}</span>
                <span className="flex min-h-8 flex-wrap items-center justify-center gap-1">
                  {(placed[b.id] ?? []).map((p) => (
                    <span key={p.id} className="text-2xl">
                      {p.emoji}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>

        {msg ? (
          <p className="animate-pop rounded-3xl bg-indigo-100 px-6 py-3 text-center text-base font-extrabold text-indigo-800 shadow-lg">
            💡 {msg}
          </p>
        ) : null}
      </div>
    </GameShell>
  );
}
