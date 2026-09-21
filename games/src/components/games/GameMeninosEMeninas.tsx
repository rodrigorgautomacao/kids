import ChoiceGame, { type ChoiceRound } from './ChoiceGame';
import { chunkLevels } from '../../lib/levels';

// ── Meninos e Meninas de Deus (5–6 anos) ─────────────────────────────────
// Deus criou meninos e meninas à sua imagem: ambos igualmente amados, cada um
// com dons e chamados próprios. O foco é a boa criação de Deus e o valor que
// ele dá a cada criança — sem desprezar ninguém. Tom de graça.

const ROUNDS: ChoiceRound[] = [
  { prompt: 'Quem Deus criou com muito amor?', options: [{ id: 'ambos', emoji: '💙💗', label: 'Meninos e meninas' }, { id: 'meninos', emoji: '👦', label: 'Só meninos' }, { id: 'meninas', emoji: '👧', label: 'Só meninas' }], correct: 'ambos', ref: 'Gênesis 1.27 (NAA)', msg: 'Deus criou meninos e meninas à sua imagem! 🌟' },
  { prompt: 'Para Deus, meninos e meninas são…', options: [{ id: 'amados', emoji: '💛', label: 'Igualmente amados' }, { id: 'diferentes', emoji: '⚖️', label: 'Um vale mais' }, { id: 'nada', emoji: '🙈', label: 'Ninguém importa' }], correct: 'amados', ref: 'Gálatas 3.28 (NAA)', msg: 'Todos são preciosos para Deus! 💛' },
  { prompt: 'Deus deu a cada menino e menina…', options: [{ id: 'dons', emoji: '🎁', label: 'Dons e talentos' }, { id: 'mesmo', emoji: '🟰', label: 'Tudo igual' }, { id: 'nada', emoji: '🚫', label: 'Nada' }], correct: 'dons', ref: '1 Pedro 4.10 (NAA)', msg: 'Cada um recebeu um dom para servir! 🎁' },
  { prompt: 'Um menino pode ser para Deus…', options: [{ id: 'corajoso', emoji: '🛡️', label: 'Corajoso e servo' }, { id: 'brigao', emoji: '😠', label: 'Brigão' }, { id: 'preguicoso', emoji: '😴', label: 'Preguiçoso' }], correct: 'corajoso', ref: 'Josué 1.9 (NAA)', msg: 'Deus chama os meninos a ser fortes e bondosos! 🛡️' },
  { prompt: 'Uma menina pode ser para Deus…', options: [{ id: 'sabia', emoji: '🌸', label: 'Sábia e cuidadosa' }, { id: 'egoista', emoji: '🙅', label: 'Egoísta' }, { id: 'medrosa', emoji: '😨', label: 'Medrosa' }], correct: 'sabia', ref: 'Provérbios 31.25 (NAA)', msg: 'Deus dá sabedoria e coragem às meninas! 🌸' },
  { prompt: 'Jesus, quando menino, crescia em…', options: [{ id: 'sabedoria', emoji: '🌟', label: 'Sabedoria e graça' }, { id: 'altura', emoji: '📏', label: 'Só altura' }, { id: 'brincadeira', emoji: '🪀', label: 'Só brincadeira' }], correct: 'sabedoria', ref: 'Lucas 2.52 (NAA)', msg: 'Jesus cresceu em sabedoria, estatura e graça! 🌟' },
  { prompt: 'Todos nós devemos obedecer a…', options: [{ id: 'deus', emoji: '🙏', label: 'Deus e os pais' }, { id: 'si', emoji: '🙋', label: 'Só a nós mesmos' }, { id: 'ninguem', emoji: '🚫', label: 'A ninguém' }], correct: 'deus', ref: 'Efésios 6.1 (NAA)', msg: 'Obedecer a Deus e aos pais agrada o coração dele! 🙏' },
  { prompt: 'Deus quer que meninos e meninas…', options: [{ id: 'ajudem', emoji: '🤝', label: 'Se ajudem' }, { id: 'briguem', emoji: '😠', label: 'Briguem' }, { id: 'ignorem', emoji: '🙈', label: 'Se ignorem' }], correct: 'ajudem', ref: 'Romanos 12.10 (NAA)', msg: 'Somos uma família: cada um cuida do outro! 🤝' },
  { prompt: 'Cada um tem um papel único dado por…', options: [{ id: 'deus', emoji: '🎯', label: 'Deus' }, { id: 'escola', emoji: '🏫', label: 'A escola' }, { id: 'tv', emoji: '📺', label: 'A TV' }], correct: 'deus', ref: '1 Coríntios 12.4-6 (NAA)', msg: 'Deus distribui os dons como ele quer! 🎯' },
  { prompt: 'O mais importante para Deus é…', options: [{ id: 'coracao', emoji: '💛', label: 'Um coração que o ama' }, { id: 'aparencia', emoji: '👕', label: 'A aparência' }, { id: 'forca', emoji: '💪', label: 'A força' }], correct: 'coracao', ref: '1 Samuel 16.7 (NAA)', msg: 'Deus olha o coração, não a aparência! 💛' },
];

const LEVELS = chunkLevels(ROUNDS, 2);

export default function GameMeninosEMeninas({ onExit }: { onExit: () => void }) {
  return (
    <ChoiceGame
      gameId="meninos-e-meninas"
      title="Meninos e Meninas de Deus"
      subtitle="Deus criou e ama cada um de nós!"
      bg="bg-gradient-to-b from-sky-100 via-cyan-50 to-pink-100"
      titleClass="text-sky-600"
      variant="grid"
      levels={LEVELS}
      onExit={onExit}
    />
  );
}
