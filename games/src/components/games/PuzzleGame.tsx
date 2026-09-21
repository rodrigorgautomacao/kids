import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { Backdrop, StarItem } from '../art';
import type { BackdropId } from '../../data/scenes';
import { bestScore, submitScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst } from '../../lib/fx';

// ── Quebra-Cabeça Bíblico ────────────────────────────────────────────────
// A imagem de uma cena (`Backdrop`) é cortada em N×N peças e embaralhada.
// A criança toca em duas peças para trocá-las até remontar a cena. Tem a
// miniatura do alvo em cima, então não depende de leitura.
//
// Gesto de 1 toque por peça (sem arrastar). Erro não pune: só troca de lugar.
// Estrelas pelas trocas: quanto menos trocas, mais estrelas.

export interface PuzzleRound {
  id: string;
  ref: string;
  backdrop: BackdropId;
  label: string;
}

interface PuzzleGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  grid: 2 | 3;
  rounds: PuzzleRound[];
  onExit: () => void;
}

function shuffledOrder(n: number): number[] {
  const arr = Array.from({ length: n * n }, (_, i) => i);
  // Garante que não comece resolvido.
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (arr.every((v, i) => v === i));
  return arr;
}

export default function PuzzleGame({
  gameId,
  title,
  subtitle,
  bg,
  titleClass,
  grid,
  rounds,
  onExit,
}: PuzzleGameProps) {
  const reducedMotion = usePrefersReducedMotion();
  const n = grid;
  const [idx, setIdx] = useState(0);
  const [order, setOrder] = useState<number[]>(() => shuffledOrder(n));
  const [selected, setSelected] = useState<number | null>(null);
  const [swaps, setSwaps] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(3);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(gameId);
  const round = rounds[idx];

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (idx >= rounds.length) return;
    setOrder(shuffledOrder(n));
    setSelected(null);
    const t = window.setTimeout(() => voice.speak(`${rounds[idx].label}. Monte a cena!`), 350);
    return () => window.clearTimeout(t);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handleTap(pos: number, ev: { currentTarget: HTMLElement }) {
    if (finished) return;
    sfx.pop();
    if (selected === null) {
      setSelected(pos);
      return;
    }
    if (selected === pos) {
      setSelected(null);
      return;
    }

    const next = [...order];
    [next[selected], next[pos]] = [next[pos], next[selected]];
    const nextSwaps = swaps + 1;
    setOrder(next);
    setSwaps(nextSwaps);
    setSelected(null);

    const box = stageRef.current?.getBoundingClientRect();
    const r = ev.currentTarget.getBoundingClientRect();
    burst(stageRef.current, r.left + r.width / 2 - (box?.left ?? 0), r.top + r.height / 2 - (box?.top ?? 0), {
      kind: 'dust',
      count: 6,
    });

    if (next.every((tile, i) => tile === i)) {
      sfx.collect();
      voice.speak('Isso! A cena ficou pronta!');
      later(() => {
        if (idx + 1 >= rounds.length) {
          const limit3 = n === 2 ? 1 : 3;
          const limit2 = n === 2 ? 4 : 8;
          setStars(nextSwaps <= limit3 ? 3 : nextSwaps <= limit2 ? 2 : 1);
          setFinished(true);
          submitScore(gameId, 100 * rounds.length + Math.max(0, 400 - nextSwaps * 10));
        } else {
          setIdx((i) => i + 1);
          setSwaps(0);
        }
      }, 1100);
    }
  }

  function handleReplay() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setIdx(0);
    setOrder(shuffledOrder(n));
    setSelected(null);
    setSwaps(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-sky-100 via-indigo-50 to-purple-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={stars}
          onExit={onExit}
          headline={stars === 3 ? 'Incrível! ⭐⭐⭐' : stars === 2 ? 'Muito bem! ⭐⭐' : 'Bom esforço! ⭐'}
        />
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

  if (!round) return null;

  return (
    <GameShell title={title} subtitle={subtitle} onExit={onExit} bg={bg} titleClass={titleClass}>
      <div className="relative flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={1} totalLevels={1} step={idx + 1} steps={rounds.length} />
          <div className="flex items-center gap-2">
            {record > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-indigo-700 shadow">
                🏆 {record}
              </span>
            ) : null}
            <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-2 text-sm font-black text-amber-900 shadow">
              <StarItem size={16} /> Trocas: {swaps}
            </span>
          </div>
        </div>

        <div className="flex w-full items-center gap-4 rounded-3xl bg-white/95 px-4 py-3 shadow-xl">
          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-slate-200">
            <Backdrop id={round.backdrop} />
          </div>
          <div>
            <p className="text-lg font-black text-indigo-900">Monte a cena: {round.label}</p>
            <p className="text-xs font-bold text-slate-400">Toque em duas peças para trocá-las de lugar.</p>
          </div>
        </div>

        <div
          ref={stageRef}
          className="relative grid w-full gap-1.5 rounded-2xl bg-white p-1.5 shadow-xl"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {order.map((tile, pos) => {
            const row = Math.floor(tile / n);
            const col = tile % n;
            const correct = tile === pos;
            return (
              <button
                key={pos}
                type="button"
                onClick={(ev) => handleTap(pos, ev)}
                aria-label={`Peça ${pos + 1}`}
                className={`relative overflow-hidden rounded-lg border-2 transition-transform ${
                  selected === pos ? 'scale-95 border-amber-400 ring-4 ring-amber-300' : correct ? 'border-emerald-300' : 'border-slate-200'
                }`}
                style={{ aspectRatio: '4 / 3' }}
              >
                <div
                  className="absolute"
                  style={{
                    width: `${n * 100}%`,
                    height: `${n * 100}%`,
                    left: `-${col * 100}%`,
                    top: `-${row * 100}%`,
                  }}
                >
                  <Backdrop id={round.backdrop} />
                </div>
                {selected === pos ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-amber-300/20" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
