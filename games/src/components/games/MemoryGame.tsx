import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import SpeakChip from '../SpeakChip';
import { StarItem } from '../art';
import { bestScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber } from '../../lib/fx';
import { shuffle } from '../../lib/minigame';
import { levelMapItems, useLevelState, type GameLevel } from '../../lib/levels';

// ── Pares da Arca (níveis) ───────────────────────────────────────────────
// A cada nível, mais pares de animais entram na arca (4 → 10 pares).

interface Pair {
  pairId: string;
  emoji: string;
  name: string;
}

interface Card {
  key: number;
  pairId: string;
  emoji: string;
  name: string;
}

export interface MemoryRound {
  id: string;
  pairs: Pair[];
}

const GAME_ID = 'pares-da-arca';
const PTS_PAR = 100;
const REF = 'Gênesis 6.19-20 (NAA)';

function buildDeck(pairs: Pair[]): Card[] {
  const cards: Card[] = [];
  pairs.forEach((p, i) => {
    cards.push({ key: i * 2, ...p });
    cards.push({ key: i * 2 + 1, ...p });
  });
  return shuffle(cards);
}

interface Props {
  levels: GameLevel<MemoryRound>[];
  onExit: () => void;
}

export default function MemoryGame({ levels, onExit }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const ls = useLevelState(GAME_ID, levels);
  const round = ls.round;
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(round?.pairs ?? []));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(GAME_ID);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (!round) return;
    setDeck(buildDeck(round.pairs));
    setFlipped([]);
    setMatched(new Set());
    setMsg(null);
    const t = window.setTimeout(() => voice.speak('Encontre os pares de animais!'), 350);
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function cardCenter(key: number) {
    const box = stageRef.current?.getBoundingClientRect();
    const el = stageRef.current?.querySelector<HTMLElement>(`[data-card="${key}"]`);
    const r = el?.getBoundingClientRect();
    if (!box || !r) return { x: 0, y: 0 };
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
  }

  function handleFlip(card: Card) {
    if (ls.phase !== 'playing' || flipped.length === 2) return;
    if (matched.has(card.key) || flipped.includes(card.key)) return;

    sfx.pop();
    voice.speak(card.name);
    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length < 2) return;

    const [a, b] = next.map((k) => deck.find((c) => c.key === k)!);
    const stage = stageRef.current;

    if (a.pairId === b.pairId) {
      const { x, y } = cardCenter(b.key);
      sfx.collect();
      burst(stage, x, y, { kind: 'spark', count: 14 });
      flyNumber(stage, x, y, `+${PTS_PAR}`);
      setMatched((m) => new Set([...m, a.key, b.key]));
      setScore((s) => s + PTS_PAR);
      voice.speak(`É um par! ${a.name}!`);
      later(() => setFlipped([]), 480);
    } else {
      sfx.wrong();
      ls.addWrong();
      later(() => setFlipped([]), 950);
    }
  }

  // Todos os pares encontrados → fecha o nível.
  useEffect(() => {
    if (!round || ls.phase !== 'playing') return;
    if (matched.size !== 0 && matched.size === deck.length) {
      setMsg('Todos os pares! 🎉');
      voice.speak('Parabéns! Você encontrou todos os pares!');
      const t = window.setTimeout(() => ls.completeRound(), 900);
      return () => window.clearTimeout(t);
    }
  }, [matched, deck.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (ls.phase === 'done') {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-sky-100 via-emerald-50 to-teal-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone stars={ls.stars} wrong={ls.wrong} onNext={ls.hasNextLevel ? ls.goNextLevel : undefined} onExit={onExit} onOpenMap={() => ls.setMapOpen(true)} />
        <p className="-mt-1 text-sm font-black text-teal-700">Pontuação: {score} ⭐ · 📖 {REF}</p>
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
          <LevelMap title="Níveis" subtitle="Escolha um nível para jogar" items={levelMapItems(GAME_ID, levels, (i) => `Nível ${i + 1}`, (_i, lv) => lv.name ?? '')} onPick={(id) => ls.goToLevel(levels.findIndex((l) => l.id === id))} onClose={() => ls.setMapOpen(false)} />
        ) : null}
      </div>
    );
  }

  if (!round) return null;
  const totalPairs = round.pairs.length;
  const found = matched.size / 2;

  return (
    <GameShell title="Pares da Arca" subtitle="Encontre os pares de animais!" onExit={onExit} bg="bg-gradient-to-b from-sky-100 via-emerald-50 to-teal-100" titleClass="text-teal-600">
      <div className="relative flex w-full flex-col items-center gap-5 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={ls.levelIdx + 1} totalLevels={levels.length} step={found} steps={totalPairs} />
          <div className="flex items-center gap-2">
            {score > 0 ? (
              <span className="ui-press flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-900 shadow">
                <StarItem size={18} /> {score}
              </span>
            ) : null}
            {record > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-teal-700 shadow">🏆 {Math.max(record, score)}</span>
            ) : null}
            <button type="button" onClick={() => { sfx.pop(); ls.setMapOpen(true); }} className="ui-press rounded-full bg-white/85 px-3 py-2 text-sm font-black text-teal-700 shadow">🗺️</button>
          </div>
        </div>

        <p className="flex items-center gap-2 text-center text-lg font-black text-teal-900">
          <span>Os animais entraram na arca de dois em dois! 🚢</span>
          <SpeakChip text="Os animais entraram na arca de dois em dois!" className="relative -top-0.5" />
        </p>

        <div ref={stageRef} className="relative grid w-full grid-cols-4 gap-2 sm:gap-3">
          {deck.map((card) => {
            const faceUp = flipped.includes(card.key) || matched.has(card.key);
            const isMatched = matched.has(card.key);
            return (
              <button
                key={card.key}
                type="button"
                data-card={card.key}
                onClick={() => handleFlip(card)}
                disabled={isMatched}
                aria-label={faceUp ? card.name : 'Carta virada'}
                className={`ui-press flex aspect-square items-center justify-center rounded-2xl border-4 text-4xl shadow-lg transition-transform sm:text-5xl ${
                  isMatched ? 'animate-pop border-emerald-400 bg-emerald-50' : faceUp ? 'border-amber-300 bg-white' : 'border-sky-300 bg-gradient-to-b from-sky-400 to-sky-600'
                }`}
              >
                <span className={faceUp ? '' : 'opacity-90'}>{faceUp ? card.emoji : '🚢'}</span>
              </button>
            );
          })}
        </div>

        <p className="rounded-full bg-white/85 px-4 py-1.5 text-sm font-black text-teal-700 shadow">Pares encontrados: {found}/{totalPairs}</p>
        {msg ? <p className="animate-pop rounded-3xl bg-emerald-100 px-6 py-2 text-base font-extrabold text-emerald-800 shadow-lg">{msg}</p> : null}

        {ls.mapOpen ? (
          <LevelMap title="Níveis" subtitle="Escolha um nível para jogar" items={levelMapItems(GAME_ID, levels, (i) => `Nível ${i + 1}`, (_i, lv) => lv.name ?? '')} onPick={(id) => ls.goToLevel(levels.findIndex((l) => l.id === id))} onClose={() => ls.setMapOpen(false)} />
        ) : null}
      </div>
    </GameShell>
  );
}
