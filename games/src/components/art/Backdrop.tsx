// Cenários de palco do teatro da Aventura (Fase 6).
//
// Estilo: ilustração plana com gradientes (skill `jogos-visual` §2/§12) —
// SEM blur/sombras embaçadas (perf) e sempre com paleta da marca.
// Cada cena é um SVG `viewBox 0 0 400 300` esticado com `slice` para cobrir
// o palco; o conteúdo importante fica na faixa central (o "proscênio").
//
// As cenas são REUTILIZÁVEIS: uma cena do catálogo (`data/scenes.ts`) escolhe
// o cenário por `backdrop`. Mudanças de iluminação/ambiente vêm da própria
// cena (props + personagem), não de uma imagem única por história.

import type { BackdropId } from '../../data/scenes';

function uid(prefix: string) {
  return `${prefix}`;
}

/** Estrela pontual (reaproveitada nos fundos noturnos). */
function Star({ x, y, s = 3, o = 1 }: { x: number; y: number; s?: number; o?: number }) {
  return <circle cx={x} cy={y} r={s} fill="#fff" opacity={o} />;
}

/** Lua crescente (fundo noturno). */
function Moon({ cx, cy, r = 26 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fef3c7" />
      <circle cx={cx + r * 0.45} cy={cy - r * 0.25} r={r * 0.85} fill="rgba(2,6,23,0.92)" />
    </g>
  );
}

/** Faixa de ondas simples (água em movimento). */
function Waves({ y, color }: { y: number; color: string }) {
  return (
    <g stroke={color} fill="none" strokeWidth={2.5} strokeLinecap="round">
      <path d={`M0 ${y} q 8 -6 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0`} />
      <path d={`M0 ${y + 14} q 8 -6 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0`} opacity={0.6} />
    </g>
  );
}

/** Arca estilizada (corpo + cabine + janela). */
function Ark({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const k = scale;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M0 30 Q 6 2 30 2 L 78 2 Q 100 6 104 30 Z" fill="#92400e" />
      <path d="M12 30 Q 16 12 34 12 L 74 12 Q 92 14 94 30 Z" fill="#b45309" />
      <rect x="52" y="16" width="26" height="12" rx="3" fill="#fef3c7" />
      <rect x="16" y="22" width="14" height="7" rx="2" fill="#fde68a" opacity={0.85} />
      <path d="M0 30 L 104 30 L 100 38 L 4 38 Z" fill="#78350f" />
      <path d="M10 38 L 16 30" stroke="#fcd34d" strokeWidth={2} fill="none" />
    </g>
  );
}

/**
 * Cenário de fundo do palco. `preserveAspectRatio="xMidYMid slice"` garante
 * que cubra qualquer proporção de tela sem deformar (recorta os lados).
 */
