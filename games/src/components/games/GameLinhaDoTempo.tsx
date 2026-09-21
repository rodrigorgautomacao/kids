import OrderGame, { type OrderRound } from './OrderGame';
import { chunkLevels } from '../../lib/levels';

// ── Linha do Tempo (7–9 anos) ────────────────────────────────────────────
// Mesmo motor de ordenação, com eventos bíblicos e 5 passos por rodada.
// Cada rodada cita a referência (NAA) dos eventos.

const ROUNDS: OrderRound[] = [
  {
    id: 'comeco',
    ref: 'Gênesis 1–12 (NAA)',
    title: 'O começo do mundo',
    steps: [
      { id: 'criacao', emoji: '🌍', label: 'Deus cria o mundo' },
      { id: 'eden', emoji: '🌳', label: 'O jardim do Éden' },
      { id: 'diluvio', emoji: '🌧️', label: 'O dilúvio e a arca' },
      { id: 'babel', emoji: '🗼', label: 'A torre de Babel' },
      { id: 'abraao', emoji: '⭐', label: 'Deus chama Abraão' },
    ],
  },
  {
    id: 'exodo',
    ref: 'Êxodo 2–20 (NAA)',
    title: 'O êxodo do povo de Deus',
    steps: [
      { id: 'bebe', emoji: '🧺', label: 'Moisés nasce' },
      { id: 'sarca', emoji: '🔥', label: 'A sarça em chamas' },
      { id: 'pragas', emoji: '🦗', label: 'As pragas no Egito' },
      { id: 'mar', emoji: '🌊', label: 'A travessia do mar' },
      { id: 'mand', emoji: '📜', label: 'Os dez mandamentos' },
    ],
  },
  {
    id: 'reis',
    ref: 'Josué 6; 1 Samuel 16–17; 1 Reis 3–6 (NAA)',
    title: 'Israel e os reis',
    steps: [
      { id: 'jerico', emoji: '📯', label: 'As muralhas de Jericó' },
      { id: 'ungido', emoji: '🫗', label: 'Samuel unge Davi' },
      { id: 'golias', emoji: '🪨', label: 'Davi e Golias' },
      { id: 'sabio', emoji: '📖', label: 'Salomão pede sabedoria' },
      { id: 'templo', emoji: '🏗️', label: 'O templo de Deus' },
    ],
  },
  {
    id: 'profetas',
    ref: '1 Reis 18; 2 Reis 5; Jonas 3; Daniel 3–6 (NAA)',
    title: 'Os profetas de Deus',
    steps: [
      { id: 'carmelo', emoji: '🔥', label: 'Elias no monte Carmelo' },
      { id: 'naaman', emoji: '💦', label: 'Naamã mergulha no rio' },
      { id: 'ninive', emoji: '🏛️', label: 'Jonas em Nínive' },
      { id: 'fornalha', emoji: '😇', label: 'Os amigos na fornalha' },
      { id: 'leoes', emoji: '🦁', label: 'Daniel na cova dos leões' },
    ],
  },
  {
    id: 'jesus',
    ref: 'Lucas 2; Mateus 3; Marcos 1; Lucas 24 (NAA)',
    title: 'A vida de Jesus',
    steps: [
      { id: 'nasc', emoji: '👶', label: 'Jesus nasce em Belém' },
      { id: 'batismo', emoji: '🕊️', label: 'O batismo no Jordão' },
      { id: 'discipulos', emoji: '🎣', label: 'Jesus chama os discípulos' },
      { id: 'milagres', emoji: '✨', label: 'Jesus faz milagres' },
      { id: 'ressurreicao', emoji: '🌅', label: 'A ressurreição' },
    ],
  },
  {
    id: 'igreja',
    ref: 'Atos 2–16; Filipenses (NAA)',
    title: 'A igreja começa',
    steps: [
      { id: 'pentecostes', emoji: '🔥', label: 'O dia de Pentecostes' },
      { id: 'damasco', emoji: '✨', label: 'Paulo vê a luz' },
      { id: 'viagens', emoji: '🚢', label: 'As viagens de Paulo' },
      { id: 'prisao', emoji: '⛓️', label: 'Paulo na prisão' },
      { id: 'cartas', emoji: '✉️', label: 'As cartas de Paulo' },
    ],
  },
];

export default function GameLinhaDoTempo({ onExit }: { onExit: () => void }) {
  return (
    <OrderGame
      gameId="linha-do-tempo"
      title="Linha do Tempo"
      subtitle="Organize os eventos na ordem certa!"
      bg="bg-gradient-to-b from-violet-100 via-indigo-50 to-purple-100"
      titleClass="text-violet-600"
      intro="Qual evento aconteceu PRIMEIRO? Toque um por um até completar!"
      levels={chunkLevels(ROUNDS, 1)}
      onExit={onExit}
    />
  );
}
