import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import { Motif, StarItem } from '../art';
import { bestScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, ring, shake } from '../../lib/fx';
import { shuffle } from '../../lib/minigame';
import { levelMapItems, useLevelState, type GameLevel } from '../../lib/levels';
import { isSmallKidsMode } from '../../lib/prefs';
import SpeakChip from '../SpeakChip';

// ── Motor de "escolha uma opção" com variantes visuais e níveis ──────────
//   'grid' | 'target' | 'shadow' | 'bool' | 'quote' | 'verse'

export interface ChoiceOption {
  id: string;
  label?: string;
  emoji?: string;
  motif?: string;
}

export interface ChoiceRound {
  prompt: string;
  detail?: string;
  target?: { emoji?: string; motif?: string; label?: string };
  options: ChoiceOption[];
  correct: string;
  ref: string;
  msg: string;
  speak?: string;
}

export type ChoiceVariant = 'grid' | 'target' | 'shadow' | 'bool' | 'quote' | 'verse';

interface ChoiceGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  variant: ChoiceVariant;
  levels: GameLevel<ChoiceRound>[];
  onExit: () => void;
}

const PTS_ACERTO = 100;

export default function ChoiceGame({
  gameId,
  title,
  subtitle,
  bg,
  titleClass,
  variant,
  levels,
  onExit,
}: ChoiceGameProps) {
  const smallKids = isSmallKidsMode();
  const reducedMotion = usePrefersReducedMotion();
  const ls = useLevelState(gameId, levels);
  const round = ls.round;
  const [order, setOrder] = useState<ChoiceOption[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
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

  const narrate = () => {
    if (!round) return;
    voice.speak(round.speak ?? [round.prompt, round.detail].filter(Boolean).join(' … '));
  };

  useEffect(() => {
    if (ls.phase !== 'playing' || !round) return;
    const t = window.setTimeout(narrate, 400);
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ls.phase !== 'playing' || !smallKids || !round) return;
    const labels = round.options.map((o) => o.label ?? o.id);
    const t = window.setTimeout(
      () => voice.speakQueue(labels),
      Math.min(4000, Math.max(2400, (round.speak ?? round.prompt).length * 32)),
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

  function handlePick(opt: ChoiceOption, ev: { currentTarget: HTMLElement }) {
    if (picked || won || ls.phase !== 'playing' || !round) return;
    const el = ev.currentTarget;
    const box = stageRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - (box?.left ?? 0);
    const y = r.top + r.height / 2 - (box?.top ?? 0);
    setPicked(opt.id);

    if (opt.id === round.correct) {
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
      setMsg({ text: 'Quase! Tenta de novo! ✊', good: false });
      voice.speak(`${opt.label ?? opt.id}. Quase! Tenta de novo!`);
      later(() => setPicked(null), 900);
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

  const isBool = variant === 'bool';
  const optionClass = (opt: ChoiceOption) => {
    const chosen = picked === opt.id;
    const isRight = chosen && opt.id === round.correct;
    return `ui-press flex flex-col items-center justify-center gap-2 rounded-3xl border-4 shadow-lg transition-transform ${
      isRight
        ? 'animate-pop border-emerald-400 bg-emerald-50'
        : chosen
          ? 'border-rose-200 bg-rose-50'
          : 'border-slate-200 bg-white hover:scale-105'
    }`;
  };

  const optionContent = (opt: ChoiceOption, big: boolean) => (
    <>
      {opt.motif ? <Motif id={opt.motif} size={big ? 96 : 72} /> : null}
      {opt.emoji ? <span className={big ? 'text-6xl' : 'text-5xl'}>{opt.emoji}</span> : null}
      {opt.label ? (
        <span className={`text-center font-black text-indigo-800 ${big ? 'text-lg' : 'text-sm'}`}>
          {opt.label}
        </span>
      ) : null}
    </>
  );

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD
            level={ls.levelIdx + 1}
            totalLevels={levels.length}
            step={ls.roundIdx + 1}
            steps={ls.level.rounds.length}
          />
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
              className="ui-press rounded-full bg-white/85 px-3 py-2 text-sm font-black text-indigo-700 shadow"
            >
              🗺️
            </button>
          </div>
        </div>

        <div className="relative w-full rounded-3xl bg-white/95 px-6 py-4 text-center shadow-xl">
          {variant === 'shadow' && round.target?.motif ? (
            <div className="mx-auto mb-2 w-fit rounded-2xl bg-slate-900 p-3">
              <div style={{ filter: 'brightness(0)' }}>
                <Motif id={round.target.motif} size={110} />
              </div>
            </div>
          ) : null}
          {variant === 'target' && round.target ? (
            <div className="mx-auto mb-2 flex w-fit items-center justify-center rounded-2xl bg-amber-50 p-3">
              {round.target.motif ? <Motif id={round.target.motif} size={110} /> : null}
              {round.target.emoji ? <span className="text-6xl">{round.target.emoji}</span> : null}
            </div>
          ) : null}

          {variant === 'quote' && round.detail ? (
            <p className="text-xl leading-snug font-black text-indigo-900 italic">“{round.detail}”</p>
          ) : null}
          {variant === 'verse' && round.detail ? (
            <p className="text-2xl leading-snug font-black text-indigo-900">
              {round.detail.includes('___') ? (
                <>
                  {round.detail.split('___')[0]}
                  <span className={won ? 'text-emerald-600' : 'text-violet-500'}>
                    {won ? (round.options.find((o) => o.id === round.correct)?.label ?? '') : '______'}
                  </span>
                  {round.detail.split('___')[1]}
                </>
              ) : (
                round.detail
              )}
            </p>
          ) : null}

          {variant !== 'quote' && variant !== 'verse' ? (
            <p className="text-xl font-black text-indigo-900">{round.prompt}</p>
          ) : (
            <p className="mt-1 text-sm font-bold text-slate-500">{round.prompt}</p>
          )}

          <button
            type="button"
            onClick={() => {
              sfx.pop();
              narrate();
            }}
            aria-label="Ouvir de novo"
            className="ui-press absolute top-2 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={stageRef}
          className={`relative grid w-full gap-3 ${
            isBool ? 'grid-cols-2' : round.options.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'
          }`}
        >
          {order.map((opt) => (
            <div key={opt.id} className="relative flex">
              <button
                type="button"
                disabled={won || picked === opt.id}
                onClick={(ev) => handlePick(opt, ev)}
                className={`${optionClass(opt)} flex-1 ${isBool ? 'min-h-40' : smallKids ? 'min-h-36 px-3 py-4' : 'min-h-28 px-3 py-4'}`}
              >
                {isBool ? (
                  <span className="text-7xl">{opt.emoji ?? (opt.id === 'sim' ? '✅' : '❌')}</span>
                ) : (
                  optionContent(opt, smallKids)
                )}
              </button>
              <SpeakChip text={opt.label ?? opt.id} className="absolute right-1.5 top-1.5" />
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
