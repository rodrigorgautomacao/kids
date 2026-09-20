import { MAX_LEVELS_PER_GAME } from '../lib/progress';

interface LevelHUDProps {
  level: number;
  totalLevels?: number;
}

/** Barra de progresso dos níveis: Nível x/10 + bolinhas de avanço. */
export default function LevelHUD({
  level,
  totalLevels = MAX_LEVELS_PER_GAME,
}: LevelHUDProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="rounded-full bg-white/15 px-5 py-1.5 text-sm font-black text-white shadow backdrop-blur-sm">
        Nível {level}/{totalLevels}
      </span>
      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: totalLevels }).map((_, i) => {
          const n = i + 1;
          const passed = n < level;
          const current = n === level;
          return (
            <span
              key={n}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                passed
                  ? 'bg-emerald-400'
                  : current
                    ? 'scale-125 bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.9)]'
                    : 'bg-white/25'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}