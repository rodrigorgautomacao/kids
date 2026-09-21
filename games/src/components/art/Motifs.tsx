import type { ReactNode } from 'react';

/**
 * Motivos (silhuetas) de cada estação da Aventura — skill `jogos-visual` §6:
 * cada história precisa de um "cartão-postal" reconhecível de longe, não só
 * outro emoji. São poucos paths, então cabem no bundle e escalam sem borrar.
 *
 * A chave é o `id` da história em `GameAventuraBiblia.tsx`.
 */
const MOTIFS: Record<string, ReactNode> = {
  // Noé: arca com vela colorida
  noe: (
    <>
      <path d="M3 15h18l-3 5.5H6L3 15Z" fill="#b45309" stroke="#0f172a" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 4v6" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 5.5c3-1.5 6-1 8 1-4-1.5-7-1.5-8-1Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.1" strokeLinejoin="round" />
    </>
  ),
  // Criação: sol
  criacao: (
    <>
      <circle cx="12" cy="12" r="5" fill="#fde047" stroke="#0f172a" strokeWidth="1.4" />
      <path
        d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2L7 7M17 17l1.8 1.8M18.8 5.2L17 7M7 17l-1.8 1.8"
        stroke="#f59e0b"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  ),
  // Elias: chama no carro de fogo
  elias: (
    <>
      <path
        d="M8 16c0-4 3-5 3-9 2 2 3 3.5 3 5.5 1-1 1.8-2 2.2-3.2C17.5 11 19 13 19 16a5.5 5.5 0 0 1-11 0Z"
        fill="#f97316"
        stroke="#0f172a"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="19" r="3.2" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.4" />
      <circle cx="12" cy="19" r="1" fill="#1e293b" />
    </>
  ),
  // Jonas: grande peixe
  jonas: (
    <>
      <path
        d="M3 12c3-4 7-5 11-3 2 1 3 2.2 4 3-1 .8-2 2-4 3-4 2-8 1-11-3Z"
        fill="#38bdf8"
        stroke="#0f172a"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M18 12l3.2-3v6L18 12Z" fill="#0ea5e9" stroke="#0f172a" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="7.6" cy="11" r="1.1" fill="#0f172a" />
    </>
  ),
  // Eliseu: ursa
  eliseu: (
    <>
      <circle cx="7" cy="7" r="3" fill="#92400e" stroke="#0f172a" strokeWidth="1.3" />
      <circle cx="17" cy="7" r="3" fill="#92400e" stroke="#0f172a" strokeWidth="1.3" />
      <circle cx="12" cy="13" r="7" fill="#b45309" stroke="#0f172a" strokeWidth="1.4" />
      <circle cx="9.6" cy="12" r="1.1" fill="#0f172a" />
      <circle cx="14.4" cy="12" r="1.1" fill="#0f172a" />
      <path d="M10.4 16q1.6 1.4 3.2 0" stroke="#0f172a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </>
  ),
  // Daniel: leão
  daniel: (
    <>
      <circle cx="12" cy="12" r="9.2" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="5.4" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.3" />
      <circle cx="10" cy="11" r="1" fill="#0f172a" />
      <circle cx="14" cy="11" r="1" fill="#0f172a" />
      <path d="M10.4 14.4q1.6 1.5 3.2 0" stroke="#0f172a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  // Natal: estrela de Belém
  natal: (
    <path
      d="M12 2l2.3 5.4 5.7.8-4.2 4 1 5.8-4.8-2.7-4.8 2.7 1-5.8-4.2-4 5.7-.8L12 2Z"
      fill="#fde047"
      stroke="#0f172a"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  ),
  // Moisés: mar aberto
  moises: (
    <>
      <path d="M3.5 18c2-3 2-9 0-12" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M20.5 18c-2-3-2-9 0-12" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M8.5 19.5h7" stroke="#fcd34d" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  // Josué: muralha + trombeta
  josue: (
    <>
      <rect x="3.5" y="10" width="10" height="10.5" rx="1" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.3" />
      <path d="M3.5 13.6h10M3.5 17.2h10M8.5 10v10.5" stroke="#64748b" strokeWidth="1" />
      <path d="M14.5 12l6.5-3.2v8.4L14.5 14v-2Z" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.3" strokeLinejoin="round" />
    </>
  ),
  // Davi: funda e pedra
  davi: (
    <>
      <path d="M12 3v7" stroke="#92400e" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M12 10l-5 6M12 10l5 6" stroke="#92400e" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M7 16.5q5 3 10 0" stroke="#0f172a" strokeWidth="1.3" fill="none" />
      <circle cx="12" cy="20" r="2.3" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.3" />
    </>
  ),
  // Salomão: coroa (sabedoria)
  salomao: (
    <>
      <path
        d="M3 16.5 4.5 7l4.4 5L12 4.5 15.1 12l4.4-5L21 16.5H3Z"
        fill="#fde047"
        stroke="#0f172a"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <rect x="3.6" y="16.6" width="16.8" height="3.6" rx="1.2" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.3" />
    </>
  ),
  // Paulo: a luz do caminho de Damasco
  paulo: (
    <path
      d="M13.5 2 5 13.5h5.2L9 22l8.6-11.7h-5.3L13.5 2Z"
      fill="#fde047"
      stroke="#0f172a"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  ),
};

const FALLBACK = (
  <path
    d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"
    fill="#cbd5e1"
    stroke="#0f172a"
    strokeWidth="1.3"
    strokeLinejoin="round"
  />
);

interface MotifProps {
  id: string;
  size?: number;
  className?: string;
}

/** Silhueta da estação (24×24 por padrão). Cai num losango neutro se faltar id. */
export default function Motif({ id, size = 24, className }: MotifProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      {MOTIFS[id] ?? FALLBACK}
    </svg>
  );
}

/** Só os paths do motivo — para embutir dentro de outro SVG (ex.: no peito do NPC). */
export function motifArt(id: string): ReactNode {
  return MOTIFS[id] ?? FALLBACK;
}
