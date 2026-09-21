import { useId } from 'react';
import { motifArt } from './Motifs';

export type NpcState = 'idle' | 'happy' | 'sad';

/**
 * Aparência de um personagem (pedido do dono: "um rosto diferente a cada
 * personagem"). Cada personagem da Bíblia tem sua própria combinação de pele,
 * cabelo, barba e adereço — Maria tem véu, Salomão tem coroa, Noé e Moisés
 * têm barba longa e branca, o Anjo tem cabelo dourado, etc.
 */
export interface NpcLook {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'buzz' | 'wavy' | 'long';
  beard: boolean;
  beardColor: string;
  /** barba curta (aparada) ou longa (patriarca) */
  beardStyle?: 'short' | 'long';
  headwear: 'none' | 'crown' | 'hood' | 'headband';
  headwearColor: string;
  robe: string;
}

export const DEFAULT_LOOK: NpcLook = {
  skin: '#fbd6ad',
  hair: '#4b2e17',
  hairStyle: 'short',
  beard: false,
  beardColor: '#e5e7eb',
  beardStyle: 'short',
  headwear: 'none',
  headwearColor: '#2563eb',
  robe: '#0ea5e9',
};

/** Identidades dos personagens das 12 estações da Aventura (e demais usos). */
export const LOOKS: Record<string, Partial<NpcLook>> = {
  noe: { skin: '#d9a066', hair: '#e2e8f0', hairStyle: 'wavy', beard: true, beardColor: '#e2e8f0', beardStyle: 'long', robe: '#b45309' },
  anjo: { skin: '#fbd6ad', hair: '#fde047', hairStyle: 'wavy', robe: '#f59e0b', headwear: 'crown', headwearColor: '#facc15' },
  elias: { skin: '#d9a066', hair: '#111827', hairStyle: 'wavy', beard: true, beardColor: '#111827', beardStyle: 'short', robe: '#7c3aed' },
  jonas: { skin: '#fbd6ad', hair: '#4b2e17', hairStyle: 'short', robe: '#0ea5e9' },
  eliseu: { skin: '#d9a066', hair: '#4b2e17', hairStyle: 'short', beard: true, beardColor: '#4b2e17', beardStyle: 'short', robe: '#059669' },
  daniel: { skin: '#c68642', hair: '#111827', hairStyle: 'short', robe: '#dc2626' },
  maria: { skin: '#fbd6ad', hair: '#78350f', hairStyle: 'wavy', headwear: 'hood', headwearColor: '#2563eb', robe: '#2563eb' },
  moises: { skin: '#d9a066', hair: '#e2e8f0', hairStyle: 'long', beard: true, beardColor: '#e2e8f0', beardStyle: 'long', robe: '#166534' },
  josue: { skin: '#d9a066', hair: '#111827', hairStyle: 'short', beard: true, beardColor: '#111827', beardStyle: 'short', robe: '#a16207' },
  davi: { skin: '#fbd6ad', hair: '#92400e', hairStyle: 'short', robe: '#d97706' },
  salomao: { skin: '#fbd6ad', hair: '#111827', hairStyle: 'buzz', headwear: 'crown', headwearColor: '#facc15', robe: '#a16207' },
  paulo: { skin: '#d9a066', hair: '#64748b', hairStyle: 'buzz', beard: true, beardColor: '#64748b', beardStyle: 'short', robe: '#4f46e5' },
};

interface NpcProps {
  /** id da história — define o motivo no peito */
  motif: string;
  /** cor da túnica (sobrescreve a do look) */
  tone?: string;
  /** barba (sobrescreve a do look) — atalho para usos sem preset */
  beard?: boolean;
  /** identidade visual: chave de `LOOKS` (ex.: 'moises') */
  preset?: string;
  /** aparência completa (prioridade sobre `preset`/`tone`/`beard`) */
  look?: Partial<NpcLook>;
  state?: NpcState;
  size?: number;
  className?: string;
}

