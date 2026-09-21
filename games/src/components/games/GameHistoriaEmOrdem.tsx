import OrderGame, { type OrderRound } from './OrderGame';
import { chunkLevels } from '../../lib/levels';

// ── A História em Ordem (5–6 anos) ───────────────────────────────────────
// Sequência narrativa: a criança toca as cenas na ordem em que aconteceram.
// Toda história cita a referência bíblica (NAA).

const ROUNDS: OrderRound[] = [
  {
    id: 'noe',
    ref: 'Gênesis 6–9 (NAA)',
    title: 'Monte a história de Noé',
    steps: [
      { id: 'arca', emoji: '🚢', label: 'Noé construiu a arca' },
      { id: 'chuva', emoji: '🌧️', label: 'A grande chuva' },
      { id: 'pomba', emoji: '🕊️', label: 'A pomba voltou' },
      { id: 'arco', emoji: '🌈', label: 'O arco-íris' },
    ],
  },
  {
    id: 'moises',
    ref: 'Êxodo 2–20 (NAA)',
    title: 'Monte a história de Moisés',
    steps: [
      { id: 'cesto', emoji: '🧺', label: 'O bebê no cesto' },
      { id: 'sarca', emoji: '🔥', label: 'A sarça em chamas' },
      { id: 'mar', emoji: '🌊', label: 'O mar se abriu' },
      { id: 'mand', emoji: '📜', label: 'Os dez mandamentos' },
    ],
  },
  {
    id: 'jonas',
    ref: 'Jonas 1–4 (NAA)',
    title: 'Monte a história de Jonas',
    steps: [
      { id: 'navio', emoji: '⛵', label: 'Jonas fugiu de navio' },
      { id: 'peixe', emoji: '🐳', label: 'Dentro do grande peixe' },
      { id: 'cidade', emoji: '🏛️', label: 'Nínive escutou Deus' },
      { id: 'planta', emoji: '🌿', label: 'A planta de sombra' },
    ],
  },
  {
    id: 'natal',
    ref: 'Lucas 1–2 (NAA)',
    title: 'Monte a história do Natal',
    steps: [
      { id: 'anjo', emoji: '🕊️', label: 'O anjo visitou Maria' },
      { id: 'berco', emoji: '👶', label: 'Jesus nasceu em Belém' },
      { id: 'magos', emoji: '🌟', label: 'Os magos seguiram a estrela' },
      { id: 'templo', emoji: '📜', label: 'O menino no templo' },
    ],
  },
  {
    id: 'davi',
    ref: '1 Samuel 16–18 (NAA)',
    title: 'Monte a história de Davi',
    steps: [
      { id: 'ungido', emoji: '🫗', label: 'Samuel ungiu Davi' },
      { id: 'harpa', emoji: '🎼', label: 'Davi tocou a harpa' },
      { id: 'golias', emoji: '🪨', label: 'Davi venceu Golias' },
      { id: 'amigo', emoji: '🤝', label: 'A amizade de Jônatas' },
    ],
  },
];

export default function GameHistoriaEmOrdem({ onExit }: { onExit: () => void }) {
  return (
    <OrderGame
      gameId="historia-em-ordem"
      title="A História em Ordem"
      subtitle="Toque nas cenas na ordem certa!"
      bg="bg-gradient-to-b from-teal-100 via-sky-50 to-emerald-100"
      titleClass="text-teal-600"
      intro="O que aconteceu PRIMEIRO? Toque na cena e continue a história!"
      levels={chunkLevels(ROUNDS, 1)}
      onExit={onExit}
    />
  );
}
