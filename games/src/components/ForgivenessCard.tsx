import { useEffect, useRef } from 'react';
import { Star, HeartHandshake, PartyPopper } from 'lucide-react';
import { completeGame } from '../lib/progress';

interface ForgivenessCardProps {
  /** Reseta o jogo para a fase 'choice' */
  onForgive: () => void;
  /** Volta ao hub de jogos */
  onExit: () => void;
  /** Id do jogo (capítulo) para registrar o progresso da saga */
  gameId?: string;
  /** Estrelas ganhas neste capítulo (1 a 3) */
  stars?: number;
}

/**
 * Tela final comum a todos os jogos: "Pedir perdão e recomeçar".
 * Nunca é fim de jogo definitivo — sempre recomeça.
 * Quando `gameId` é informado, registra a conclusão do capítulo na saga.
 */
export default function ForgivenessCard({
  onForgive,
  onExit,
  gameId,
  stars = 1,
}: ForgivenessCardProps) {
  const recorded = useRef(false);

  useEffect(() => {
    if (gameId && !recorded.current) {
      recorded.current = true;
      completeGame(gameId, stars);
    }
  }, [gameId, stars]);

  return (
    <div className="animate-pop flex flex-col items-center gap-4">
      {gameId ? (
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-4 py-1.5 shadow">
          <span className="text-sm font-extrabold text-amber-700">Capítulo concluído!</span>
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i <= stars ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
              }`}
            />
          ))}
        </span>
      ) : null}

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