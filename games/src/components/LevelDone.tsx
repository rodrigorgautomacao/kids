import { PartyPopper, Star } from 'lucide-react';

interface LevelDoneProps {
  /** Estrelas ganhas no nível (1-3) */
  stars: number;
  /** Sobe para o próximo nível. Ausente = é o último nível do capítulo */
  onNext?: () => void;
  /** Volta ao hub de jogos */
  onExit: () => void;
  /** Título da vitória (padrão: "Nível concluído!") */
  headline?: string;
  /** Fala do capítulo (surge na tela final) */
  lesson?: string;
}

/** Tela de fim de nível/capítulo: estrelas + botões de avanço. */
export default function LevelDone({
  stars,
  onNext,
  onExit,
  headline,
  lesson,
}: LevelDoneProps) {
  const isChapterEnd = !onNext;
  return (
    <div className="animate-pop flex flex-col items-center gap-4">
      <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-5 py-2 shadow backdrop-blur-sm">
        <span className="text-base font-extrabold text-white">
          {headline ?? (isChapterEnd ? 'Capítulo concluído!' : 'Nível concluído!')}
        </span>
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            className={`h-6 w-6 ${
              i <= stars
                ? 'fill-yellow-300 text-yellow-300 drop-shadow'
                : 'text-white/30'
            }`}
          />
        ))}
      </span>

      {isChapterEnd ? (
        <p className="max-w-md rounded-3xl bg-white/15 px-6 py-4 text-center text-lg font-extrabold text-white shadow backdrop-blur-sm">
          🏆 Você completou todos os níveis deste capítulo!
          {lesson ? <span className="mt-1 block text-base font-bold text-white/85">{lesson}</span> : null}
        </p>
      ) : null}

      {onNext ? (
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-3 rounded-full bg-yellow-400 px-10 py-5 text-2xl font-extrabold text-amber-950 shadow-[0_8px_0_rgba(202,138,4,0.9)] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none sm:text-3xl"
        >
          Próximo nível ▶
        </button>
      ) : null}

      <button
        type="button"
        onClick={onExit}
        className="flex items-center gap-2 rounded-full bg-white/70 px-6 py-2 text-sm font-bold text-slate-700 shadow transition-transform active:scale-95"
      >
        <PartyPopper className="h-4 w-4" /> Outros jogos
      </button>
    </div>
  );
}