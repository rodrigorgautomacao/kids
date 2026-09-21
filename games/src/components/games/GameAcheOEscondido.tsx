import HiddenGame, { type HiddenRound } from './HiddenGame';

// ── Ache o Escondido (3–4 anos) ──────────────────────────────────────────
// Atenção visual: a criança procura o item pedido numa cena cheia de figuras.

const ROUNDS: HiddenRound[] = [
  { id: 'pomba', field: ['🐘', '🦁', '🕊️', '🐑', '🐢', '🐒', '🐟', '🌿', '⭐', '🐘'], find: { emoji: '🕊️', label: 'a pomba' }, ref: 'Gênesis 8.11 (NAA)', msg: 'Achou a pomba com o raminho! 🕊️' },
  { id: 'estrela', field: ['🌙', '☀️', '⭐', '🌈', '☁️', '🌧️', '🔥', '🌊', '🌙', '☁️'], find: { emoji: '⭐', label: 'a estrela' }, ref: 'Mateus 2.2 (NAA)', msg: 'A estrela guiou os magos até Jesus! ⭐' },
  { id: 'peixe', field: ['🐠', '🐡', '🦈', '🐟', '🐙', '🐚', '🦀', '🐠', '🐡', '🦈'], find: { emoji: '🐟', label: 'o peixe' }, ref: 'Jonas 1.17 (NAA)', msg: 'O peixe grande que levou Jonas! 🐟' },
  { id: 'pergaminho', field: ['📖', '📜', '📕', '📗', '📘', '📙', '🗒️', '📄', '📖', '📕'], find: { emoji: '📜', label: 'o pergaminho' }, ref: 'Êxodo 20.1 (NAA)', msg: 'O pergaminho dos dez mandamentos! 📜' },
  { id: 'leao', field: ['🐯', '🐱', '🦁', '🐶', '🐺', '🦊', '🐻', '🐯', '🐱', '🐶'], find: { emoji: '🦁', label: 'o leão' }, ref: 'Daniel 6.16 (NAA)', msg: 'O leão! Deus protegeu Daniel. 🦁' },
];

export default function GameAcheOEscondido({ onExit }: { onExit: () => void }) {
  return (
    <HiddenGame
      gameId="ache-o-escondido"
      title="Ache o Escondido"
      subtitle="Encontre a figura pedida!"
      bg="bg-gradient-to-b from-orange-100 via-amber-50 to-yellow-100"
      titleClass="text-orange-600"
      rounds={ROUNDS}
      onExit={onExit}
    />
  );
}
