import { useId } from 'react';
import { motifArt } from './Motifs';

export type NpcState = 'idle' | 'happy' | 'sad';

interface NpcProps {
  /** id da história — define o motivo no peito */
  motif: string;
  /** cor da túnica (cada estação tem a sua) */
  tone?: string;
  /** barba (patriarcas) — Maria e o anjo ficam sem */
  beard?: boolean;
  state?: NpcState;
  size?: number;
  className?: string;
}

/**
 * NPC de estação em SVG inline (skill `jogos-visual` §2/§3): figura com túnica,
 * barba opcional e o **motivo da história no peito**. Substitui o emoji de NPC
 * por arte própria, que anima e não muda de cara entre iPhone/Android/Windows.
 */
export default function Npc({
  motif,
  tone = '#0ea5e9',
  beard = false,
  state = 'idle',
  size = 64,
  className,
}: NpcProps) {
  const uid = useId().replace(/[:]/g, '');
  const anim = state === 'happy' ? 'animate-pop' : 'animate-hero-bob';

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`${anim} ${className ?? ''}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`robe-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`face-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbd6ad" />
          <stop offset="100%" stopColor="#e2ab7c" />
        </linearGradient>
      </defs>

      {/* túnica */}
      <path
        d="M24 19a10.5 10.5 0 0 0-10.5 10.5L10 45h28l-3.5-15.5A10.5 10.5 0 0 0 24 19Z"
        fill={`url(#robe-${uid})`}
        stroke="#0f172a"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* cordão/cinto */}
      <path d="M14.5 31h19" stroke="#fde047" strokeWidth="2.6" strokeLinecap="round" />

      {/* emblema com o motivo da história */}
      <circle cx="24" cy="35.5" r="6.4" fill="#fffdf5" stroke="#0f172a" strokeWidth="1.4" />
      <svg x="17.6" y="29.1" width="12.8" height="12.8" viewBox="0 0 24 24">
        {motifArt(motif)}
      </svg>

      {/* cabeça */}
      <circle cx="24" cy="12.5" r="10" fill={`url(#face-${uid})`} stroke="#0f172a" strokeWidth="1.8" />
      {/* cabelo */}
      <path
        d="M14.2 11C14.8 5.6 19 2.6 24 2.6S33.2 5.6 33.8 11c-2.7-2.3-6.1-3.4-9.8-3.4S17 8.7 14.2 11Z"
        fill="#4b2e17"
      />
      {beard ? (
        <path
          d="M17 14.5c0 5 3.2 8.4 7 8.4s7-3.4 7-8.4c-1.6 2.6-4.2 3.6-7 3.6s-5.4-1-7-3.6Z"
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="0.9"
        />
      ) : null}

      {/* olhos + boca (por estado) */}
      {state === 'happy' ? (
        <>
          <path d="M18.4 12.6q1.6-2.2 3.2 0" stroke="#111827" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d="M26.4 12.6q1.6-2.2 3.2 0" stroke="#111827" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d="M20.6 17q3.4 3.6 6.8 0q-3.4 1.4-6.8 0Z" fill="#7f1d1d" />
        </>
      ) : state === 'sad' ? (
        <>
          <path d="M18.4 13.8q1.6 1.6 3.2 0" stroke="#111827" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d="M26.4 13.8q1.6 1.6 3.2 0" stroke="#111827" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d="M21 18.4q3-1.8 6 0" stroke="#7f1d1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="20" cy="12.8" r="1.7" fill="#111827" />
          <circle cx="28" cy="12.8" r="1.7" fill="#111827" />
          <path d="M21 17.4q3 2.2 6 0" stroke="#7f1d1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
