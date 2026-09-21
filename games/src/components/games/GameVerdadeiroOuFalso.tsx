import ChoiceGame, { type ChoiceRound } from './ChoiceGame';
import { chunkLevels } from '../../lib/levels';

// ── Verdadeiro ou Falso? (7–9 anos) ──────────────────────────────────────
// Afirmações sobre a Bíblia; a criança decide se são verdadeiras ou não.

const BOOL = [
  { id: 'sim', emoji: '✅' },
  { id: 'nao', emoji: '❌' },
];

const ROUNDS: ChoiceRound[] = [
  { prompt: 'Jesus nasceu na cidade de Belém.', options: BOOL, correct: 'sim', ref: 'Lucas 2.4-7 (NAA)', msg: 'Verdade! Belém é a cidade de Davi. ⭐' },
  { prompt: 'Moisés atravessou o rio Jordão com o povo.', options: BOOL, correct: 'nao', ref: 'Josué 3.14-17 (NAA)', msg: 'Quem atravessou o Jordão foi Josué! 🌊' },
  { prompt: 'Paulo escreveu cartas para as igrejas.', options: BOOL, correct: 'sim', ref: 'Filipenses 1.1 (NAA)', msg: 'Verdade! Várias cartas estão na Bíblia. ✉️' },
  { prompt: 'Davi venceu Golias com uma espada.', options: BOOL, correct: 'nao', ref: '1 Samuel 17.49-50 (NAA)', msg: 'Não! Davi usou uma funda e uma pedra. 🪨' },
  { prompt: 'O Espírito Santo desceu no dia de Pentecostes.', options: BOOL, correct: 'sim', ref: 'Atos 2.1-4 (NAA)', msg: 'Verdade! Como chamas de fogo sobre os discípulos. 🔥' },
  { prompt: 'Daniel foi lançado na fornalha de fogo.', options: BOOL, correct: 'nao', ref: 'Daniel 3.20 (NAA)', msg: 'Não! Na fornalha foram os amigos dele. Daniel foi para a cova dos leões. 🦁' },
];

export default function GameVerdadeiroOuFalso({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="verdadeiro-ou-falso"
      title="Verdadeiro ou Falso?"
      subtitle="A afirmação está certa?"
      bg="bg-gradient-to-b from-slate-100 via-sky-50 to-blue-100"
      titleClass="text-slate-700"
      variant="bool"
      levels={chunkLevels(ROUNDS, 1)}
      onExit={onExit}
    />
  );
}
