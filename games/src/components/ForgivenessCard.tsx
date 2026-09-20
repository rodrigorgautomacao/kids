import { HeartHandshake, PartyPopper } from 'lucide-react';

interface ForgivenessCardProps {
  /** Reseta o jogo para a fase 'choice' */
  onForgive: () => void;
  /** Volta ao hub de jogos */
  onExit: () => void;
}

/**
 * Tela final comum a todos os jogos: "Pedir perdão e recomeçar".
 * Nunca é fim de jogo definitivo — sempre recomeça.
 */
export default function ForgivenessCard({ onForgive, onExit }: ForgivenessCardProps) {
  return (
    <div className="animate-pop flex flex-col items-center gap-4">
      <p className="rounded-3xl bg-white/90 px-6 py-4 text-center text-xl font-black text-sky-700 shadow-xl">
        Que tal recomeçar? 💛
      </p>
      <button
        type="button"
        onClick={onForgive}
        className="flex items-center gap-3 rounded-full bg-sky-500 px-8 py-4 text-xl font-extrabold text-white shadow-[0_8px_0_rgba(2,132,199,0.8)] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none sm:text-2xl"
      >
        <HeartHandshake className="h-7 w-7" /> Pedir perdão e recomeçar
      </button>
      <button
        type="button"
        onClick={onExit}
        className="flex items-center gap-2 rounded-full bg-white/70 px-6 py-2 text-sm font-bold text-slate-600 shadow transition-transform active:scale-95"
      >
        <PartyPopper className="h-4 w-4" /> Outros jogos
      </button>
    </div>
  );
}