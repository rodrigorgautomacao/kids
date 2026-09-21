import SortGame, { type SortRound } from './SortGame';
import { chunkLevels } from '../../lib/levels';

// ── Antigo ou Novo? (5–6 anos) ───────────────────────────────────────────
// Coloca cada história no cesto certo: Antigo Testamento ou Novo Testamento.

const BUCKETS = [
  { id: 'at', emoji: '📜', label: 'Antigo Testamento' },
  { id: 'nt', emoji: '✝️', label: 'Novo Testamento' },
];

const ROUNDS: SortRound[] = [
  {
    id: 'r1',
    ref: 'Gênesis 6; Êxodo 14; 1 Samuel 17; Lucas 2; Atos 9 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'noe', emoji: '🚢', label: 'Noé e a arca', bucket: 'at' },
      { id: 'moises', emoji: '🌊', label: 'Moisés e o mar', bucket: 'at' },
      { id: 'davi', emoji: '🪨', label: 'Davi e Golias', bucket: 'at' },
      { id: 'jesus', emoji: '👶', label: 'O nascimento de Jesus', bucket: 'nt' },
      { id: 'paulo', emoji: '✉️', label: 'As cartas de Paulo', bucket: 'nt' },
    ],
  },
  {
    id: 'r2',
    ref: 'Gênesis 1; Gênesis 7; Mateus 2; Lucas 24 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'criacao', emoji: '🌍', label: 'A criação do mundo', bucket: 'at' },
      { id: 'diluvio', emoji: '🌧️', label: 'O dilúvio', bucket: 'at' },
      { id: 'jerico', emoji: '📯', label: 'As muralhas de Jericó', bucket: 'at' },
      { id: 'magos', emoji: '🎁', label: 'Os magos e a estrela', bucket: 'nt' },
      { id: 'ressurreicao', emoji: '🌅', label: 'A ressurreição de Jesus', bucket: 'nt' },
    ],
  },
  {
    id: 'r3',
    ref: 'Êxodo 20; Jonas 3; Lucas 10; Marcos 6; Atos 2 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'mandamentos', emoji: '📜', label: 'Os dez mandamentos', bucket: 'at' },
      { id: 'ninive', emoji: '🏛️', label: 'Jonas em Nínive', bucket: 'at' },
      { id: 'samaritano', emoji: '🤝', label: 'O bom samaritano', bucket: 'nt' },
      { id: 'paes', emoji: '🍞', label: 'A multiplicação dos pães', bucket: 'nt' },
      { id: 'pentecostes', emoji: '🔥', label: 'O dia de Pentecostes', bucket: 'nt' },
    ],
  },
  {
    id: 'r4',
    ref: 'Gênesis 37; Êxodo 7; Juízes 16; João 10; Lucas 15 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'jose', emoji: '🧥', label: 'José e a túnica', bucket: 'at' },
      { id: 'pragas', emoji: '🐸', label: 'As dez pragas', bucket: 'at' },
      { id: 'sansao', emoji: '💪', label: 'Sansão', bucket: 'at' },
      { id: 'pastor', emoji: '🐑', label: 'O bom pastor', bucket: 'nt' },
      { id: 'ovelha', emoji: '🔍', label: 'A ovelha perdida', bucket: 'nt' },
    ],
  },
  {
    id: 'r5',
    ref: 'Gênesis 11; Ester 2; Rute 1; Lucas 15; Marcos 4 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'babel', emoji: '🗼', label: 'A torre de Babel', bucket: 'at' },
      { id: 'ester', emoji: '👑', label: 'A rainha Ester', bucket: 'at' },
      { id: 'rute', emoji: '🌾', label: 'Rute e Noemi', bucket: 'at' },
      { id: 'prodigo', emoji: '🐖', label: 'O filho pródigo', bucket: 'nt' },
      { id: 'semeador', emoji: '🌱', label: 'O semeador', bucket: 'nt' },
    ],
  },
];

export default function GameAntigoOuNovo({ onExit }: { onExit: () => void }) {
  return (
    <SortGame
      gameId="antigo-ou-novo"
      title="Antigo ou Novo?"
      subtitle="Coloque cada história no cesto certo!"
      bg="bg-gradient-to-b from-indigo-100 via-sky-50 to-cyan-100"
      titleClass="text-indigo-600"
      question="Essa história é antes ou depois de Jesus?"
      levels={chunkLevels(ROUNDS, 1)}
      onExit={onExit}
    />
  );
}
