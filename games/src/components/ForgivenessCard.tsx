import { HeartHandshake, PartyPopper } from 'lucide-react';

interface ForgivenessCardProps {
  /** Recomeça o nível atual do zero */
  onForgive: () => void;
  /** Volta ao hub de jogos */
  onExit: () => void;
  /** Frase de perdão personalize (padrão de lição) */
  message?: string;
}

/**
 * Tela de perdão e recomeço entre níveis, usada quando a escolha foi errada.
 * Nunca é fim definitivo — sempre dá para pedir perdão e tentar de novo.
 */
export default function ForgivenessCard({
  onForgive,
  onExit,
  message = 'Pedir perdão e recomeçar! Deus acolhe quem volta.',
}: ForgivenessCardProps) {
  return (
    <div className="animate-pop flex flex-col items-center gap-4">
      <p className="max-w-md rounded-3xl bg-white/90 px-6 py-4 text-center text-lg font-black text-sky-700 shadow-xl">
        {message}
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