/**
 * NPC de estação em SVG inline (skill `jogos-visual` §2/§3): figura com túnica
 * com dobras, rosto próprio (orelhas, sobrancelhas, nariz, bochechas, barba por
 * estilo) e o **motivo da história no peito**. Substitui o emoji de NPC por arte
 * própria, que anima e não muda de cara entre aparelhos.
 */
export default function Npc({
  motif,
  tone,
  beard,
  preset,
  look: lookOverride,
  state = 'idle',
  size = 64,
  className,
}: NpcProps) {
  const uid = useId().replace(/[:]/g, '');
  const anim = state === 'happy' ? 'animate-pop' : 'animate-hero-bob';

  const look: NpcLook = {
    ...DEFAULT_LOOK,
    ...(preset ? LOOKS[preset] : {}),
    ...(typeof tone !== 'undefined' ? { robe: tone } : {}),
    ...(typeof beard !== 'undefined' ? { beard, beardColor: DEFAULT_LOOK.beardColor } : {}),
    ...(lookOverride ?? {}),
  };

  const { skin, hair, hairStyle, beardColor, beardStyle, headwear, headwearColor, robe } = look;

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={`${anim} ${className ?? ''}`} aria-hidden>
      <defs>
        <linearGradient id={`robe-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={robe} />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id={`face-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skin} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* véu/capa da cabeça (Maria) — atrás do rosto */}
      {headwear === 'hood' ? (
        <path
          d="M11.6 15C11.6 4.8 36.4 4.8 36.4 15v4.6c-5-3-17.8-3-24.8 0Z"
          fill={headwearColor}
          stroke="#0f172a"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ) : null}

      {/* pescoço */}
      <rect x="21" y="17.5" width="6" height="6" rx="2" fill={skin} stroke="#0f172a" strokeWidth="1.2" />

      {/* túnica com dobras e gola */}
      <path
        d="M24 19a10.5 10.5 0 0 0-10.5 10.5L10 45h28l-3.5-15.5A10.5 10.5 0 0 0 24 19Z"
        fill={`url(#robe-${uid})`}
        stroke="#0f172a"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M20.5 21.5 18 45M27.5 21.5 30 45M24 22.5V45" stroke="#0f172a" strokeWidth="0.8" opacity="0.22" />
      <path d="M18.5 22.5q5.5 3.2 11 0" fill="none" stroke="#0f172a" strokeWidth="1.1" opacity="0.5" />

      {/* cordão/cinto */}
      <path d="M14.5 31h19" stroke="#fde047" strokeWidth="2.6" strokeLinecap="round" />

      {/* emblema com o motivo da história */}
      <circle cx="24" cy="35.5" r="6.4" fill="#fffdf5" stroke="#0f172a" strokeWidth="1.4" />
      <svg x="17.6" y="29.1" width="12.8" height="12.8" viewBox="0 0 24 24">
        {motifArt(motif)}
      </svg>

      {/* cabeça */}
      <circle cx="24" cy="12.5" r="10" fill={`url(#face-${uid})`} stroke="#0f172a" strokeWidth="1.8" />
      {/* orelhas */}
      <circle cx="14.2" cy="13.2" r="2" fill={skin} stroke="#0f172a" strokeWidth="1" />
      <circle cx="33.8" cy="13.2" r="2" fill={skin} stroke="#0f172a" strokeWidth="1" />

      {/* cabelo por estilo */}
      {hairStyle === 'long' ? (
        <>
          <path d="M14.4 12c.4-5.6 4.8-9 9.6-9s9.2 3.4 9.6 9c-2.6-2.1-6-3.2-9.6-3.2s-7 1.1-9.6 3.2Z" fill={hair} />
          <path d="M14.2 12.6c-1 3.4-.6 6.6.8 9.2 1.2-.6 1.6-3.4 1.4-6.4Zm19.6 0c1 3.4.6 6.6-.8 9.2-1.2-.6-1.6-3.4-1.4-6.4Z" fill={hair} opacity="0.95" />
        </>
      ) : null}
      {hairStyle === 'short' || hairStyle === 'wavy' ? (
        <path
          d="M14.2 11C14.8 5.6 19 2.6 24 2.6S33.2 5.6 33.8 11c-2.7-2.3-6.1-3.4-9.8-3.4S17 8.7 14.2 11Z"
          fill={hair}
        />
      ) : null}
      {hairStyle === 'buzz' ? (
        <path
          d="M14.6 12.4C15 7.2 18.9 4.4 24 4.4s9 2.8 9.4 8c-2.6-1.9-6-2.9-9.4-2.9s-6.8 1-9.4 2.9Z"
          fill={hair}
        />
      ) : null}
      {hairStyle === 'wavy' ? (
        <path d="M14 12.5c-1.4 1-.8 3.3.6 3.3 1.6.1 2.6-2 3.4-3.8-1.5.9-2.8 1.3-4 .5Zm20 0c1.4 1 .8 3.3-.6 3.3-1.6.1-2.6-2-3.4-3.8 1.5.9 2.8 1.3 4 .5Zm-10 1.6c-1.7.2-2.9 1.9-2.7 3.4 1.5.2 3-1 3.4-2.6Z" fill={hair} />
      ) : null}

      {/* coroa / faixa */}
      {headwear === 'crown' ? (
        <>
          <path
            d="m14 6.2 1.8-2.2 2 1.9 2.1-2.3 2.1 2.3 2.1-2.3 2.1 2.3 2-1.9 1.8 2.2v3.2H14Z"
            fill={headwearColor}
            stroke="#0f172a"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="7.6" r="0.9" fill="#ef4444" />
          <circle cx="24" cy="7.6" r="0.9" fill="#38bdf8" />
          <circle cx="30" cy="7.6" r="0.9" fill="#22c55e" />
        </>
      ) : null}
      {headwear === 'headband' ? (
        <path d="M14.6 9.4h18.8v3.4H14.6Z" fill={headwearColor} stroke="#0f172a" strokeWidth="1.2" />
      ) : null}

      {/* barba por estilo */}
      {look.beard && beardStyle === 'long' ? (
        <path
          d="M16.2 14c-.4 5.6 1.6 12 7.8 12s8.2-6.4 7.8-12c-1.6 2.8-4.4 3.9-7.8 3.9s-6.2-1.1-7.8-3.9Z"
          fill={beardColor}
          stroke="#0f172a"
          strokeWidth="0.9"
          strokeOpacity="0.55"
        />
      ) : null}
      {look.beard && beardStyle !== 'long' ? (
        <path
          d="M17 14.5c0 5 3.2 8.4 7 8.4s7-3.4 7-8.4c-1.6 2.6-4.2 3.6-7 3.6s-5.4-1-7-3.6Z"
          fill={beardColor}
          stroke="#0f172a"
          strokeWidth="0.9"
          strokeOpacity="0.55"
        />
      ) : null}
      {/* bigode */}
      {look.beard ? (
        <path d="M20.6 15.4q3.4 1.6 6.8 0" fill="none" stroke={beardColor} strokeWidth="1.6" strokeLinecap="round" />
      ) : null}

      {/* sobrancelhas */}
      {state === 'sad' ? (
        <path d="M17.6 10.6l3.4 1M30.4 10.6l-3.4 1" stroke={hair} strokeWidth="1.2" strokeLinecap="round" />
      ) : (
        <path d="M17.6 11q1.9-.8 3.6 0M26.8 11q1.7-.8 3.6 0" stroke={hair} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      )}

      {/* nariz + bochechas */}
      <path d="M24 13.6v1.6" stroke="#c98a5b" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="18.8" cy="15.6" rx="1.8" ry="1.1" fill="#f9a8a8" opacity="0.5" />
      <ellipse cx="29.2" cy="15.6" rx="1.8" ry="1.1" fill="#f9a8a8" opacity="0.5" />

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
          <ellipse cx="20" cy="12.8" rx="1.5" ry="1.8" fill="#111827" />
          <ellipse cx="28" cy="12.8" rx="1.5" ry="1.8" fill="#111827" />
          <circle cx="20.5" cy="12.2" r="0.5" fill="#fff" />
          <circle cx="28.5" cy="12.2" r="0.5" fill="#fff" />
          <path d="M21 17.4q3 2.2 6 0" stroke="#7f1d1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
