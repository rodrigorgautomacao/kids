import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import { StarItem } from '../art';
import { bestScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, ring, shake } from '../../lib/fx';
import { shuffle } from '../../lib/minigame';
import { levelMapItems, useLevelState, type GameLevel } from '../../lib/levels';
import SpeakChip from '../SpeakChip';

// ── Conte com a Bíblia (níveis) ──────────────────────────────────────────
// Contagem e soma/subtração com os elementos da história.

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
  levels: GameLevel<CountRound>[];
  onExit: () => void;
}

const PTS_ACERTO = 100;

export default function CountGame({
  gameId,
  title,
  subtitle,
  bg,
  titleClass,
  levels,
  onExit,
}: CountGameProps) {
  const reducedMotion = usePrefersReducedMotion();
  const ls = useLevelState(gameId, levels);
  const round = ls.round;
  const [order, setOrder] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState<{ text: string; good: boolean; ref?: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(gameId);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (!round) return;
    setOrder(shuffle(round.options));
    setPicked(null);
    setWon(false);
    setMsg(null);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ls.phase !== 'playing' || !round) return;
    const t = window.setTimeout(() => voice.speak(round.question), 400);
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handlePick(num: number, ev: { currentTarget: HTMLElement }) {
    if (picked !== null || won || ls.phase !== 'playing' || !round) return;
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
        ls.completeRound();
        setWon(false);
      }, 2400);
    } else {
      sfx.wrong();
      ls.addWrong();
      shake(el);
      setMsg({ text: 'Quase! Conta de novo com calma. ✊', good: false });
      voice.speak(`${num}. Quase! Conta de novo!`);
      later(() => setPicked(null), 900);
    }
  }

  if (ls.phase === 'done') {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-lime-100 via-emerald-50 to-teal-100 px-6">
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
        <p className="-mt-1 text-sm font-black text-teal-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={() => {
            setScore(0);
            ls.replayLevel();
          }}
          className="ui-press rounded-full bg-teal-400 px-8 py-3 text-lg font-black text-teal-950 shadow-[0_6px_0_rgba(13,148,136,0.9)]"
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

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={ls.levelIdx + 1} totalLevels={levels.length} step={ls.roundIdx + 1} steps={ls.level.rounds.length} />
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
            <button
              type="button"
              onClick={() => {
                sfx.pop();
                ls.setMapOpen(true);
              }}
              className="ui-press rounded-full bg-white/85 px-3 py-2 text-sm font-black text-teal-700 shadow"
            >
              🗺️
            </button>
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
            <div key={num} className="relative flex">
              <button
                type="button"
                disabled={won || picked === num}
                onClick={(ev) => handlePick(num, ev)}
                className={`ui-press flex min-h-24 flex-1 items-center justify-center rounded-3xl border-4 text-5xl font-black shadow-lg transition-transform ${
                  picked === num && num === round.correct
                    ? 'animate-pop border-emerald-400 bg-emerald-50 text-emerald-700'
                    : picked === num
                      ? 'border-rose-200 bg-rose-50 text-rose-300'
                      : 'border-slate-200 bg-white text-indigo-800 hover:scale-105'
                }`}
              >
                {num}
              </button>
              <SpeakChip text={String(num)} className="absolute right-1.5 top-1.5" />
            </div>
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
