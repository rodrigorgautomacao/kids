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
import { shuffle } from '../../lib/minigame';
import { levelMapItems, useLevelState, type GameLevel } from '../../lib/levels';
import { isSmallKidsMode } from '../../lib/prefs';
import SpeakChip from '../SpeakChip';

// ── Motor "coloque na ordem" (níveis) ────────────────────────────────────

export interface OrderStep {
  id: string;
  emoji: string;
  label: string;
}

export interface OrderRound {
  id: string;
  ref: string;
  title: string;
  steps: OrderStep[];
}

interface OrderGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  intro: string;
  levels: GameLevel<OrderRound>[];
  onExit: () => void;
}

const PTS_PASSO = 100;

export default function OrderGame({
  gameId,
  title,
  subtitle,
  bg,
  titleClass,
  intro,
  levels,
  onExit,
}: OrderGameProps) {
  const smallKids = isSmallKidsMode();
  const reducedMotion = usePrefersReducedMotion();
  const ls = useLevelState(gameId, levels);
  const round = ls.round;
  const [order, setOrder] = useState<OrderStep[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(gameId);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (!round) return;
    setOrder(shuffle(round.steps));
    setPlaced([]);
    setMsg(null);
    const t = window.setTimeout(() => voice.speak(round.title), 350);
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ls.phase !== 'playing' || !smallKids || !round) return;
    const t = window.setTimeout(
      () => voice.speakQueue(round.steps.map((s) => s.label)),
      Math.min(3500, Math.max(2200, round.title.length * 32)),
    );
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase, smallKids]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handleTap(step: OrderStep, ev: { currentTarget: HTMLElement }) {
    if (ls.phase !== 'playing' || !round || placed.includes(step.id)) return;
    const expected = round.steps[placed.length];
    const el = ev.currentTarget;
    const box = stageRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - (box?.left ?? 0);
    const y = r.top + r.height / 2 - (box?.top ?? 0);

    if (step.id === expected.id) {
      sfx.correct(placed.length);
      burst(stageRef.current, x, y, { kind: 'spark', count: 14 });
      flyNumber(stageRef.current, x, y, `+${PTS_PASSO}`);
      setScore((s) => s + PTS_PASSO);
      const next = [...placed, step.id];
      setPlaced(next);
      setMsg(null);

      if (next.length === round.steps.length) {
        later(() => {
          ls.completeRound();
          setMsg(null);
        }, 900);
      }
    } else {
      sfx.wrong();
      shake(el);
      ls.addWrong();
      setMsg(`Quase! Agora é a vez de: ${expected.label}`);
      voice.speak('Quase! Tenta outra vez.');
    }
  }

  if (ls.phase === 'done') {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-amber-100 via-rose-50 to-sky-100 px-6">
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
        <p className="-mt-1 text-sm font-black text-amber-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={() => {
            setScore(0);
            ls.replayLevel();
          }}
          className="ui-press rounded-full bg-amber-400 px-8 py-3 text-lg font-black text-amber-950 shadow-[0_6px_0_rgba(202,138,4,0.9)]"
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

  if (!round) return null;

  const totalSteps = round.steps.length;

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={ls.levelIdx + 1} totalLevels={levels.length} step={placed.length} steps={totalSteps} />
          <div className="flex items-center gap-2">
            {score > 0 ? (
              <span className="ui-press flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-900 shadow">
                <StarItem size={18} /> {score}
              </span>
            ) : null}
            {record > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-amber-700 shadow">
                🏆 {Math.max(record, score)}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                sfx.pop();
                ls.setMapOpen(true);
              }}
              className="ui-press rounded-full bg-white/85 px-3 py-2 text-sm font-black text-amber-700 shadow"
            >
              🗺️
            </button>
          </div>
        </div>

        <div className="w-full rounded-3xl bg-white/95 px-5 py-3 text-center shadow-xl">
          <p className="text-sm font-bold text-slate-500">{intro}</p>
          <p className="text-xl font-black text-indigo-900">{round.title}</p>
        </div>

        <div ref={stageRef} className="relative grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {order.map((step) => {
            const pos = placed.indexOf(step.id);
            const done = pos >= 0;
            return (
              <div key={step.id} className="relative flex">
              <button
                type="button"
                onClick={(ev) => handleTap(step, ev)}
                disabled={done}
                className={`ui-press relative flex flex-1 flex-col items-center gap-2 rounded-3xl border-4 bg-white px-3 py-4 shadow-lg ${
                  done ? 'animate-pop border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:scale-105'
                } ${smallKids ? 'min-h-36' : 'min-h-28'}`}
              >
                {done ? (
                  <span className="absolute -top-3 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-lg font-black text-white shadow">
                    {pos + 1}
                  </span>
                ) : null}
                <span className={smallKids ? 'text-5xl' : 'text-4xl'}>{step.emoji}</span>
                <span className="text-xs leading-tight font-black text-slate-700">{step.label}</span>
              </button>
              <SpeakChip text={step.label} className="absolute right-1.5 top-1.5" />
              </div>
            );
          })}
        </div>

        {msg ? (
          <p className="animate-pop rounded-3xl bg-rose-100 px-6 py-3 text-center text-base font-extrabold text-rose-700 shadow-lg">
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
