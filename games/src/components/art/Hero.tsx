import { useId } from 'react';

export type HeroState = 'idle' | 'walk' | 'happy' | 'sad' | 'thinking';

interface HeroProps {
  state?: HeroState;
  facing?: 'left' | 'right';
  size?: number;
  className?: string;
}

/**
 * O herói do jogo em SVG inline (skill `jogos-visual` §2/§3): arte própria em vez
 * de emoji — renderiza igual em iOS/Android/Windows, aceita estado por parte
 * (idle/walk/happy/sad/thinking) e vira de lado sem custo de imagem.
 *
 * O emoji continua bem-vindo como ícone secundário (opções de resposta, cenário).
 */
export default function Hero({ state = 'idle', facing = 'right', size = 44, className }: HeroProps) {
  const uid = useId().replace(/[:]/g, '');
  const anim =
    state === 'walk'
      ? 'animate-hero-sway'
      : state === 'happy'
        ? 'animate-pop'
        : 'animate-hero-bob';

  const armsUp = state === 'happy';
  const armDown = state === 'sad';
  const closedEyes = state === 'happy';
  const sadEyes = state === 'sad';
  const lookUp = state === 'thinking';

  return (
    <span
      className="inline-block"
      style={{
        width: size,
        height: size,
        transform: facing === 'left' ? 'scaleX(-1)' : undefined,
      }}
    >
      <svg
        viewBox="0 0 44 44"
        width={size}
        height={size}
        className={`${anim} ${className ?? ''}`}
        aria-hidden
      >
        <defs>
          <linearGradient id={`tunic-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id={`skin-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbd6ad" />
            <stop offset="100%" stopColor="#e8b184" />
          </linearGradient>
        </defs>

        {/* pernas */}
        <rect x="15" y="31" width="5.5" height="9.5" rx="2.75" fill="#1e3a8a" />
        <rect x="23.5" y="31" width="5.5" height="9.5" rx="2.75" fill="#1e3a8a" />

        {/* braços (por estado) */}
        {armsUp ? (
          <>
            <g transform="rotate(-38 9 21)">
              <rect x="6" y="13" width="5.5" height="13" rx="2.75" fill="#38bdf8" />
            </g>
            <g transform="rotate(38 35 21)">
              <rect x="32.5" y="13" width="5.5" height="13" rx="2.75" fill="#38bdf8" />
            </g>
          </>
        ) : (
          <>
            <rect
              x="6"
              y={armDown ? 23 : 20}
              width="5.5"
              height={armDown ? 12 : 11}
              rx="2.75"
              fill="#38bdf8"
            />
            <rect x="32.5" y="20" width="5.5" height="11" rx="2.75" fill="#38bdf8" />
          </>
        )}

        {/* túnica */}
        <path
          d="M13 19h18a4.5 4.5 0 0 1 4.5 4.5v7.5A4.5 4.5 0 0 1 31 35.5H13a4.5 4.5 0 0 1-4.5-4.5V23.5A4.5 4.5 0 0 1 13 19Z"
          fill={`url(#tunic-${uid})`}
          stroke="#0f172a"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <rect x="9" y="28" width="26" height="3" rx="1.5" fill="#f59e0b" opacity="0.9" />

        {/* cabeça */}
        <circle
          cx="22"
          cy="13"
          r="9.6"
          fill={`url(#skin-${uid})`}
          stroke="#0f172a"
          strokeWidth="1.8"
        />
        {/* cabelo / franja */}
        <path
          d="M12.5 11.4C13 6.4 17 3.4 22 3.4s9 3 9.5 8c-2.5-2.1-5.7-3.1-9.5-3.1s-7 1-9.5 3.1Z"
          fill="#4b2e17"
        />

        {/* olhos */}
        {closedEyes ? (
          <>
            <path d="M16.6 13.6q1.5-2 3 0" stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M24.4 13.6q1.5-2 3 0" stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </>
        ) : sadEyes ? (
          <>
            <path d="M16.4 14.4q1.6 1.6 3.2 0" stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M24.4 14.4q1.6 1.6 3.2 0" stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M16 11.4l3.4 1.1M28 11.4l-3.4 1.1" stroke="#4b2e17" strokeWidth="1.2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={18.2} cy={lookUp ? 12.6 : 13.6} r="1.6" fill="#111827" />
            <circle cx={25.8} cy={lookUp ? 12.6 : 13.6} r="1.6" fill="#111827" />
          </>
        )}

        {/* boca */}
        {state === 'happy' ? (
          <path d="M18.6 17q3.4 4 6.8 0q-3.4 1.4-6.8 0Z" fill="#7f1d1d" />
        ) : sadEyes ? (
          <path d="M19.4 18.4q2.6-1.8 5.2 0" stroke="#7f1d1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M19.4 17.2q2.6 2.2 5.2 0" stroke="#7f1d1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}

        {/* interrogação do "pensando" */}
        {state === 'thinking' ? (
          <g>
            <circle cx="34" cy="6.5" r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.4" />
            <text
              x="34"
              y="9.6"
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="900"
              fill="#4338ca"
              fontFamily="system-ui, sans-serif"
            >
              ?
            </text>
          </g>
        ) : null}
      </svg>
    </span>
  );
}
