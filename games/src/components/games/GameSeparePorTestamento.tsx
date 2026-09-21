import SortGame, { type SortRound } from './SortGame';
import { chunkLevels } from '../../lib/levels';

// ── Separe por Testamento (7–9 anos) ─────────────────────────────────────
// Versão desafio: mais itens por rodada, incluindo eventos e personagens
// menos óbvios, para consolidar a organização da Bíblia.

const BUCKETS = [
  { id: 'at', emoji: '📜', label: 'Antigo Testamento' },
  { id: 'nt', emoji: '✝️', label: 'Novo Testamento' },
];

const ROUNDS: SortRound[] = [
  {
    id: 'r1',
    ref: 'Gênesis 1; Gênesis 7; Êxodo 14; Lucas 2; Lucas 10; Atos 2 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'criacao', emoji: '🌍', label: 'A criação', bucket: 'at' },
      { id: 'diluvio', emoji: '🌧️', label: 'O dilúvio', bucket: 'at' },
      { id: 'exodo', emoji: '🌊', label: 'A saída do Egito', bucket: 'at' },
      { id: 'nascimento', emoji: '👶', label: 'O nascimento de Jesus', bucket: 'nt' },
      { id: 'samaritano', emoji: '🤝', label: 'O bom samaritano', bucket: 'nt' },
      { id: 'pentecostes', emoji: '🔥', label: 'Pentecostes', bucket: 'nt' },
    ],
  },
  {
    id: 'r2',
    ref: 'Gênesis 12; Josué 6; 1 Samuel 17; Mateus 3; Lucas 19; Lucas 24 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'abraao', emoji: '⭐', label: 'Deus chama Abraão', bucket: 'at' },
      { id: 'jerico', emoji: '📯', label: 'As muralhas de Jericó', bucket: 'at' },
      { id: 'golias', emoji: '🪨', label: 'Davi e Golias', bucket: 'at' },
      { id: 'batismo', emoji: '🕊️', label: 'O batismo de Jesus', bucket: 'nt' },
      { id: 'zaqueu', emoji: '🌳', label: 'Zaqueu sobe na árvore', bucket: 'nt' },
      { id: 'ressurreicao', emoji: '🌅', label: 'A ressurreição', bucket: 'nt' },
    ],
  },
  {
    id: 'r3',
    ref: '1 Reis 18; Jonas 3; Daniel 6; Marcos 6; Mateus 14; Atos 9 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'carmelo', emoji: '🔥', label: 'Elias no monte Carmelo', bucket: 'at' },
      { id: 'ninive', emoji: '🏛️', label: 'Jonas em Nínive', bucket: 'at' },
      { id: 'leoes', emoji: '🦁', label: 'Daniel na cova dos leões', bucket: 'at' },
      { id: 'paes', emoji: '🍞', label: 'A multiplicação dos pães', bucket: 'nt' },
      { id: 'mar', emoji: '🌊', label: 'Jesus anda sobre o mar', bucket: 'nt' },
      { id: 'damasco', emoji: '✨', label: 'Paulo vê a luz', bucket: 'nt' },
    ],
  },
  {
    id: 'r4',
    ref: 'Gênesis 6; Josué 6; Juízes 16; Lucas 19; João 4; Lucas 15 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'noe', emoji: '🚢', label: 'Noé e a arca', bucket: 'at' },
      { id: 'jerico2', emoji: '📯', label: 'As muralhas de Jericó', bucket: 'at' },
      { id: 'sansao', emoji: '💪', label: 'Sansão', bucket: 'at' },
      { id: 'zaqueu', emoji: '🌳', label: 'Zaqueu', bucket: 'nt' },
      { id: 'samaritana', emoji: '🏺', label: 'A mulher samaritana', bucket: 'nt' },
      { id: 'prodigo', emoji: '🐖', label: 'O filho pródigo', bucket: 'nt' },
    ],
  },
  {
    id: 'r5',
    ref: 'Ester 2; Rute 1; Jó 1; Lucas 15; João 10; João 11 (NAA)',
    buckets: BUCKETS,
    items: [
      { id: 'ester', emoji: '👑', label: 'A rainha Ester', bucket: 'at' },
      { id: 'rute', emoji: '🌾', label: 'Rute e Noemi', bucket: 'at' },
      { id: 'jo', emoji: '🌪️', label: 'A história de Jó', bucket: 'at' },
      { id: 'ovelha', emoji: '🔍', label: 'A ovelha perdida', bucket: 'nt' },
      { id: 'pastor', emoji: '🐑', label: 'O bom pastor', bucket: 'nt' },
      { id: 'lazaro', emoji: '🌅', label: 'A ressurreição de Lázaro', bucket: 'nt' },
    ],
  },
];

export default function GameSeparePorTestamento({ onExit }: { onExit: () => void }) {
  return (
    <SortGame
      gameId="separe-por-testamento"
      title="Separe por Testamento"
      subtitle="Antigo Testamento ou Novo Testamento?"
      bg="bg-gradient-to-b from-blue-100 via-indigo-50 to-violet-100"
      titleClass="text-blue-600"
      question="Onde essa história entra?"
      levels={chunkLevels(ROUNDS, 1)}
      onExit={onExit}
    />
  );
}
