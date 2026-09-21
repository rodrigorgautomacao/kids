import { useId } from 'react';

/** Item coletável em SVG (substitui o ⭐ emoji) — brilha e escala sem borrar. */
export default function StarItem({ size = 28, className }: { size?: number; className?: string }) {
  const uid = useId().replace(/[:]/g, '');
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id={`star-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="55%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.8l3 6.4 6.9 1-5 4.9 1.2 7-6.1-3.4L5.9 21l1.2-7-5-4.9 6.9-1 3-6.4Z"
        fill={`url(#star-${uid})`}
        stroke="#b45309"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M12 5.6l1.6 3.3 3.6.6-2.6 2.5.6 3.7-3.2-1.8-3.2 1.8.6-3.7L7.4 9.5l3.6-.6L12 5.6Z"
        fill="#fff8d6"
        opacity="0.7"
      />
    </svg>
  );
}
