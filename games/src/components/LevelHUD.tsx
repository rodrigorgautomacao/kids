import { MAX_LEVELS_PER_GAME } from '../lib/progress';

interface LevelHUDProps {
  level: number;
  totalLevels?: number;
  /** Acertos já feitos dentro do nível (opcional) */
  step?: number;
  /** Total de acertos do nível (opcional) */
  steps?: number;
}

/**
 * HUD do nível: "Nível x/N" + bolinhas da saga + barra do trecho atual com
 * "faltam N" (skill `jogos-game-design` §G2). Cápsulas sólidas (`hud-pill`) para
 * ler no sol, sem `backdrop-blur`.
 */
export default function LevelHUD({
  level,
  totalLevels = MAX_LEVELS_PER_GAME,
  step,
  steps,
}: LevelHUDProps) {
  const showSteps = typeof step === 'number' && typeof steps === 'number' && steps > 0;
  const falta = showSteps ? Math.max(steps - step, 0) : 0;
  const pct = showSteps ? Math.min((step / steps) * 100, 100) : 0;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-1.5">
      <span className="hud-pill px-5 py-1.5 text-sm font-black text-white">
        Nível {level}/{totalLevels}
      </span>

      {showSteps ? (
        <div className="flex w-full flex-col items-center gap-1">
          <div className="h-3 w-full overflow-hidden rounded-full border-2 border-white/15 bg-slate-900/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-yellow-300 transition-[width] duration-500"
              style={{ width: `${Math.max(pct, 3)}%` }}
            />
          </div>
          <span className="text-xs font-black text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
            {falta === 0
              ? 'Última pergunta! 💪'
              : falta === 1
                ? 'Falta 1 acerto para chegar à luz!'
                : `Faltam ${falta} acertos para chegar à luz!`}
          </span>
        </div>
      ) : null}

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
