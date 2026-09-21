import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import { Backdrop, StarItem } from '../art';
import type { BackdropId } from '../../data/scenes';
import { bestScore, submitScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst } from '../../lib/fx';
import { levelMapItems, useLevelState, type GameLevel } from '../../lib/levels';

// ── Quebra-Cabeça Bíblico (níveis) ───────────────────────────────────────
// Cada nível é uma cena cortada em mais peças que o anterior. O 1º nível tem
// 4 peças (2×2) e o 10º chega a 36 (6×6) — a criança troca duas peças de lugar
// por vez até remontar a imagem. Miniatura do alvo em cima (não depende de ler).

export interface PuzzleLevel {
  id: string;
  ref: string;
  backdrop: BackdropId;
  label: string;
  rows: number;
  cols: number;
}

interface PuzzleGameProps {
  gameId: string;
  title: string;
  subtitle: string;
  bg: string;
  titleClass: string;
  levels: GameLevel<PuzzleLevel>[];
  onExit: () => void;
}

function shuffledOrder(count: number): number[] {
  const arr = Array.from({ length: count }, (_, i) => i);
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
  levels,
  onExit,
}: PuzzleGameProps) {
  const reducedMotion = usePrefersReducedMotion();
  const ls = useLevelState(gameId, levels);
  const puzzle = ls.round;
  const total = puzzle ? puzzle.rows * puzzle.cols : 0;

  const [order, setOrder] = useState<number[]>(() => shuffledOrder(total));
  const [selected, setSelected] = useState<number | null>(null);
  const [swaps, setSwaps] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(gameId);

  // Nova cena: embaralha as peças e narra o pedido.
  useEffect(() => {
    if (!puzzle || ls.phase !== 'playing') return;
    setOrder(shuffledOrder(puzzle.rows * puzzle.cols));
    setSelected(null);
    setSwaps(0);
    const t = window.setTimeout(() => voice.speak(`${puzzle.label}. Monte a cena!`), 350);
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handleTap(pos: number, ev: { currentTarget: HTMLElement }) {
    if (ls.phase !== 'playing' || !puzzle) return;
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
    setOrder(next);
    setSwaps((s) => s + 1);
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
      submitScore(gameId, 100 * levels.length + Math.max(0, 600 - swaps * 10));
      ls.completeRound();
    }
  }

  if (ls.phase === 'done') {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-sky-100 via-indigo-50 to-purple-100 px-6">
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
        <button
          type="button"
          onClick={ls.replayLevel}
          className="ui-press rounded-full bg-indigo-400 px-8 py-3 text-lg font-black text-indigo-950 shadow-[0_6px_0_rgba(99,102,241,0.9)]"
        >
          Jogar de novo 🔁
        </button>
        {ls.mapOpen ? (
          <LevelMap
            title="Níveis"
            subtitle="Escolha um nível para jogar"
            items={levelMapItems(gameId, levels, (i) => `Nível ${i + 1}`, (_i, lv) => lv.name ?? '', (_i, lv) => `${(lv.rounds[0]?.rows ?? 0) * (lv.rounds[0]?.cols ?? 0)} peças`)}
            onPick={(id) => ls.goToLevel(levels.findIndex((l) => l.id === id))}
            onClose={() => ls.setMapOpen(false)}
          />
        ) : null}
      </div>
    );
  }

  if (!puzzle) return null;

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
            {record > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-indigo-700 shadow">
                🏆 {record}
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

        <div className="flex w-full items-center gap-4 rounded-3xl bg-white/95 px-4 py-3 shadow-xl">
          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-slate-200">
            <Backdrop id={puzzle.backdrop} />
          </div>
          <div>
            <p className="text-lg font-black text-indigo-900">Monte a cena: {puzzle.label}</p>
            <p className="text-xs font-bold text-slate-400">
              {puzzle.rows * puzzle.cols} peças · toque em duas para trocá-las de lugar
            </p>
          </div>
        </div>

        <div
          ref={stageRef}
          className="relative grid w-full gap-1 rounded-2xl bg-white p-1.5 shadow-xl"
          style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
        >
          {order.map((tile, pos) => {
            const row = Math.floor(tile / puzzle.cols);
            const col = tile % puzzle.cols;
            const correct = tile === pos;
            return (
              <button
                key={pos}
                type="button"
                onClick={(ev) => handleTap(pos, ev)}
                aria-label={`Peça ${pos + 1}`}
                className={`relative overflow-hidden rounded-md border transition-transform ${
                  selected === pos
                    ? 'scale-95 border-amber-400 ring-4 ring-amber-300'
                    : correct
                      ? 'border-emerald-300'
                      : 'border-slate-200'
                }`}
                style={{ aspectRatio: '4 / 3' }}
              >
                <div
                  className="absolute"
                  style={{
                    width: `${puzzle.cols * 100}%`,
                    height: `${puzzle.rows * 100}%`,
                    left: `-${col * 100}%`,
                    top: `-${row * 100}%`,
                  }}
                >
                  <Backdrop id={puzzle.backdrop} />
                </div>
                {selected === pos ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-amber-300/20" />
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-900 shadow">
          <StarItem size={16} /> Trocas: {swaps}
        </p>

        {ls.mapOpen ? (
          <LevelMap
            title="Níveis"
            subtitle="Escolha um nível para jogar"
            items={levelMapItems(gameId, levels, (i) => `Nível ${i + 1}`, (_i, lv) => lv.name ?? '', (_i, lv) => `${(lv.rounds[0]?.rows ?? 0) * (lv.rounds[0]?.cols ?? 0)} peças`)}
            onPick={(id) => ls.goToLevel(levels.findIndex((l) => l.id === id))}
            onClose={() => ls.setMapOpen(false)}
          />
        ) : null}
      </div>
    </GameShell>
  );
}
