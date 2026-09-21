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
import { shuffle, starsForWrong } from '../../lib/minigame';
import { isSmallKidsMode } from '../../lib/prefs';

// ── Motor de "coloque na ordem" (5–6 e 7–9) ──────────────────────────────
// Compartilhado por "A História em Ordem" e "Linha do Tempo".
//
// Mecânica: os passos aparecem embaralhados e a criança toca no que vem
// PRIMEIRO, depois no próximo… Cada acerto ganha um número de ordem. Errar não
// pune: a peça treme e a dica diz qual é o próximo passo. 1 toque por decisão
// (nada de arrastar, que é difícil em tela pequena).

export interface OrderStep {
  id: string;
  emoji: string;
  label: string;
}

export interface OrderRound {
  id: string;
  ref: string;
  title: string;
  steps: OrderStep[]; // na ordem correta
}

interface OrderGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  /** Instrução fixa mostrada acima das peças. */
  intro: string;
  rounds: OrderRound[];
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
  rounds,
  onExit,
}: OrderGameProps) {
  const smallKids = isSmallKidsMode();
  const reducedMotion = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [order, setOrder] = useState<OrderStep[]>(() => shuffle(rounds[0].steps));
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(3);
  const [msg, setMsg] = useState<string | null>(null);
  const wrongRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(gameId);
  const round = rounds[idx];

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  // Nova rodada: embaralha as peças e narra o pedido.
  useEffect(() => {
    if (finished) return;
    setOrder(shuffle(rounds[idx].steps));
    setPlaced([]);
    setMsg(null);
    const t = window.setTimeout(() => voice.speak(rounds[idx].title), 350);
    return () => window.clearTimeout(t);
  }, [idx, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // Modo pequeninos: narra os passos depois do pedido.
  useEffect(() => {
    if (finished || !smallKids) return;
    const t = window.setTimeout(
      () => voice.speakQueue(rounds[idx].steps.map((s) => s.label)),
      Math.min(3500, Math.max(2200, rounds[idx].title.length * 32)),
    );
    return () => window.clearTimeout(t);
  }, [idx, finished, smallKids]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTap(step: OrderStep, ev: { currentTarget: HTMLElement }) {
    if (finished || placed.includes(step.id)) return;
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
          if (idx + 1 >= rounds.length) {
            setStars(starsForWrong(wrongRef.current));
            setFinished(true);
            submitScore(gameId, score + PTS_PASSO);
            voice.speak('Muito bem! Você montou tudo na ordem certa!');
          } else {
            setIdx((i) => i + 1);
          }
        }, 900);
      }
    } else {
      sfx.wrong();
      shake(el);
      wrongRef.current += 1;
      setWrongTotal((w) => w + 1);
      setMsg(`Quase! Agora é a vez de: ${expected.label}`);
      voice.speak('Quase! Tenta outra vez.');
    }
  }

  function handleReplay() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setIdx(0);
    setOrder(shuffle(rounds[0].steps));
    setPlaced([]);
    setScore(0);
    setWrongTotal(0);
    wrongRef.current = 0;
    setFinished(false);
    setMsg(null);
  }

  if (finished) {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-amber-100 via-rose-50 to-sky-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={stars}
          onExit={onExit}
          wrong={wrongTotal}
          headline={stars === 3 ? 'Incrível! ⭐⭐⭐' : stars === 2 ? 'Muito bem! ⭐⭐' : 'Bom esforço! ⭐'}
        />
        <p className="-mt-1 text-sm font-black text-amber-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={handleReplay}
          className="ui-press rounded-full bg-amber-400 px-8 py-3 text-lg font-black text-amber-950 shadow-[0_6px_0_rgba(202,138,4,0.9)]"
        >
          Jogar de novo 🔁
        </button>
      </div>
    );
  }

  const totalSteps = round.steps.length;

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={idx + 1} totalLevels={rounds.length} step={placed.length} steps={totalSteps} />
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
              <button
                key={step.id}
                type="button"
                onClick={(ev) => handleTap(step, ev)}
                disabled={done}
                className={`ui-press relative flex flex-col items-center gap-2 rounded-3xl border-4 bg-white px-3 py-4 shadow-lg ${
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
            );
          })}
        </div>

        {msg ? (
          <p className="animate-pop rounded-3xl bg-rose-100 px-6 py-3 text-center text-base font-extrabold text-rose-700 shadow-lg">
            💡 {msg}
          </p>
        ) : null}
      </div>
    </GameShell>
  );
}
