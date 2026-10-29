import type { ReactNode } from 'react';

interface ArcadeMarqueeProps {
  title: string;
  subtitle?: string;
  /** Etiqueta do evento (ex.: "SALA DE JOGOS · FESTKIDS"). */
  badge?: string;
  /** Conteúdo à direita (créditos, recorde, botão). */
  right?: ReactNode;
  /** `h1` no lobby, `h2` dentro do jogo (hierarquia de títulos). */
  heading?: 'h1' | 'h2';
  /** Versão baixa, usada no topo da tela de jogo. */
  compact?: boolean;
  className?: string;
}

/** Fileira de lâmpadas do letreiro — puro CSS, respeita menos movimento. */
function Lights({ count = 16, tight = false }: { count?: number; tight?: boolean }) {
  return (
    <div className={`arcade-lights ${tight ? 'arcade-lights--tight' : ''}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="arcade-bulb"
          style={{ animationDelay: `${(i % 8) * 110}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * Letreiro do gabinete: lâmpadas em cima e embaixo, título em neon e etiqueta
 * do evento. A mesma peça serve o lobby (grande) e a tela de jogo (compacta),
 * para o app inteiro parecer UM fliperama, não uma página com adesivos.
 */
export default function ArcadeMarquee({
  title,
  subtitle,
  badge,
  right,
  heading = 'h2',
  compact = false,
  className = '',
}: ArcadeMarqueeProps) {
  const Heading = heading;

  return (
    <div className={`arcade-marquee relative overflow-hidden rounded-t-2xl ${className}`}>
      <Lights count={compact ? 12 : 18} tight={compact} />

      <div
        className={`relative flex items-center justify-center gap-3 text-center ${
          compact ? 'px-3 py-1' : 'px-3 py-4 sm:px-4 sm:py-5'
        }`}
      >
        {!compact ? (
          <span className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(251,191,36,0.18),transparent_70%)]" />
        ) : null}

        <div className="relative z-10 min-w-0 flex-1">
          {badge ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full border border-cyan-300/40 bg-cyan-400/10 font-black tracking-[0.18em] text-cyan-200 uppercase ${
                compact ? 'mb-0.5 px-2 py-px text-[8px]' : 'mb-1 px-3 py-0.5 text-[10px]'
              }`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" aria-hidden />
              {badge}
            </span>
          ) : null}

          <Heading
            className={`arcade-neon font-black uppercase leading-none tracking-tight ${
              compact ? 'text-sm sm:text-base' : 'text-3xl sm:text-5xl'
            }`}
          >
            {title}
          </Heading>

          {subtitle ? (
            <p
              className={`font-bold text-white/70 ${
                compact ? 'mt-0.5 truncate text-[11px]' : 'mt-1 text-xs sm:text-sm'
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {right ? <div className="relative z-10 shrink-0">{right}</div> : null}
      </div>

      {compact ? (
        <span
          aria-hidden
          className="block h-0.5 w-full bg-gradient-to-r from-transparent via-amber-300/60 to-transparent"
        />
      ) : (
        <Lights count={18} />
      )}
    </div>
  );
}
