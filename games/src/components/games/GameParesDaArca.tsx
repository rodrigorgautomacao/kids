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
import { burst, flyNumber } from '../../lib/fx';
import { shuffle, starsForWrong } from '../../lib/minigame';

// ── Pares da Arca (3–4 anos) ─────────────────────────────────────────────
// Memória de pares com os animais que entraram na arca (Gênesis 6.19-20).
// Regras da faixa: 1 toque por decisão, erro não pune (só desvira e conta),
// todo texto é narrado, alvo grande. 6 pares = 12 cartas.
//
// Pontos: 100 por par encontrado. Estrelas: 0 erro = 3 ⭐ · até 3 = 2 ⭐ · mais = 1 ⭐.

interface Card {
  key: number;
  pairId: string;
  emoji: string;
  name: string;
}

const PAIRS: { pairId: string; emoji: string; name: string }[] = [
  { pairId: 'elefante', emoji: '🐘', name: 'Elefante' },
  { pairId: 'leao', emoji: '🦁', name: 'Leão' },
  { pairId: 'ovelha', emoji: '🐑', name: 'Ovelha' },
  { pairId: 'pomba', emoji: '🕊️', name: 'Pomba' },
  { pairId: 'tartaruga', emoji: '🐢', name: 'Tartaruga' },
  { pairId: 'macaco', emoji: '🐒', name: 'Macaco' },
];

const GAME_ID = 'pares-da-arca';
const PTS_PAR = 100;
const REF = 'Gênesis 6.19-20 (NAA)';

function buildDeck(): Card[] {
  const cards: Card[] = [];
  PAIRS.forEach((p, i) => {
    cards.push({ key: i * 2, ...p });
    cards.push({ key: i * 2 + 1, ...p });
  });
  return shuffle(cards);
}

export default function GameParesDaArca({ onExit }: { onExit: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const [deck, setDeck] = useState<Card[]>(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongTotal, setWrongTotal] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(3);
  const wrongRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(GAME_ID);

  const totalPairs = PAIRS.length;

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  // Limpa timers e corta a fala ao sair.
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  // Fim de jogo quando todos os pares forem encontrados.
  useEffect(() => {
    if (deck.length === 0 || matched.size !== deck.length) return;
    const s = starsForWrong(wrongRef.current);
    setStars(s);
    setFinished(true);
    submitScore(GAME_ID, score);
    voice.speak('Parabéns! Você encontrou todos os pares!');
  }, [matched, deck.length, score]);

  function cardCenter(key: number) {
    const box = stageRef.current?.getBoundingClientRect();
    const el = stageRef.current?.querySelector<HTMLElement>(`[data-card="${key}"]`);
    const r = el?.getBoundingClientRect();
    if (!box || !r) return { x: 0, y: 0 };
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
  }

  function handleFlip(card: Card) {
    if (finished || flipped.length === 2) return;
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
      later(() => setFlipped([]), 480);
    } else {
      sfx.wrong();
      wrongRef.current += 1;
      setWrongTotal((w) => w + 1);
      later(() => setFlipped([]), 950);
    }
  }

  function handleReplay() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setDeck(buildDeck());
    setFlipped([]);
    setMatched(new Set());
    setScore(0);
    setWrongTotal(0);
    wrongRef.current = 0;
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-sky-100 via-emerald-50 to-teal-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={stars}
          onExit={onExit}
          wrong={wrongTotal}
          headline={stars === 3 ? 'Incrível! ⭐⭐⭐' : stars === 2 ? 'Muito bem! ⭐⭐' : 'Bom esforço! ⭐'}
        />
        <p className="-mt-1 text-sm font-black text-teal-700">
          Pontuação: {score} ⭐ · 📖 {REF}
        </p>
        <button
          type="button"
          onClick={handleReplay}
          className="ui-press rounded-full bg-teal-400 px-8 py-3 text-lg font-black text-teal-950 shadow-[0_6px_0_rgba(13,148,136,0.9)]"
        >
          Jogar de novo 🔁
        </button>
      </div>
    );
  }

  const found = matched.size / 2;

  return (
    <GameShell
      title="Pares da Arca"
      subtitle="Encontre os pares de animais!"
      onExit={onExit}
      bg="bg-gradient-to-b from-sky-100 via-emerald-50 to-teal-100"
      titleClass="text-teal-600"
    >
      <div className="relative flex w-full flex-col items-center gap-5 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={1} totalLevels={1} step={found} steps={totalPairs} />
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
          </div>
        </div>

        <p className="text-center text-lg font-black text-teal-900">
          Os animais entraram na arca de dois em dois! 🚢
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
                  isMatched
                    ? 'animate-pop border-emerald-400 bg-emerald-50'
                    : faceUp
                      ? 'border-amber-300 bg-white'
                      : 'border-sky-300 bg-gradient-to-b from-sky-400 to-sky-600'
                }`}
              >
                <span className={faceUp ? '' : 'opacity-90'}>{faceUp ? card.emoji : '🚢'}</span>
              </button>
            );
          })}
        </div>

        <p className="rounded-full bg-white/85 px-4 py-1.5 text-sm font-black text-teal-700 shadow">
          Pares encontrados: {found}/{totalPairs}
        </p>
      </div>
    </GameShell>
  );
}
