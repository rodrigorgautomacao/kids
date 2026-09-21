import MemoryGame, { type MemoryRound } from './MemoryGame';
import type { GameLevel } from '../../lib/levels';

// ── Pares da Arca (3–4 anos) — Antigo Testamento ─────────────────────────
// 5 níveis: a cada nível entram mais pares de animais na arca (4 → 10 pares).
// Memória pura, sem punição: o erro só desvira as cartas.

const PAIRS = [
  { pairId: 'elefante', emoji: '🐘', name: 'Elefante' },
  { pairId: 'leao', emoji: '🦁', name: 'Leão' },
  { pairId: 'ovelha', emoji: '🐑', name: 'Ovelha' },
  { pairId: 'pomba', emoji: '🕊️', name: 'Pomba' },
  { pairId: 'tartaruga', emoji: '🐢', name: 'Tartaruga' },
  { pairId: 'macaco', emoji: '🐒', name: 'Macaco' },
  { pairId: 'girafa', emoji: '🦒', name: 'Girafa' },
  { pairId: 'zebra', emoji: '🦓', name: 'Zebra' },
  { pairId: 'urso', emoji: '🐻', name: 'Urso' },
  { pairId: 'pinguim', emoji: '🐧', name: 'Pinguim' },
];

const COUNTS = [4, 5, 6, 8, 10];

export const PARES_LEVELS: GameLevel<MemoryRound>[] = COUNTS.map((n, i) => ({
  id: `n${i + 1}`,
  name: `${n} pares`,
  rounds: [{ id: `b${i + 1}`, pairs: PAIRS.slice(0, n) }],
}));

export default function GameParesDaArca({ onExit }: { onExit: () => void }) {
  return <MemoryGame levels={PARES_LEVELS} onExit={onExit} />;
}
