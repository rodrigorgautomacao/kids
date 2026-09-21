import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import { StarItem } from '../art';
import { bestScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, shake } from '../../lib/fx';
import { levelMapItems, useLevelState, type GameLevel } from '../../lib/levels';
import SpeakChip from '../SpeakChip';

// ── Separe por Testamento (níveis) ───────────────────────────────────────

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
  levels: GameLevel<SortRound>[];
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
  levels,
  onExit,
}: SortGameProps) {
  const reducedMotion = usePrefersReducedMotion();
  const ls = useLevelState(gameId, levels);
  const round = ls.round;
  const [itemIdx, setItemIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [placed, setPlaced] = useState<Record<string, SortItem[]>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(gameId);
  const item = round?.items[itemIdx];

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (!round) return;
    setItemIdx(0);
    setPlaced({});
    setMsg(null);
    const t = window.setTimeout(() => voice.speak(round.items[0]?.label ?? ''), 350);
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function place(bucketId: string, ev: { currentTarget: HTMLElement }) {
    if (!item || ls.phase !== 'playing') return;
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
          ls.completeRound();
          setMsg(null);
        }, 900);
      } else {
        setItemIdx(nextItem);
        later(() => voice.speak(round.items[nextItem].label), 700);
      }
    } else {
      sfx.wrong();
      shake(ev.currentTarget);
      ls.addWrong();
      setMsg('Quase! Pensa: essa história é antes ou depois de Jesus? ✊');
      voice.speak('Quase! Tenta o outro cesto!');
    }
  }

  if (ls.phase === 'done') {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-indigo-100 via-sky-50 to-cyan-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={ls.stars}
          wrong={ls.wrong}
          onNext={ls.hasNextLevel ? ls.goNextLevel : undefined}
          onExit={onExit}
          onOpenMap={() => ls.setMapOpen(true)}
        />
        <p className="-mt-1 text-sm font-black text-indigo-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={() => {
            setScore(0);
            ls.replayLevel();
          }}
          className="ui-press rounded-full bg-indigo-400 px-8 py-3 text-lg font-black text-indigo-950 shadow-[0_6px_0_rgba(99,102,241,0.9)]"
        >
          Jogar de novo 🔁
        </button>
        {ls.mapOpen ? (
          <LevelMap
            title="Níveis"
            subtitle="Escolha um nível para jogar"
            items={levelMapItems(gameId, levels, (i) => `Nível ${i + 1}`)}
            onPick={(id) => ls.goToLevel(levels.findIndex((l) => l.id === id))}
            onClose={() => ls.setMapOpen(false)}
          />
        ) : null}
      </div>
    );
  }

  if (!round || !item) return null;

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={ls.levelIdx + 1} totalLevels={levels.length} step={itemIdx} steps={round.items.length} />
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
            <button
              type="button"
              onClick={() => {
                sfx.pop();
                ls.setMapOpen(true);
              }}
              className="ui-press rounded-full bg-white/85 px-3 py-2 text-sm font-black text-indigo-700 shadow"
            >
              🗺️
            </button>
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
              <div key={b.id} className="relative flex">
                <button
                  type="button"
                  onClick={(ev) => place(b.id, ev)}
                  className="ui-press flex min-h-36 flex-1 flex-col items-center justify-between gap-2 rounded-3xl border-4 border-slate-200 bg-white p-3 pr-10 shadow-lg hover:scale-[1.02]"
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
                <SpeakChip text={b.label} className="absolute right-1.5 top-1.5" />
              </div>
            ))}
          </div>
        </div>

        {msg ? (
          <p className="animate-pop rounded-3xl bg-indigo-100 px-6 py-3 text-center text-base font-extrabold text-indigo-800 shadow-lg">
            💡 {msg}
          </p>
        ) : null}

        {ls.mapOpen ? (
          <LevelMap
            title="Níveis"
            subtitle="Escolha um nível para jogar"
            items={levelMapItems(gameId, levels, (i) => `Nível ${i + 1}`)}
            onPick={(id) => ls.goToLevel(levels.findIndex((l) => l.id === id))}
            onClose={() => ls.setMapOpen(false)}
          />
        ) : null}
      </div>
    </GameShell>
  );
}
