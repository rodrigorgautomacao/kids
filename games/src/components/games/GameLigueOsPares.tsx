import ConnectGame, { type ConnectRound } from './ConnectGame';

// ── Ligue os Pares (5–6 anos) ────────────────────────────────────────────
// Associação personagem ↔ objeto/lugar, tocando um item de cada coluna.

const ROUNDS: ConnectRound[] = [
  {
    id: 'objetos',
    ref: 'Gênesis 6; Êxodo 14; 1 Samuel 16; Daniel 6 (NAA)',
    pairs: [
      { id: 'noe', left: { motif: 'noe', label: 'Noé' }, right: { emoji: '🚢', label: 'Arca' } },
      { id: 'davi', left: { motif: 'davi', label: 'Davi' }, right: { emoji: '🎼', label: 'Harpa' } },
      { id: 'moises', left: { motif: 'moises', label: 'Moisés' }, right: { emoji: '🪄', label: 'Bastão' } },
      { id: 'daniel', left: { motif: 'daniel', label: 'Daniel' }, right: { emoji: '🦁', label: 'Leões' } },
    ],
  },
  {
    id: 'historias',
    ref: 'Jonas 1; Lucas 2; Atos 9; Josué 6 (NAA)',
    pairs: [
      { id: 'natal', left: { motif: 'natal', label: 'Maria' }, right: { emoji: '👶', label: 'Menino Jesus' } },
      { id: 'paulo', left: { motif: 'paulo', label: 'Paulo' }, right: { emoji: '✉️', label: 'Cartas' } },
      { id: 'jonas', left: { motif: 'jonas', label: 'Jonas' }, right: { emoji: '🐳', label: 'Grande peixe' } },
      { id: 'josue', left: { motif: 'josue', label: 'Josué' }, right: { emoji: '📯', label: 'Trombetas' } },
    ],
  },
  {
    id: 'lugares',
    ref: '1 Reis 18; 2 Reis 5; 1 Reis 3; Lucas 2 (NAA)',
    pairs: [
      { id: 'elias', left: { motif: 'elias', label: 'Elias' }, right: { emoji: '🔥', label: 'Fogo do céu' } },
      { id: 'eliseu', left: { motif: 'eliseu', label: 'Eliseu' }, right: { emoji: '💧', label: 'Rio Jordão' } },
      { id: 'salomao', left: { motif: 'salomao', label: 'Salomão' }, right: { emoji: '📖', label: 'Sabedoria' } },
      { id: 'criacao', left: { motif: 'criacao', label: 'Anjo' }, right: { emoji: '🐑', label: 'Pastores' } },
    ],
  },
];

export default function GameLigueOsPares({ onExit }: { onExit: () => void }) {
  return (
    <ConnectGame
      gameId="ligue-os-pares"
      title="Ligue os Pares"
      subtitle="Toque na figura e depois no par dela!"
      bg="bg-gradient-to-b from-emerald-100 via-teal-50 to-cyan-100"
      titleClass="text-emerald-600"
      intro="Cada personagem tem o seu par. Toque um de cada lado para ligar!"
      rounds={ROUNDS}
      onExit={onExit}
    />
  );
}
