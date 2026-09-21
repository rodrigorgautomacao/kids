import ChoiceGame, { type ChoiceRound } from './ChoiceGame';

// ── Sombra do Herói (7–9 anos) ───────────────────────────────────────────
// A criança vê a silhueta de um personagem e descobre quem é.

const ROUNDS: ChoiceRound[] = [
  { prompt: 'De quem é esta sombra?', target: { motif: 'noe' }, options: [{ id: 'noe', motif: 'noe', label: 'Noé' }, { id: 'jonas', motif: 'jonas', label: 'Jonas' }, { id: 'davi', motif: 'davi', label: 'Davi' }], correct: 'noe', ref: 'Gênesis 6.14 (NAA)', msg: 'É Noé, o construtor da arca! 🚢' },
  { prompt: 'De quem é esta sombra?', target: { motif: 'jonas' }, options: [{ id: 'jonas', motif: 'jonas', label: 'Jonas' }, { id: 'eliseu', motif: 'eliseu', label: 'Eliseu' }, { id: 'paulo', motif: 'paulo', label: 'Paulo' }], correct: 'jonas', ref: 'Jonas 1.17 (NAA)', msg: 'É Jonas, que ficou dentro do grande peixe! 🐳' },
  { prompt: 'De quem é esta sombra?', target: { motif: 'moises' }, options: [{ id: 'moises', motif: 'moises', label: 'Moisés' }, { id: 'josue', motif: 'josue', label: 'Josué' }, { id: 'elias', motif: 'elias', label: 'Elias' }], correct: 'moises', ref: 'Êxodo 3.10 (NAA)', msg: 'É Moisés, que abriu o mar! 🌊' },
  { prompt: 'De quem é esta sombra?', target: { motif: 'davi' }, options: [{ id: 'davi', motif: 'davi', label: 'Davi' }, { id: 'salomao', motif: 'salomao', label: 'Salomão' }, { id: 'daniel', motif: 'daniel', label: 'Daniel' }], correct: 'davi', ref: '1 Samuel 16.13 (NAA)', msg: 'É Davi, o pastor que venceu o gigante! 🪨' },
  { prompt: 'De quem é esta sombra?', target: { motif: 'daniel' }, options: [{ id: 'daniel', motif: 'daniel', label: 'Daniel' }, { id: 'elias', motif: 'elias', label: 'Elias' }, { id: 'eliseu', motif: 'eliseu', label: 'Eliseu' }], correct: 'daniel', ref: 'Daniel 6.16 (NAA)', msg: 'É Daniel, protegido na cova dos leões! 🦁' },
  { prompt: 'De quem é esta sombra?', target: { motif: 'natal' }, options: [{ id: 'natal', motif: 'natal', label: 'Maria' }, { id: 'noe', motif: 'noe', label: 'Noé' }, { id: 'salomao', motif: 'salomao', label: 'Salomão' }], correct: 'natal', ref: 'Lucas 1.30 (NAA)', msg: 'É Maria, a mãe de Jesus! 👩' },
];

export default function GameSombraDoHeroi({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="sombra-do-heroi"
      title="Sombra do Herói"
      subtitle="Descubra quem é pela silhueta!"
      bg="bg-gradient-to-b from-slate-200 via-indigo-50 to-violet-100"
      titleClass="text-slate-700"
      variant="shadow"
      rounds={ROUNDS}
      onExit={onExit}
    />
  );
}
