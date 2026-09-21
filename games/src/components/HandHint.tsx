interface HandHintProps {
  /** Posição/tamanho vêm de fora (o componente não decide onde apontar) */
  className?: string;
  size?: number;
}

/**
 * Onboarding **sem texto** (skill `jogos-game-design` §G8): uma mãozinha que
 * "toca" no ponto onde a criança deve tocar. A criança de 6 anos lê o gesto
 * antes da frase — por isso nada de instrução escrita aqui.
 */
export default function HandHint({ className, size = 56 }: HandHintProps) {
  return (
    <span className={`pointer-events-none inline-block ${className ?? ''}`} aria-hidden>
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        className="animate-hand-tap drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]"
      >
        <g stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M14 22a10 10 0 0 1 20 0v4a10 10 0 0 1-20 0v-4Z" fill="#fbd6ad" />
          <rect x="20" y="26" width="8.6" height="18" rx="4.3" fill="#fbd6ad" />
          <rect x="9.5" y="24" width="7" height="12" rx="3.5" fill="#fbd6ad" transform="rotate(-26 13 30)" />
          <rect x="31.5" y="24" width="7" height="12" rx="3.5" fill="#fbd6ad" transform="rotate(26 35 30)" />
        </g>
        <circle cx="24.3" cy="45.5" r="3.4" fill="#fde047" opacity="0.9" />
      </svg>
    </span>
  );
}
