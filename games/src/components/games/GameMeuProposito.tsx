import ChoiceGame, { type ChoiceRound } from './ChoiceGame';
import { chunkLevels } from '../../lib/levels';

// ── Meu Propósito (7–9 anos) ─────────────────────────────────────────────
// Deus tem propósitos individuais para cada pessoa em cada fase da vida
// (aprender, trabalhar, casar, ir pregar) e propósitos para toda a igreja
// (fazer discípulos, orar, jejuar). O alvo é formar discípulos de Jesus.

const ROUNDS: ChoiceRound[] = [
  { prompt: 'Por que Deus me criou?', options: [{ id: 'amar', emoji: '🙌', label: 'Para amar e servir' }, { id: 'acaso', emoji: '🎲', label: 'Por acaso' }, { id: 'so', emoji: '🙈', label: 'Para viver sozinho' }], correct: 'amar', ref: 'Efésios 2.10 (NAA)', msg: 'Somos obra de Deus, criados para boas obras! 🙌' },
  { prompt: 'Quando criança, meu propósito inclui…', options: [{ id: 'aprender', emoji: '📚', label: 'Aprender e obedecer' }, { id: 'mandar', emoji: '👑', label: 'Mandar em todos' }, { id: 'nada', emoji: '😴', label: 'Nada' }], correct: 'aprender', ref: 'Lucas 2.52 (NAA)', msg: 'Crescer em sabedoria é parte do plano de Deus! 📚' },
  { prompt: 'Quando eu crescer, posso servir a Deus…', options: [{ id: 'trabalhar', emoji: '🛠️', label: 'Trabalhando e ajudando' }, { id: 'dormir', emoji: '😴', label: 'Só dormindo' }, { id: 'guardar', emoji: '🔒', label: 'Guardando tudo só pra mim' }], correct: 'trabalhar', ref: 'Colossenses 3.23 (NAA)', msg: 'Tudo o que fazemos pode ser para o Senhor! 🛠️' },
  { prompt: 'Alguns são chamados a casar para…', options: [{ id: 'cuidar', emoji: '💍', label: 'Amar e cuidar' }, { id: 'brigar', emoji: '😠', label: 'Brigar' }, { id: 'so', emoji: '🙈', label: 'Ficar cada um no seu canto' }], correct: 'cuidar', ref: 'Gênesis 2.24 (NAA)', msg: 'A família é um projeto de amor de Deus! 💍' },
  { prompt: 'Alguns são chamados a viajar para…', options: [{ id: 'pregar', emoji: '✈️', label: 'Pregar o evangelho' }, { id: 'passear', emoji: '🏖️', label: 'Só passear' }, { id: 'fugir', emoji: '🏃', label: 'Fugir de Deus' }], correct: 'pregar', ref: 'Marcos 16.15 (NAA)', msg: 'Missionários levam Jesus a outros lugares! ✈️' },
  { prompt: 'O que Jesus mandou a toda a igreja?', options: [{ id: 'ide', emoji: '🌍', label: 'Ide e fazei discípulos' }, { id: 'parados', emoji: '🪑', label: 'Fiquem parados' }, { id: 'calados', emoji: '🤐', label: 'Não falem de mim' }], correct: 'ide', ref: 'Mateus 28.19 (NAA)', msg: 'A grande missão: fazer discípulos de Jesus! 🌍' },
  { prompt: 'A igreja deve sempre…', options: [{ id: 'orar', emoji: '🙏', label: 'Orar' }, { id: 'brigar', emoji: '😠', label: 'Brigar' }, { id: 'desistir', emoji: '🚪', label: 'Desistir' }], correct: 'orar', ref: '1 Tessalonicenses 5.17 (NAA)', msg: 'Orar sem cessar é o combustível da igreja! 🙏' },
  { prompt: 'Jejuar é…', options: [{ id: 'buscar', emoji: '🕊️', label: 'Abrir mão de algo para buscar Deus' }, { id: 'fome', emoji: '🍽️', label: 'Passar fome sem motivo' }, { id: 'castigo', emoji: '⛓️', label: 'Um castigo' }], correct: 'buscar', ref: 'Mateus 6.16-18 (NAA)', msg: 'O jejum aproxima o coração de Deus! 🕊️' },
  { prompt: 'Deus tem um propósito para cada…', options: [{ id: 'pessoa', emoji: '🎯', label: 'Pessoa e cada fase da vida' }, { id: 'adulto', emoji: '🧑', label: 'Só para adultos' }, { id: 'ninguem', emoji: '🚫', label: 'Ninguém' }], correct: 'pessoa', ref: 'Jeremias 29.11 (NAA)', msg: 'Deus tem planos de esperança para você! 🎯' },
  { prompt: 'Quem é o nosso exemplo de vida?', options: [{ id: 'jesus', emoji: '🕊️', label: 'Jesus' }, { id: 'forte', emoji: '💪', label: 'O mais forte' }, { id: 'rico', emoji: '💰', label: 'O mais rico' }], correct: 'jesus', ref: '1 Pedro 2.21 (NAA)', msg: 'Seguir Jesus é o caminho — sermos cópias dele! 🕊️' },
];

const LEVELS = chunkLevels(ROUNDS, 2);

export default function GameMeuProposito({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="meu-proposito"
      title="Meu Propósito"
      subtitle="Deus tem um plano para cada um de nós!"
      bg="bg-gradient-to-b from-indigo-100 via-violet-50 to-purple-100"
      titleClass="text-indigo-600"
      variant="grid"
      levels={LEVELS}
      onExit={onExit}
    />
  );
}
