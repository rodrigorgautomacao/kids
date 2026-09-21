import type { ReactNode } from 'react';

/**
 * Motivos de cada estação da Aventura — skill `jogos-visual` §6: cada história
 * precisa de um "cartão-postal" reconhecível de longe, e FIEL ao objeto
 * bíblico (arca é arca, cajado é cajado, manto é manto — não outra coisa).
 *
 * Estilo: ilustração plana com contorno, paleta da marca, sem blur/filtros
 * pesados (perf mobile). A chave é o `id` da história em `GameAventuraBiblia.tsx`.
 */
const MOTIFS: Record<string, ReactNode> = {
  // Noé: a ARCA de madeira (casco retangular, telhado em duas águas, janela e porta)
  noe: (
    <>
      <path
        d="M2.6 13.4h18.8l-1.7 6.2c-4.9 2.1-11.7 2.1-15.4 0l-1.7-6.2Z"
        fill="#b45309"
        stroke="#0f172a"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M2.6 13.4 12 6.6l9.4 6.8" fill="#92400e" stroke="#0f172a" strokeWidth="1.3" strokeLinejoin="round" />
      <rect x="10.1" y="8.1" width="3.8" height="2.5" rx="0.6" fill="#fef3c7" stroke="#0f172a" strokeWidth="0.8" />
      <rect x="15.1" y="14.9" width="2.9" height="3.6" rx="0.6" fill="#78350f" stroke="#0f172a" strokeWidth="0.8" />
      <path d="M5.2 16.1h13.6" stroke="#92400e" strokeWidth="0.9" />
      <path d="M4.6 19.2c4.6 1.7 10.2 1.7 14.8 0" fill="none" stroke="#78350f" strokeWidth="0.9" />
    </>
  ),
  // Criação: sol com raios e núcleo
  criacao: (
    <>
      <circle cx="12" cy="11" r="4.6" fill="#fde047" stroke="#0f172a" strokeWidth="1.3" />
      <circle cx="12" cy="11" r="2.4" fill="#facc15" />
      <path
        d="M12 2.2v2.4M12 17.4v2.4M2.2 11h2.4M19.4 11h2.4M5 4l1.7 1.7M17.3 16.3 19 18M19 4l-1.7 1.7M6.7 16.3 5 18"
        stroke="#f59e0b"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  ),
  // Elias: fogo do céu sobre o altar de pedra
  elias: (
    <>
      <rect x="7" y="15.6" width="10" height="3.6" rx="0.8" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.2" />
      <path d="M8.6 15.6v-2.4M15.4 15.6v-2.4" stroke="#64748b" strokeWidth="1" />
      <path d="M5 19.4h14" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 2.8c.9 2.3 2.7 3.1 2.7 5.6 0 1.6-1.2 2.7-2.7 2.7s-2.7-1.1-2.7-2.7c0-2.5 1.8-3.3 2.7-5.6Z"
        fill="#f97316"
        stroke="#0f172a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 6.2c.4 1 1 1.4 1 2.3 0 .6-.5 1-1 1s-1-.4-1-1c0-.9.6-1.3 1-2.3Z" fill="#fde047" />
    </>
  ),
  // Jonas: grande peixe (com nadadeiras e guelra)
  jonas: (
    <>
      <path
        d="M2.8 12c3.2-4.2 7.6-5.4 11.6-3.2 1.9 1 3.1 2.2 4.1 3.2-1 1-2.2 2.2-4.1 3.2-4 2.2-8.4 1-11.6-3.2Z"
        fill="#38bdf8"
        stroke="#0f172a"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M18.6 12 22 8.7v6.6L18.6 12Z" fill="#0ea5e9" stroke="#0f172a" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7.8 9.3c1.7 1.5 1.7 4 0 5.4" fill="none" stroke="#0ea5e9" strokeWidth="1" />
      <path d="M11.6 8.5c.7 1.7.7 5.3 0 7" fill="none" stroke="#0ea5e9" strokeWidth="1" />
      <circle cx="6.4" cy="11.1" r="1" fill="#0f172a" />
    </>
  ),
  // Eliseu: o manto (2 Reis 2)
  eliseu: (
    <>
      <path
        d="M12 2.4c-2.6 0-4.5 1.9-4.5 4.4L3.9 19c-.2 1.1.6 2 1.7 2h12.8c1.1 0 1.9-.9 1.7-2l-3.6-12.2c0-2.5-1.9-4.4-4.5-4.4Z"
        fill="#7c3aed"
        stroke="#0f172a"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M12 2.4v18.6" stroke="#5b21b6" strokeWidth="1" />
      <path d="M9.2 4.1 12 7l2.8-2.9" fill="none" stroke="#fef3c7" strokeWidth="1.2" strokeLinejoin="round" />
    </>
  ),
  // Daniel: leão (juba com pontas)
  daniel: (
    <>
      <path
        d="M12 2.6 14 5l3.2-.6 1.2 3 3 .6-.6 3 2.2 2-2.2 2 .6 3-3 .6-1.2 3L14 18.6 12 21l-2-2.4-3.2.6-1.2-3-3-.6.6-3L1 10.6l2.2-2-.6-3 3-.6 1.2-3L10 5l2-2.4Z"
        fill="#f59e0b"
        stroke="#0f172a"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11.4" r="5.2" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="10.1" cy="10.6" r="1" fill="#0f172a" />
      <circle cx="13.9" cy="10.6" r="1" fill="#0f172a" />
      <path d="M10.4 13.7q1.6 1.5 3.2 0" stroke="#0f172a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  // Natal: estrela de Belém com brilho
  natal: (
    <>
      <path
        d="M12 2l2.3 5.4 5.7.8-4.2 4 1 5.8-4.8-2.7-4.8 2.7 1-5.8-4.2-4 5.7-.8L12 2Z"
        fill="#fde047"
        stroke="#0f172a"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M12 5.6 13 9l3 .4-2.2 2 .5 2.9L12 12.8 9.7 14.3l.5-2.9L8 9.4l3-.4 1-3.4Z" fill="#fef9c3" opacity="0.75" />
    </>
  ),
  // Moisés: o mar aberto com caminho seco
  moises: (
    <>
      <path d="M4 19c1.8-3 1.8-9 0-12" stroke="#0ea5e9" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M20 19c-1.8-3-1.8-9 0-12" stroke="#0ea5e9" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M8.5 19.6h7" stroke="#fcd34d" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M6.6 8.4c1 1.4 1 3.3 0 4.7M17.4 8.4c-1 1.4-1 3.3 0 4.7" stroke="#7dd3fc" strokeWidth="0.9" fill="none" />
    </>
  ),
  // Josué: muralha de Jericó + trombeta
  josue: (
    <>
      <rect x="3" y="9.6" width="10.4" height="10.9" rx="0.8" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.2" />
      <path d="M3 12.9h10.4M3 16.3h10.4M3 19.6h10.4M8.2 9.6v10.9" stroke="#64748b" strokeWidth="0.9" />
      <path d="M5.5 9.6V7.6M8.2 9.6V7.6M10.9 9.6V7.6" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
      <path d="M13.8 12.3l7.2-3.6v7l-7.2-3.4Z" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M13.8 12.3h-1.6" stroke="#0f172a" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  // Davi: o CAJADO de pastor (vara com gancho) e a pedra
  davi: (
    <>
      <path d="M10.6 21.4V8.2" stroke="#92400e" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M10.6 8.2c0-2.7 2-4.5 4.3-4.5 2 0 3.4 1.4 3.4 3.2 0 1.7-1.3 2.8-2.8 2.8"
        fill="none"
        stroke="#92400e"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M11.6 20.6h-2" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
      <circle cx="16.1" cy="4.6" r="1" fill="#fcd34d" stroke="#0f172a" strokeWidth="0.7" />
      <circle cx="17.6" cy="20.6" r="1.8" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.1" />
    </>
  ),
  // Salomão: coroa com pedras
  salomao: (
    <>
      <path
        d="M3 16.4 4.5 6.8l4.4 5L12 4.2l3.1 7.6 4.4-5L21 16.4H3Z"
        fill="#fde047"
        stroke="#0f172a"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <rect x="3.6" y="16.5" width="16.8" height="3.7" rx="1.2" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="8" cy="18.3" r="0.9" fill="#ef4444" />
      <circle cx="12" cy="18.3" r="0.9" fill="#38bdf8" />
      <circle cx="16" cy="18.3" r="0.9" fill="#22c55e" />
    </>
  ),
  // Paulo: o pergaminho das cartas (e a luz do caminho)
  paulo: (
    <>
      <rect x="7" y="5.2" width="10" height="13.6" rx="1.6" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.3" />
      <ellipse cx="7" cy="5.2" rx="2.3" ry="1.7" fill="#fde68a" stroke="#0f172a" strokeWidth="1" />
      <ellipse cx="17" cy="5.2" rx="2.3" ry="1.7" fill="#fde68a" stroke="#0f172a" strokeWidth="1" />
      <path d="M9.4 9.6h5.2M9.4 12.2h5.2M9.4 14.8h3.4" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
      <path d="M17.6 19.6l1.8-1.8M4.6 19.6l-1.8-1.8" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
    </>
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

/** Cartão-postal da estação (24×24). Cai num losango neutro se faltar id. */
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
