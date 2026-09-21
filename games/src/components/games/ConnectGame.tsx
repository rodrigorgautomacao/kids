import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import { Motif, StarItem } from '../art';
import { bestScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, shake } from '../../lib/fx';
import { shuffle } from '../../lib/minigame';
import { levelMapItems, useLevelState, type GameLevel } from '../../lib/levels';
import SpeakChip from '../SpeakChip';

// ── Ligue os Pares (níveis) ──────────────────────────────────────────────

export interface ConnectPair {
  id: string;
  left: { emoji?: string; motif?: string; label: string };
  right: { emoji?: string; motif?: string; label: string };
}

export interface ConnectRound {
  id: string;
  ref: string;
  pairs: ConnectPair[];
}

interface ConnectGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  intro: string;
  levels: GameLevel<ConnectRound>[];
  onExit: () => void;
}

const PTS_PAR = 100;

export default function ConnectGame({
  gameId,
  title,
  subtitle,
  bg,
  titleClass,
  intro,
  levels,
  onExit,
}: ConnectGameProps) {
  const reducedMotion = usePrefersReducedMotion();
  const ls = useLevelState(gameId, levels);
  const round = ls.round;
  const [left, setLeft] = useState<ConnectPair[]>([]);
  const [right, setRight] = useState<ConnectPair[]>([]);
  const [linked, setLinked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
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
    setLeft(shuffle(round.pairs));
    setRight(shuffle(round.pairs));
    setLinked(new Set());
    setSelected(null);
    setMsg(null);
    const t = window.setTimeout(() => voice.speak(round.pairs.map((p) => p.left.label).join(', ')), 350);
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function tapRight(pair: ConnectPair, ev: { currentTarget: HTMLElement }) {
    if (ls.phase !== 'playing' || linked.has(pair.id) || !round) return;
    if (selected === null) {
      setMsg('Primeiro toque em uma figura da esquerda!');
      return;
    }
    if (selected === pair.id) {
      const el = ev.currentTarget;
      const box = stageRef.current?.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2 - (box?.left ?? 0);
      const y = r.top + r.height / 2 - (box?.top ?? 0);
      const next = new Set([...linked, pair.id]);
      sfx.correct();
      burst(stageRef.current, x, y, { kind: 'spark', count: 14 });
      flyNumber(stageRef.current, x, y, `+${PTS_PAR}`);
      setLinked(next);
      setSelected(null);
      setScore((s) => s + PTS_PAR);
      setMsg('Isso! Par certo! 🎉');

      if (next.size === round.pairs.length) {
        later(() => {
          ls.completeRound();
          setMsg(null);
        }, 900);
      }
    } else {
      sfx.wrong();
      shake(ev.currentTarget);
      ls.addWrong();
      setMsg('Quase! Esse não é o par. Tenta outra vez. ✊');
    }
  }

  if (ls.phase === 'done') {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-emerald-100 via-teal-50 to-cyan-100 px-6">
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
        <p className="-mt-1 text-sm font-black text-emerald-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={() => {
            setScore(0);
            ls.replayLevel();
          }}
          className="ui-press rounded-full bg-emerald-400 px-8 py-3 text-lg font-black text-emerald-950 shadow-[0_6px_0_rgba(5,150,105,0.9)]"
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

  const tile = (p: ConnectPair, side: 'left' | 'right') => {
    const data = side === 'left' ? p.left : p.right;
    const done = linked.has(p.id);
    const isSel = selected === p.id && side === 'left';
    return (
      <div key={`${side}-${p.id}`} className="relative flex">
        <button
          type="button"
          disabled={done || (side === 'left' && selected !== null && !isSel)}
          onClick={(ev) => {
            if (side === 'left') {
              if (done) return;
              sfx.pop();
              setSelected(p.id);
              setMsg(null);
            } else {
              tapRight(p, ev);
            }
          }}
          className={`ui-press flex min-h-20 flex-1 items-center gap-2 rounded-2xl border-4 px-3 py-2 pr-10 shadow ${
            done ? 'border-emerald-400 bg-emerald-50' : isSel ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'
          }`}
        >
          {data.motif ? <Motif id={data.motif} size={44} /> : null}
          {data.emoji ? <span className="text-3xl">{data.emoji}</span> : null}
          <span className="text-sm font-black text-indigo-800">{data.label}</span>
        </button>
        <SpeakChip text={data.label} className="absolute right-1.5 top-1/2 -translate-y-1/2" />
      </div>
    );
  };

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={ls.levelIdx + 1} totalLevels={levels.length} step={linked.size} steps={round.pairs.length} />
          <div className="flex items-center gap-2">
            {score > 0 ? (
              <span className="ui-press flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-900 shadow">
                <StarItem size={18} /> {score}
              </span>
            ) : null}
            {record > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-emerald-700 shadow">
                🏆 {Math.max(record, score)}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                sfx.pop();
                ls.setMapOpen(true);
              }}
              className="ui-press rounded-full bg-white/85 px-3 py-2 text-sm font-black text-emerald-700 shadow"
            >
              🗺️
            </button>
          </div>
        </div>

        <p className="rounded-2xl bg-white/90 px-4 py-2 text-center text-sm font-black text-emerald-800 shadow">
          {intro}
        </p>

        <div ref={stageRef} className="relative grid w-full grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">{left.map((p) => tile(p, 'left'))}</div>
          <div className="flex flex-col gap-3">{right.map((p) => tile(p, 'right'))}</div>
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