export default function Backdrop({ id }: { id: BackdropId }) {
  const g = { sky: uid('sky'), sea: uid('sea'), luz: uid('luz') };

  switch (id) {
    case 'arca':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <circle cx="330" cy="58" r="30" fill="#fde047" opacity={0.95} />
          <path d="M0 210 Q 100 190 210 205 Q 320 218 400 200 L 400 300 L 0 300 Z" fill="#d4b57a" />
          <rect x="0" y="236" width="400" height="64" fill="#b8d8e8" opacity={0.5} />
          <Waves y={252} color="#7dd3fc" />
          <Ark x={112} y={186} scale={1.7} />
          <Gulls />
        </svg>
      );

    case 'diluvio':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#334155" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <g stroke="#94a3b8" strokeWidth={2} opacity={0.7}>
            {[10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310, 330, 350, 370, 390].map(
              (x, i) => (
                <path key={x} d={`M${x} ${i % 2 === 0 ? -6 : 4} l -5 12`} />
              ),
            )}
          </g>
          <rect y="210" width="400" height="90" fill="#1e3a8a" opacity={0.95} />
          <Waves y={230} color="#60a5fa" />
          <Waves y={262} color="#3b82f6" />
          <Ark x={58} y={164} scale={1.5} />
        </svg>
      );

    case 'arco-iris':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bae6fd" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <path d="M0 240 Q 200 190 400 240 L 400 300 L 0 300 Z" fill="#7dd3fc" />
          <Waves y={258} color="#38bdf8" />
          {(
            [
              ['#ef4444', 70],
              ['#f97316', 62],
              ['#facc15', 54],
              ['#22c55e', 46],
              ['#3b82f6', 38],
              ['#8b5cf6', 30],
            ] as Array<[string, number]>
          ).map(([c, r]) => (
            <path key={c} d={`M 78 234 a 60 ${r} 0 0 1 244 0`} stroke={c} strokeWidth={6} fill="none" opacity={0.9} />
          ))}
          <Ark x={122} y={196} scale={1.6} />
          <path d="M0 280 Q 200 262 400 280 L 400 300 L 0 300 Z" fill="#65a30d" opacity={0.55} />
        </svg>
      );

    case 'noite':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#150b2e" />
              <stop offset="1" stopColor="#3730a3" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <Moon cx={316} cy={56} />
          <Star x={52} y={44} s={3} />
          <Star x={120} y={86} s={2.5} o={0.8} />
          <Star x={210} y={38} s={3.5} />
          <Star x={278} y={112} s={2.5} o={0.7} />
          <Star x={386} y={66} s={2.5} o={0.85} />
          <Star x={92} y={140} s={2} o={0.6} />
          <path d="M0 224 Q 90 198 190 216 Q 300 234 400 212 L 400 300 L 0 300 Z" fill="#1e1b4b" />
          <path d="M0 260 Q 150 232 400 258 L 400 300 L 0 300 Z" fill="#312e81" opacity={0.8} />
        </svg>
      );

    case 'deserto':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fde68a" />
              <stop offset="1" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <circle cx="70" cy="62" r="34" fill="#fbbf24" opacity={0.95} />
          <path d="M0 250 Q 60 216 130 244 Q 200 272 280 240 Q 340 220 400 244 L 400 300 L 0 300 Z" fill="#fcd34d" />
          <path d="M0 278 Q 120 252 260 276 Q 340 290 400 272 L 400 300 L 0 300 Z" fill="#f59e0b" opacity={0.55} />
          <path d="M60 270 Q 90 254 120 268" stroke="#d97706" strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round" />
          <path d="M300 286 Q 330 270 360 284" stroke="#d97706" strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round" />
        </svg>
      );

    case 'sarca':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#7c2d12" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <path d="M0 262 Q 120 226 400 260 L 400 300 L 0 300 Z" fill="#b45309" />
          <ellipse cx="200" cy="222" rx="58" ry="10" fill="#fbbf24" opacity={0.55} />
          <g transform="translate(200 196)">
            <path d="M0 4 q -18 -14 -6 -30 q 4 10 12 8 q 6 -14 22 -4 q 2 10 -6 14 q 12 4 4 18 q -12 -2 -12 -8 q -4 10 -14 6 q -4 -3 0 -4 Z" fill="#166534" />
            <path d="M0 12 q -8 -6 -2 -16 q 3 8 8 6 q 4 -10 14 -2 q 1 8 -4 10 q 8 4 2 12 q -8 -2 -8 -6 q -2 7 -8 4 q -3 -3 -2 -4 Z" fill="#14532d" />
            <g fill="#fb923c">
              <path d="M-16 -16 q -6 -12 2 -22 q 4 10 10 8 q 2 12 -12 14 Z" />
              <path d="M10 -22 q -2 -12 8 -18 q 2 10 10 4 q 4 12 -18 14 Z" />
              <path d="M2 -34 q -2 -10 6 -14 q 2 7 9 2 q 1 10 -15 12 Z" />
            </g>
            <ellipse cx="0" cy="-12" rx="26" ry="20" fill="#fdba74" opacity={0.5} />
            <g fill="#f97316" opacity={0.7}>
              <path d="M-22 -18 q -3 -6 3 -10 q 2 5 7 1 q 1 7 -10 9 Z" />
            </g>
          </g>
        </svg>
      );

    case 'mar-aberto':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#bae6fd" />
            </linearGradient>
            <linearGradient id={g.sea} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1d4ed8" />
              <stop offset="1" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <path d="M30 96 q 22 -14 44 0 t 44 0 t 44 0 t 44 0 t 44 0 t 44 0 t 44 0 t 44 0 t 44 0" stroke="#fff" strokeWidth={5} fill="none" opacity={0.55} />
          <rect y="120" width="400" height="180" fill={`url(#${g.sea})`} />
          <Waves y={150} color="#60a5fa" />
          <Waves y={196} color="#3b82f6" />
          <Waves y={242} color="#2563eb" />
          <g transform="translate(56 132)" opacity={0.95}>
            <path d="M0 0 L 46 0 L 40 -26 L 30 -26 L 28 -12 L 8 -12 L 6 -26 L -4 -26 Z" fill="#78350f" />
            <rect x="-2" y="0" width="50" height="5" fill="#92400e" />
            <path d="M36 -22 L 54 -28 L 52 -24 L 64 -30" stroke="#57534e" strokeWidth={3} fill="none" />
            <circle cx="34" cy="-15" r="2.4" fill="#fef3c7" />
          </g>
        </svg>
      );

    case 'peixe':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <radialGradient id={uid('pelo')} cx="0.5" cy="0.35" r="0.9">
              <stop offset="0" stopColor="#92400e" />
              <stop offset="1" stopColor="#450a0a" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${uid('pelo')})`} />
          <path d="M0 72 Q 200 -18 400 72 L 400 0 L 0 0 Z" fill="#7c2d12" opacity={0.7} />
          <g stroke="#f59e0b" strokeWidth={5} fill="none" opacity={0.25} strokeLinecap="round">
            <path d="M40 120 Q 200 60 360 120" />
            <path d="M20 160 Q 200 100 380 160" />
            <path d="M50 200 Q 200 140 350 200" />
          </g>
          <g fill="#fde68a" opacity={0.35}>
            <circle cx="120" cy="128" r="4" />
            <circle cx="210" cy="96" r="3" />
            <circle cx="300" cy="150" r="3.5" />
            <circle cx="330" cy="212" r="2.5" />
          </g>
          <path d="M100 300 Q 150 190 230 210 Q 300 250 340 300 Z" fill="#1c1917" opacity={0.6} />
        </svg>
      );

    case 'mar-separado':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fde68a" />
              <stop offset="1" stopColor="#fef3c7" />
            </linearGradient>
            <linearGradient id={g.sea} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0ea5e9" />
              <stop offset="1" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <circle cx="330" cy="54" r="26" fill="#fbbf24" opacity={0.9} />
          {/* paredes de água */}
          <path d="M0 60 Q 90 70 118 250 L 128 300 L 0 300 Z" fill={`url(#${g.sea})`} />
          <path d="M400 60 Q 310 70 282 250 L 272 300 L 400 300 Z" fill={`url(#${g.sea})`} />
          <path d="M96 102 q 18 -8 26 0 q -8 12 -26 6 Z" fill="#7dd3fc" opacity={0.9} />
          <path d="M326 120 q -16 -8 -24 0 q 8 12 24 6 Z" fill="#7dd3fc" opacity={0.9} />
          <path d="M84 180 q 22 -8 30 2 q -10 12 -30 4 Z" fill="#bae6fd" opacity={0.85} />
          <path d="M340 190 q -20 -8 -28 2 q 10 12 28 4 Z" fill="#bae6fd" opacity={0.85} />
          <g fill="#0284c7" opacity={0.35}>
            <path d="M150 60 q 8 -16 20 -4 q -2 12 -20 4 Z" />
            <path d="M236 64 q -10 -14 2 -12 q 4 12 -8 12 Z" />
          </g>
          {/* peixes nadando nas paredes */}
          <g fill="#7dd3fc" opacity={0.8}>
            <path d="M146 152 q 14 -6 20 2 q -8 8 -20 0 Z" />
            <path d="M250 168 q -12 -6 -18 2 q 8 8 20 0 Z" />
            <path d="M140 220 q 12 -5 18 2 q -8 7 -18 0 Z" />
          </g>
          {/* caminho seco */}
          <path d="M118 250 Q 200 232 282 250 L 272 300 L 128 300 Z" fill="#d97706" />
          <path d="M118 250 Q 200 232 282 250" stroke="#fbbf24" strokeWidth={4} fill="none" />
        </svg>
      );

    case 'monte':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#312e81" />
              <stop offset="1" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <g fill="#334155">
            <path d="M-30 200 L 120 30 L 210 160 Z" />
            <path d="M230 210 L 330 60 L 440 220 Z" />
          </g>
          <path d="M120 30 L 104 56 L 136 30 Z" fill="#e2e8f0" />
          <path d="M114 66 L 96 92 L 132 66 Z" fill="#475569" />
          <path d="M330 60 L 318 80 L 344 60 Z" fill="#e2e8f0" />
          {/* fogo e fumaça no topo */}
          <g transform="translate(116 34)">
            <path d="M0 0 q -8 -10 0 -18 q 8 8 14 0 q 4 10 -4 16 q -6 -6 -10 -8 Z" fill="#f97316" />
            <ellipse cx="6" cy="-16" rx="12" ry="7" fill="#f59e0b" opacity={0.8} />
          </g>
          <path d="M96 6 q 12 -14 30 -10 q 10 4 14 16 q -8 6 -16 2 q -12 4 -16 -4 q -8 4 -12 -4 Z" fill="#94a3b8" opacity={0.85} />
          <g stroke="#fde047" strokeWidth={3.5} fill="none" opacity={0.9}>
            <path d="M196 24 l -16 30 l 6 4 l 10 -22 l 12 18 l 4 -6 Z" />
          </g>
          <path d="M0 250 Q 120 226 400 252 L 400 300 L 0 300 Z" fill="#1e293b" />
        </svg>
      );

    case 'rio':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bae6fd" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
            <linearGradient id={g.sea} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <circle cx="320" cy="64" r="26" fill="#fde047" opacity={0.9} />
          <path d="M0 190 Q 100 168 210 184 Q 320 198 400 178 L 400 300 L 0 300 Z" fill="#65a30d" opacity={0.5} />
          <path d="M0 214 Q 110 192 400 206 L 400 300 L 0 300 Z" fill={`url(#${g.sea})`} />
          <Waves y={238} color="#7dd3fc" />
          <Waves y={270} color="#38bdf8" />
          {/* juncos */}
          <g stroke="#166534" strokeWidth={4} strokeLinecap="round">
            <path d="M66 214 L 58 184" />
            <path d="M78 214 L 78 178" />
            <path d="M90 214 L 98 186" />
          </g>
          <g stroke="#15803d" strokeWidth={4} strokeLinecap="round">
            <path d="M310 208 L 304 180" />
            <path d="M324 208 L 326 174" />
            <path d="M338 208 L 344 184" />
          </g>
          <ellipse cx="150" cy="236" rx="16" ry="5" fill="#38bdf8" opacity={0.6} />
          <ellipse cx="260" cy="268" rx="14" ry="4" fill="#7dd3fc" opacity={0.7} />
        </svg>
      );

    case 'cidade':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fcd34d" />
              <stop offset="1" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <rect y="190" width="400" height="110" fill="#b45309" />
          {/* torres da muralha */}
          <rect x="24" y="96" width="64" height="168" fill="#a16207" />
          <path d="M6 96 L 106 96 L 106 112 L 6 112 Z" fill="#a16207" />
          <rect x="312" y="96" width="64" height="168" fill="#a16207" />
          <path d="M294 96 L 394 96 L 394 112 L 294 112 Z" fill="#a16207" />
          {/* portão */}
          <path d="M150 300 L 150 150 A 50 50 0 0 1 250 150 L 250 300 Z" fill="#78350f" />
          <path d="M166 300 L 166 170 A 34 34 0 0 1 234 170 L 234 300 Z" fill="#92400e" />
          {/* janelas/torus das torres */}
          <circle cx="56" cy="140" r="9" fill="#fde68a" />
          <circle cx="344" cy="140" r="9" fill="#fde68a" />
          <rect x="172" y="210" width="20" height="20" rx="3" fill="#451a03" />
          <rect x="208" y="210" width="20" height="20" rx="3" fill="#451a03" />
          {/* bandeirinhas */}
          <path d="M56 96 L 56 84 L 70 90 Z" fill="#dc2626" />
          <path d="M344 96 L 344 84 L 358 90 Z" fill="#2563eb" />
        </svg>
      );

    case 'muralha':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fb923c" />
              <stop offset="1" stopColor="#fed7aa" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <circle cx="66" cy="70" r="30" fill="#fbbf24" opacity={0.95} />
          <rect y="120" width="400" height="180" fill="#a16207" />
          <rect y="110" width="400" height="20" fill="#92400e" />
          {[10, 55, 100, 145, 190, 235, 280, 325, 370].map((x) => (
            <path key={x} d={`M${x} 130 l 12 -14 l 12 14`} fill="#92400e" />
          ))}
          <path d="M150 300 L 150 170 A 50 50 0 0 1 250 170 L 250 300 Z" fill="#78350f" />
          <path d="M168 300 L 168 188 A 32 32 0 0 1 232 188 L 232 300 Z" fill="#54595e" />
          <rect x="184" y="222" width="16" height="16" rx="2" fill="#1c1917" />
          <rect x="200" y="222" width="16" height="16" rx="2" fill="#1c1917" />
          <path d="M60 130 q 14 -20 26 0 q -12 -30 -26 -6 Z" fill="#fef3c7" opacity={0.4} />
        </svg>
      );

    case 'palacio':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fef3c7" />
              <stop offset="1" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <path d="M40 0 Q 200 70 360 0 L 400 0 L 400 300 L 0 300 L 0 0 Z" fill="#fef3c7" opacity={0.7} />
          <rect y="250" width="400" height="50" fill="#b45309" />
          <rect y="240" width="400" height="10" fill="#92400e" />
          {[46, 122, 198, 274, 350].map((x) => (
            <rect key={x} x={x} y="60" width="22" height="196" fill="#f5d78e" />
          ))}
          <rect x="166" y="140" width="68" height="116" fill="#eab308" rx="8" />
          <rect x="184" y="168" width="32" height="88" fill="#facc15" rx="4" />
          <path d="M196 174 L 208 150 L 220 174 L 208 166 Z" fill="#92400e" />
          <rect x="128" y="118" width="40" height="34" rx="6" fill="#fde047" stroke="#ca8a04" strokeWidth={4} />
          <rect x="232" y="118" width="40" height="34" rx="6" fill="#fde047" stroke="#ca8a04" strokeWidth={4} />
          {/* tapete */}
          <path d="M120 300 L 280 300 L 264 250 L 136 250 Z" fill="#dc2626" opacity={0.85} />
          <path d="M160 300 L 182 250 L 218 250 L 240 300 Z" fill="#991b1b" opacity={0.8} />
        </svg>
      );

    case 'casa':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fde68a" />
              <stop offset="1" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <rect y="250" width="400" height="50" fill="#b45309" />
          <rect y="240" width="400" height="10" fill="#92400e" />
          {/* parede */}
          <rect x="30" y="60" width="340" height="190" fill="#fbbf24" opacity={0.5} />
          {/* janela com luz */}
          <rect x="52" y="96" width="96" height="96" rx="10" fill="#1e293b" />
          <path d="M52 96 q 48 34 96 0 Z" fill="#38bdf8" opacity={0.7} />
          <rect x="100" y="96" width="4" height="96" fill="#b45309" />
          <rect x="52" y="144" width="96" height="4" fill="#b45309" />
          {/* lampião */}
          <g transform="translate(300 130)">
            <rect x="-3" y="-34" width="6" height="18" fill="#92400e" />
            <path d="M-22 0 Q 0 -26 22 0 Z" fill="#f59e0b" />
            <path d="M-22 0 L 22 0 L 16 14 L -16 14 Z" fill="#db2777" />
            <ellipse cx="0" cy="-2" rx="24" ry="20" fill="#fde047" opacity={0.35} />
          </g>
          {/* prateleira */}
          <rect x="46" y="226" width="120" height="8" fill="#92400e" />
          <rect x="64" y="200" width="26" height="26" rx="3" fill="#0ea5e9" opacity={0.85} />
          <rect x="102" y="206" width="30" height="20" rx="3" fill="#16a34a" opacity={0.85} />
        </svg>
      );

    case 'estabulo':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0f172a" />
              <stop offset="1" stopColor="#3730a3" />
            </linearGradient>
            <linearGradient id={g.luz} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fde047" stopOpacity="0.95" />
              <stop offset="1" stopColor="#fde047" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <Star x={60} y={40} s={3} o={0.9} />
          <Star x={150} y={80} s={2.5} o={0.7} />
          <Star x={330} y={48} s={3} o={0.85} />
          {/* abertura do telhado com feixe e a estrela */}
          <path d="M60 30 L 340 30 L 340 72 L 60 72 Z" fill="#0b1220" />
          <path d="M200 46 l 26 -2 l -26 20 q -16 0 -26 -18 Z" fill="#fde047" />
          <polygon points="200,28 226,30 200,52 174,30" fill="#fde047" />
          <path d="M0 96 q 100 -20 200 -14 q 100 6 200 14 L 400 72 L 400 96 Z" fill="#450a0a" />
          {/* paredes de madeira */}
          <rect y="96" width="400" height="204" fill="#78350f" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <rect key={i} x={i * 40} y={96 + (i % 2) * 18} width="40" height="8" fill="#92400e" opacity={0.8} />
          ))}
          <path d="M90 300 L 90 150 A 60 60 0 0 1 310 150 L 310 300 Z" fill="#0b1220" />
          <rect x="96" y="148" width="208" height="152" fill="#e7d8b0" />
          {/* feno */}
          <path d="M110 300 q 0 -40 60 -40 q 60 0 60 40 Z" fill="#fde047" />
          <path d="M150 300 q 0 -28 42 -28 q 42 0 42 28 Z" fill="#fbbf24" />
          <path d="M110 288 q 20 -6 40 10 q 30 -4 60 8" stroke="#d97706" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
        </svg>
      );

    case 'fornalha':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <radialGradient id={uid('fogo')} cx="0.5" cy="0.6" r="0.7">
              <stop offset="0" stopColor="#fdba74" />
              <stop offset="1" stopColor="#7f1d1d" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill="#1c1917" />
          <rect x="40" y="60" width="320" height="240" rx="14" fill="#334155" />
          <path d="M40 60 Q 200 20 360 60 Z" fill="#475569" />
          <path d="M84 120 A 116 116 0 0 1 316 120 L 316 300 L 84 300 Z" fill={`url(#${uid('fogo')})`} />
          <g fill="#f97316">
            <path d="M200 190 q -24 -30 0 -56 q 24 26 8 56 Z" opacity={0.9} />
            <path d="M152 210 q -20 -24 0 -46 q 18 22 4 46 Z" opacity={0.8} />
            <path d="M248 210 q 20 -24 0 -46 q -18 22 -4 46 Z" opacity={0.8} />
          </g>
          <g fill="#fde047">
            <path d="M206 196 q -10 -12 0 -22 q 9 10 0 22 Z" opacity={0.95} />
            <path d="M172 208 q -8 -10 0 -18 q 7 8 0 18 Z" opacity={0.85} />
            <path d="M228 208 q 8 -10 0 -18 q -7 8 0 18 Z" opacity={0.85} />
          </g>
          <g fill="#fdba74" opacity={0.5}>
            <circle cx="120" cy="150" r="3" />
            <circle cx="150" cy="126" r="2.5" />
            <circle cx="250" cy="138" r="3" />
            <circle cx="280" cy="168" r="2.5" />
          </g>
          <rect x="40" y="56" width="320" height="8" fill="#0f172a" opacity={0.6} />
        </svg>
      );

    case 'cova':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <radialGradient id={uid('caverna')} cx="0.5" cy="0.4" r="1">
              <stop offset="0" stopColor="#3f3f46" />
              <stop offset="1" stopColor="#18181b" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${uid('caverna')})`} />
          {/* luz da entrada */}
          <polygon points="40,0 360,0 320,120 80,120" fill="#fde68a" opacity={0.22} />
          <rect x="52" y="-4" width="296" height="14" fill="#0f172a" />
          {/* rochas irregulares */}
          <g fill="#27272a">
            <path d="M0 96 L 60 120 L 0 300 Z" />
            <path d="M400 96 L 340 120 L 400 300 Z" />
            <path d="M52 120 L 120 190 L 100 300 L 0 300 Z" />
            <path d="M348 120 L 280 190 L 300 300 L 400 300 Z" />
          </g>
          <path d="M120 190 Q 200 160 280 190 L 300 300 L 100 300 Z" fill="#3f3f46" />
          <g stroke="#52525b" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round">
            <path d="M150 220 q 16 -8 30 0" />
            <path d="M200 250 q 18 -8 34 0" />
            <path d="M120 268 q 16 -8 30 0" />
          </g>
        </svg>
      );

    case 'estrada':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d97706" />
              <stop offset="1" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id={uid('feixo')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fef9c3" stopOpacity="0.95" />
              <stop offset="1" stopColor="#fef9c3" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <path d="M120 0 L 280 0 L 260 40 L 140 40 Z" fill="#fff7ed" opacity={0.6} />
          <polygon points="118,0 282,0 262,140 138,140" fill={`url(#${uid('feixo')})`} />
          <path d="M0 210 Q 200 176 400 210 L 400 300 L 0 300 Z" fill="#b45309" />
          <path d="M0 240 Q 200 206 400 240 L 400 300 L 0 300 Z" fill="#92400e" />
          <path d="M168 300 L 156 226 L 244 226 L 232 300 Z" fill="#78350f" />
          <path d="M156 226 q 44 -18 88 0 L 232 300 L 168 300 Z" fill="#a16207" />
          <path d="M180 300 L 172 240 L 228 240 L 220 300 Z" fill="#fcd34d" opacity={0.5} />
          <g stroke="#fde68a" strokeWidth={2.5} fill="none" opacity={0.45}>
            <path d="M204 0 L 200 40" />
            <path d="M234 30 L 228 78" />
            <path d="M168 36 L 172 82" />
          </g>
        </svg>
      );

    case 'prisao':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1e293b" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          {/* janela com lua */}
          <rect x="268" y="58" width="86" height="86" rx="8" fill="#fef3c7" opacity={0.16} />
          <circle cx="311" cy="92" r="26" fill="#fef3c7" />
          <circle cx="323" cy="86" r="24" fill="#0f172a" />
          <g stroke="#334155" strokeWidth={7}>
            <line x1="268" y1="101" x2="354" y2="101" />
            <line x1="311" y1="58" x2="311" y2="144" />
          </g>
          <rect y="240" width="400" height="60" fill="#1e293b" />
          <rect y="232" width="400" height="8" fill="#334155" />
          {/* banco de pedra */}
          <rect x="50" y="206" width="150" height="26" rx="4" fill="#475569" />
          <rect x="64" y="232" width="26" height="20" fill="#475569" />
          <rect x="160" y="232" width="26" height="20" fill="#475569" />
          {/* palha */}
          <path d="M60 300 q 0 -30 40 -26 q 40 4 30 26 Z" fill="#a16207" opacity={0.8} />
          <path d="M150 300 q 10 -26 46 -20 q 30 6 18 20 Z" fill="#92400e" opacity={0.7} />
          <g stroke="#fef3c7" strokeWidth={2.5} opacity={0.3} strokeLinecap="round">
            <path d="M280 180 L 300 200" />
            <path d="M296 172 L 322 198" />
          </g>
        </svg>
      );

    case 'vale':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="1" stopColor="#fef9c3" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <circle cx="334" cy="60" r="30" fill="#fde047" />
          <g fill="#166534">
            <path d="M-40 210 L 110 60 L 0 60 Z" />
            <path d="M440 210 L 290 60 L 400 60 Z" />
          </g>
          <path d="M-40 210 Q 120 150 260 190 Q 350 220 440 196 L 440 300 L -40 300 Z" fill="#65a30d" />
          <path d="M-40 252 Q 140 210 300 244 Q 380 262 440 246 L 440 300 L -40 300 Z" fill="#4d7c0f" />
          <g fill="#3f6212">
            <path d="M70 262 Q 80 244 92 252 Q 82 266 70 262 Z" />
            <path d="M260 284 Q 268 268 280 276 Q 272 290 260 284 Z" />
            <path d="M320 256 Q 332 240 342 250 Q 330 264 320 256 Z" />
          </g>
          {/* pedra do desafio */}
          <ellipse cx="200" cy="268" rx="58" ry="18" fill="#94a3b8" />
          <path d="M160 268 L 180 218 Q 200 210 222 218 L 240 268 Z" fill="#64748b" />
          <path d="M180 218 Q 200 208 222 218 L 216 232 Q 200 224 186 232 Z" fill="#94a3b8" />
        </svg>
      );

    case 'campo':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bae6fd" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <circle cx="330" cy="66" r="28" fill="#fde047" opacity={0.95} />
          <g fill="#86efac">
            <path d="M-30 240 Q 80 190 200 226 Q 320 260 430 230 L 430 300 L -30 300 Z" />
          </g>
          <path d="M-30 272 Q 120 236 280 268 Q 380 288 430 268 L 430 300 L -30 300 Z" fill="#4ade80" opacity={0.7} />
          {/* árvore */}
          <g transform="translate(96 150)">
            <rect x="-6" y="24" width="12" height="60" rx="3" fill="#92400e" />
            <circle cx="0" cy="8" r="34" fill="#22c55e" />
            <circle cx="-24" cy="22" r="20" fill="#16a34a" opacity={0.9} />
            <circle cx="24" cy="20" r="22" fill="#4ade80" opacity={0.9} />
          </g>
          {/* flores */}
          <g fill="#fde047">
            <circle cx="250" cy="270" r="4" />
            <circle cx="290" cy="282" r="3.5" />
            <circle cx="330" cy="272" r="4" />
          </g>
          <g fill="#f87171">
            <circle cx="270" cy="284" r="3" />
            <circle cx="310" cy="266" r="3" />
          </g>
          <path d="M120 292 q 16 -8 34 0 q -6 8 -16 6 q -8 4 -18 -6 Z" fill="#16a34a" opacity={0.6} />
          <Gulls />
        </svg>
      );

    default:
      return <rect width="400" height="300" fill="#94a3b8" aria-hidden />;
  }
}

function Gulls() {
  return (
    <g stroke="#475569" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.7}>
      <path d="M200 52 q 7 -7 14 0 q 7 -7 14 0" />
      <path d="M246 36 q 5 -5 10 0 q 5 -5 10 0" />
      <path d="M160 70 q 5 -5 10 0 q 5 -5 10 0" />
    </g>
  );
}