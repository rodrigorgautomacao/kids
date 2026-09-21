import ChoiceGame, { type ChoiceRound } from './ChoiceGame';
import { chunkLevels } from '../../lib/levels';

// ── Sim ou Não? (3–4 anos) ───────────────────────────────────────────────
// A criança ouve uma frase curta e decide se é verdadeira (✅) ou não (❌).

const BOOL = [
  { id: 'sim', emoji: '✅' },
  { id: 'nao', emoji: '❌' },
];

const ROUNDS: ChoiceRound[] = [
  { prompt: 'Noé construiu uma arca bem grande.', options: BOOL, correct: 'sim', ref: 'Gênesis 6.14 (NAA)', msg: 'Isso! Noé obedeceu a Deus. 🚢' },
  { prompt: 'O grande peixe engoliu Jonas.', options: BOOL, correct: 'sim', ref: 'Jonas 1.17 (NAA)', msg: 'Verdade! E depois o peixe soltou Jonas. 🐳' },
  { prompt: 'Jesus nasceu num palácio.', options: BOOL, correct: 'nao', ref: 'Lucas 2.7 (NAA)', msg: 'Não! Jesus nasceu numa estrebaria. 👶' },
  { prompt: 'Davi venceu o gigante Golias.', options: BOOL, correct: 'sim', ref: '1 Samuel 17.50 (NAA)', msg: 'Isso! Com uma funda e uma pedra. 🪨' },
  { prompt: 'Moisés construiu um barco para atravessar o mar.', options: BOOL, correct: 'nao', ref: 'Êxodo 14.21 (NAA)', msg: 'Não! O mar se abriu e o povo passou no seco. 🌊' },
  { prompt: 'Deus protegeu Daniel na cova dos leões.', options: BOOL, correct: 'sim', ref: 'Daniel 6.22 (NAA)', msg: 'Isso! Deus mandou o anjo proteger Daniel. 🦁' },
];

export default function GameSimOuNao({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="sim-ou-nao"
      title="Sim ou Não?"
      subtitle="A história é verdadeira?"
      bg="bg-gradient-to-b from-emerald-100 via-lime-50 to-yellow-100"
      titleClass="text-emerald-600"
      variant="bool"
      levels={chunkLevels(ROUNDS, 1)}
      onExit={onExit}
    />
  );
}
