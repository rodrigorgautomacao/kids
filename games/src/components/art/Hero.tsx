import { useId } from 'react';

export type HeroState = 'idle' | 'walk' | 'happy' | 'sad' | 'thinking';

interface HeroProps {
  state?: HeroState;
  facing?: 'left' | 'right';
  size?: number;
  className?: string;
}

/**
 * O herói do jogo em SVG inline (skill `jogos-visual` §2/§3): criança peregrina,
 * com rosto expressivo (sobrancelha, nariz, bochechas), sandálias, mãos e túnica
 * com dobras. Aceita estado por parte (idle/walk/happy/sad/thinking) e vira de
 * lado sem custo de imagem.
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
  const skin = `url(#skin-${uid})`;

  return (
    <span
      className="inline-block"
      style={{
        width: size,
        height: size,
        transform: facing === 'left' ? 'scaleX(-1)' : undefined,
      }}
    >
      <svg viewBox="0 0 44 44" width={size} height={size} className={`${anim} ${className ?? ''}`} aria-hidden>
        <defs>
          <linearGradient id={`tunic-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id={`skin-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbd6ad" />
            <stop offset="100%" stopColor="#e8b184" />
          </linearGradient>
          <linearGradient id={`hair-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b3a20" />
            <stop offset="100%" stopColor="#3b2412" />
          </linearGradient>
        </defs>

        {/* pernas */}
        <rect x="15.2" y="29.5" width="5.6" height="9.5" rx="2.8" fill="#1e3a8a" />
        <rect x="23.2" y="29.5" width="5.6" height="9.5" rx="2.8" fill="#1e3a8a" />
        {/* sandálias */}
        <rect x="14.2" y="38.4" width="7.6" height="3.2" rx="1.6" fill="#78350f" />
        <rect x="22.2" y="38.4" width="7.6" height="3.2" rx="1.6" fill="#78350f" />
        <path d="M16 38.6h4M24 38.6h4" stroke="#fcd34d" strokeWidth="0.8" strokeLinecap="round" />

        {/* braços (por estado) */}
        {armsUp ? (
          <>
            <g transform="rotate(-38 9 21)">
              <rect x="6.2" y="12.5" width="5.6" height="13" rx="2.8" fill="#38bdf8" />
              <circle cx="9" cy="12.6" r="2.9" fill={skin} stroke="#0f172a" strokeWidth="1.2" />
            </g>
            <g transform="rotate(38 35 21)">
              <rect x="32.2" y="12.5" width="5.6" height="13" rx="2.8" fill="#38bdf8" />
              <circle cx="35" cy="12.6" r="2.9" fill={skin} stroke="#0f172a" strokeWidth="1.2" />
            </g>
          </>
        ) : (
          <>
            <rect x="6.2" y={armDown ? 23 : 20} width="5.6" height={armDown ? 12 : 11} rx="2.8" fill="#38bdf8" />
            <rect x="32.2" y="20" width="5.6" height="11" rx="2.8" fill="#38bdf8" />
            <circle cx="9" cy={armDown ? 35 : 31.5} r="2.9" fill={skin} stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="35" cy="31.5" r="2.9" fill={skin} stroke="#0f172a" strokeWidth="1.2" />
          </>
        )}

        {/* túnica com dobras */}
        <path
          d="M13 19h18a4.5 4.5 0 0 1 4.5 4.5v7.5A4.5 4.5 0 0 1 31 35.5H13a4.5 4.5 0 0 1-4.5-4.5V23.5A4.5 4.5 0 0 1 13 19Z"
          fill={`url(#tunic-${uid})`}
          stroke="#0f172a"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M17.5 21.5v13M26.5 21.5v13" stroke="#1e3a8a" strokeWidth="0.9" opacity="0.5" />
        {/* cinto + fivela */}
        <rect x="8.5" y="27.6" width="27" height="3.2" rx="1.6" fill="#b45309" />
        <rect x="19.6" y="27.2" width="4.8" height="4" rx="1" fill="#fcd34d" stroke="#78350f" strokeWidth="0.7" />

        {/* cabeça */}
        <circle cx="22" cy="13" r="9.6" fill={skin} stroke="#0f172a" strokeWidth="1.8" />
        {/* orelhas */}
        <circle cx="12.7" cy="13.6" r="1.9" fill={skin} stroke="#0f172a" strokeWidth="1" />
        <circle cx="31.3" cy="13.6" r="1.9" fill={skin} stroke="#0f172a" strokeWidth="1" />
        {/* cabelo / franja */}
        <path
          d="M12.4 11.2C12.9 6.1 17 3.1 22 3.1s9.1 3 9.6 8.1c-1.2-1.1-2.4-1.9-3.6-2.3-1.4.9-3.6 1.4-6 1.4s-4.6-.5-6-1.4c-1.2.4-2.4 1.2-3.6 2.3Z"
          fill={`url(#hair-${uid})`}
        />
        {/* sobrancelhas */}
        {sadEyes ? (
          <>
            <path d="M15.6 11.2l3.6 1M28.4 11.2l-3.6 1" stroke="#4b2e17" strokeWidth="1.2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M15.6 11.6q2-.9 3.8 0M24.6 11.6q1.8-.9 3.8 0" stroke="#4b2e17" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* olhos */}
        {closedEyes ? (
          <>
            <path d="M16.6 13.7q1.5-2 3 0" stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M24.4 13.7q1.5-2 3 0" stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </>
        ) : sadEyes ? (
          <>
            <path d="M16.4 14.5q1.6 1.6 3.2 0" stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M24.4 14.5q1.6 1.6 3.2 0" stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="18.2" cy={lookUp ? 12.6 : 13.7} rx="1.4" ry="1.7" fill="#111827" />
            <ellipse cx="25.8" cy={lookUp ? 12.6 : 13.7} rx="1.4" ry="1.7" fill="#111827" />
            <circle cx="18.7" cy={lookUp ? 12.1 : 13.2} r="0.5" fill="#fff" />
            <circle cx="26.3" cy={lookUp ? 12.1 : 13.2} r="0.5" fill="#fff" />
          </>
        )}

        {/* nariz */}
        <path d="M22 14.4v1.8" stroke="#c98a5b" strokeWidth="1" strokeLinecap="round" />
        {/* bochechas */}
        <ellipse cx="16.6" cy="16.6" rx="1.9" ry="1.2" fill="#f9a8a8" opacity="0.55" />
        <ellipse cx="27.4" cy="16.6" rx="1.9" ry="1.2" fill="#f9a8a8" opacity="0.55" />

        {/* boca */}
        {state === 'happy' ? (
          <path d="M18.6 17.2q3.4 4 6.8 0q-3.4 1.4-6.8 0Z" fill="#7f1d1d" />
        ) : sadEyes ? (
          <path d="M19.4 18.6q2.6-1.8 5.2 0" stroke="#7f1d1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M19.4 17.4q2.6 2.2 5.2 0" stroke="#7f1d1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}

        {/* interrogação do "pensando" */}
        {state === 'thinking' ? (
          <g>
            <circle cx="34.5" cy="6.5" r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.4" />
            <text
              x="34.5"
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
