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
      {/* casco retangular (arca, não navio): proa e popa quase retas */}
      <path d="M4 14 L100 14 L96 34 Q 52 40 8 34 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" strokeLinejoin="round" />
      {/* tábuas do casco */}
      <path d="M7 20 H97 M9 26 H95 M12 31 H92" stroke="#92400e" strokeWidth="1.2" opacity="0.85" />
      {/* telhado em duas águas */}
      <path d="M0 14 L52 1 L104 14 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.5" strokeLinejoin="round" />
      {/* janela / abertura de luz no topo */}
      <rect x="43" y="5" width="18" height="6" rx="1.5" fill="#fef3c7" stroke="#78350f" strokeWidth="1" />
      {/* porta na lateral */}
      <rect x="72" y="20" width="14" height="14" rx="1.5" fill="#78350f" stroke="#5b3a10" strokeWidth="1" />
      <circle cx="83" cy="27" r="1.2" fill="#fcd34d" />
      {/* cantoneiras de madeira */}
      <path d="M4 14 L8 34M100 14 L96 34" stroke="#78350f" strokeWidth="1.2" />
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
              <stop offset="0" stopColor="#0b0f19" />
              <stop offset="0.6" stopColor="#1e293b" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id={uid('seaStorm')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1e3a8a" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          {/* nuvens escuras de tempestade */}
          <path d="M-20 60 Q 60 10 140 46 Q 220 18 300 52 Q 370 20 420 64 L 420 0 L -20 0 Z" fill="#1e293b" opacity={0.9} />
          <path d="M0 80 Q 90 40 190 74 Q 280 46 400 82 L 400 0 L 0 0 Z" fill="#0f172a" opacity={0.7} />
          {/* relâmpago distante */}
          <path d="M280 18 l -14 32 l 8 2 l -12 28 l 18 -22 l -6 -2 l 14 -28 Z" fill="#fde047" opacity={0.85} />
          {/* chuva torrencial em camadas */}
          <g stroke="#93c5fd" strokeWidth={1.8} opacity={0.65} strokeLinecap="round">
            {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345, 375].map((x, i) => (
              <g key={x}>
                <path d={`M${x} ${i % 2 === 0 ? 30 : 60} l -14 36`} />
                <path d={`M${x + 8} ${i % 2 === 0 ? 110 : 80} l -14 36`} />
                <path d={`M${x - 4} ${i % 2 === 0 ? 170 : 150} l -14 36`} />
              </g>
            ))}
          </g>
          {/* mar tempestuoso com ondas altas e espuma */}
          <rect y="170" width="400" height="130" fill={`url(#${uid('seaStorm')})`} />
          <path d="M-20 200 Q 40 160 110 196 Q 180 166 250 202 Q 330 168 420 200 L 420 300 L -20 300 Z" fill="#1d4ed8" opacity={0.8} />
          <path d="M0 226 Q 80 194 170 228 Q 260 198 360 232 L 400 230 L 400 300 L 0 300 Z" fill="#1e40af" opacity={0.9} />
          {/* espuma das ondas */}
          <path d="M40 184 q 16 -10 32 0 M170 188 q 18 -10 34 0 M290 192 q 20 -10 38 0" stroke="#e0f2fe" strokeWidth={3} fill="none" strokeLinecap="round" />
          <Waves y={245} color="#93c5fd" />
          <Waves y={276} color="#60a5fa" />
          {/* arca navegando segura na tempestade */}
          <Ark x={70} y={152} scale={1.65} />
        </svg>
      );

    case 'arco-iris':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="0.6" stopColor="#bae6fd" />
              <stop offset="1" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          {/* montanha de Ararate surgindo das águas */}
          <path d="M40 240 L 190 120 L 320 240 Z" fill="#854d0e" />
          <path d="M120 240 L 220 96 L 360 240 Z" fill="#a16207" opacity={0.85} />
          {/* encostas verdes */}
          <path d="M20 260 Q 180 180 380 250 L 400 300 L 0 300 Z" fill="#4d7c0f" />
          <path d="M0 274 Q 200 236 400 272 L 400 300 L 0 300 Z" fill="#65a30d" opacity={0.8} />
          {/* águas calmas recuando */}
          <path d="M0 270 Q 200 240 400 270 L 400 300 L 0 300 Z" fill="#38bdf8" opacity={0.45} />
          <Waves y={282} color="#0284c7" />
          {/* arco-íris com 7 faixas brilhantes */}
          {(
            [
              ['#ef4444', 92],
              ['#f97316', 84],
              ['#facc15', 76],
              ['#22c55e', 68],
              ['#38bdf8', 60],
              ['#6366f1', 52],
              ['#a855f7', 44],
            ] as Array<[string, number]>
          ).map(([c, r]) => (
            <path key={c} d={`M 50 250 a 65 ${r} 0 0 1 300 0`} stroke={c} strokeWidth={5.5} fill="none" opacity={0.92} />
          ))}
          {/* arca pousada na montanha */}
          <Ark x={132} y={166} scale={1.55} />
          {/* pomba voando com o ramo verde */}
          <g transform="translate(260 70)">
            <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#ffffff" stroke="#94a3b8" strokeWidth={0.8} />
            <path d="M-2 -3 Q 2 -14 10 -12 Q 6 -4 2 -2 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth={0.8} />
            <circle cx="8" cy="-2" r="3.2" fill="#ffffff" stroke="#94a3b8" strokeWidth={0.8} />
            <polygon points="11,-2 15,-1 11,0" fill="#f59e0b" />
            <path d="M12 -1 q 4 -3 8 0 M15 -2 l 1 -2 M17 -1 l 1 -2" stroke="#16a34a" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'noite':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0b0f19" />
              <stop offset="0.5" stopColor="#1e1b4b" />
              <stop offset="1" stopColor="#312e81" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <Moon cx={320} cy={52} r={28} />
          {/* estrelas cintilantes */}
          <Star x={42} y={36} s={3.2} o={0.95} />
          <Star x={96} y={72} s={2.4} o={0.85} />
          <Star x={148} y={32} s={3.4} o={0.9} />
          <Star x={186} y={88} s={2.2} o={0.7} />
          <Star x={232} y={42} s={3.6} o={0.95} />
          <Star x={276} y={96} s={2.4} o={0.75} />
          <Star x={370} y={78} s={2.6} o={0.8} />
          <Star x={64} y={130} s={2} o={0.65} />
          <Star x={340} y={120} s={2.8} o={0.85} />
          {/* colinas distantes de Belém */}
          <path d="M0 200 Q 110 160 230 186 Q 320 168 400 190 L 400 300 L 0 300 Z" fill="#1e1b4b" />
          {/* casinhas de Belém silhuetadas na colina distante */}
          <g fill="#312e81" transform="translate(240 156)">
            <rect x="0" y="8" width="18" height="16" />
            <polygon points="0,8 9,0 18,8" />
            <rect x="5" y="14" width="4" height="6" fill="#fde047" opacity={0.85} />
            <rect x="22" y="12" width="22" height="14" />
            <rect x="28" y="16" width="5" height="5" fill="#fde047" opacity={0.85} />
          </g>
          {/* colina do primeiro plano com os pastores */}
          <path d="M-20 236 Q 140 196 420 230 L 420 300 L -20 300 Z" fill="#0f172a" />
          <path d="M0 262 Q 180 224 400 258 L 400 300 L 0 300 Z" fill="#1e293b" opacity={0.6} />
          {/* fogueira dos pastores */}
          <g transform="translate(130 228)">
            <ellipse cx="0" cy="8" rx="28" ry="10" fill="#f59e0b" opacity={0.35} />
            {/* lenha */}
            <path d="M-10 6 L 10 2 M -8 2 L 8 6" stroke="#78350f" strokeWidth={3} strokeLinecap="round" />
            {/* chamas acolhedoras */}
            <path d="M0 4 q -8 -10 0 -22 q 6 10 10 4 q 4 12 -10 18 Z" fill="#f97316" />
            <path d="M1 2 q -4 -6 0 -14 q 4 6 6 2 q 2 8 -6 12 Z" fill="#fde047" />
            {/* faíscas subindo */}
            <circle cx="-3" cy="-22" r="1.4" fill="#fde047" />
            <circle cx="5" cy="-26" r="1.2" fill="#fde047" />
            <circle cx="2" cy="-34" r="1" fill="#fde047" />
          </g>
          {/* ovelhas descansando na relva */}
          <g fill="#f1f5f9" transform="translate(180 234)">
            <ellipse cx="0" cy="0" rx="10" ry="6.5" />
            <circle cx="9" cy="-2" r="4.2" />
            <ellipse cx="28" cy="8" rx="11" ry="7" />
            <circle cx="38" cy="6" r="4.4" />
          </g>
          {/* silhueta de oliveira */}
          <g transform="translate(60 210)">
            <path d="M0 34 Q -4 14 0 0 Q 4 14 8 34 Z" fill="#334155" />
            <ellipse cx="4" cy="-14" rx="26" ry="18" fill="#1e293b" />
            <ellipse cx="-10" cy="-6" rx="16" ry="14" fill="#0f172a" />
            <ellipse cx="18" cy="-6" rx="18" ry="14" fill="#0f172a" />
          </g>
        </svg>
      );

    case 'deserto':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f59e0b" />
              <stop offset="0.5" stopColor="#fde68a" />
              <stop offset="1" stopColor="#fef3c7" />
            </linearGradient>
            <linearGradient id={uid('dune1')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fde047" />
              <stop offset="1" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id={uid('dune2')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          {/* sol forte com corona */}
          <circle cx="320" cy="56" r="32" fill="#fbbf24" opacity={0.9} />
          <circle cx="320" cy="56" r="46" fill="#fde047" opacity={0.3} />
          {/* montanhas rochosas de Horebe ao longe */}
          <polygon points="-20,200 70,140 160,200" fill="#b45309" opacity={0.5} />
          <polygon points="120,200 210,126 310,200" fill="#9a3412" opacity={0.45} />
          {/* dunas de areia suaves com cristas nítidas */}
          <path d="M-20 224 Q 90 170 210 212 Q 330 250 420 196 L 420 300 L -20 300 Z" fill={`url(#${uid('dune1')})`} />
          <path d="M0 252 Q 130 206 280 246 Q 360 264 420 236 L 420 300 L 0 300 Z" fill={`url(#${uid('dune2')})`} />
          {/* sombras de vento na areia */}
          <path d="M50 248 Q 110 232 170 246" stroke="#b45309" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.4} />
          <path d="M220 264 Q 280 246 340 262" stroke="#92400e" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.4} />
          {/* oásis / riacho de Querite onde Elias bebia */}
          <path d="M120 290 Q 200 274 290 292 L 310 300 L 100 300 Z" fill="#38bdf8" />
          {/* palmeira no oásis */}
          <g transform="translate(260 240)">
            <path d="M0 34 Q 6 16 2 0" stroke="#78350f" strokeWidth={5} fill="none" strokeLinecap="round" />
            <path d="M2 0 Q -18 -10 -24 4 M2 0 Q -8 -20 -4 -26 M2 0 Q 14 -18 20 -20 M2 0 Q 22 -6 24 8 M2 0 Q 6 12 4 20" stroke="#15803d" strokeWidth={3} fill="none" strokeLinecap="round" />
            <circle cx="2" cy="2" r="3.2" fill="#78350f" />
          </g>
          {/* corvo voando trazendo alimento */}
          <g transform="translate(160 84)">
            <path d="M0 0 q 8 -8 16 -2 q -6 10 -16 2 Z" fill="#1e293b" />
            <path d="M6 -2 q 8 -12 14 -4 q -4 8 -14 4 Z" fill="#0f172a" />
            <circle cx="16" cy="0" r="1.4" fill="#fcd34d" />
          </g>
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
          <ellipse cx="200" cy="214" rx="96" ry="30" fill="#fbbf24" opacity={0.4} />
          {/* a sarça: moita de folhas verdes */}
          <g transform="translate(200 198)">
            <ellipse cx="0" cy="4" rx="48" ry="28" fill="#166534" />
            <circle cx="-30" cy="-6" r="20" fill="#15803d" />
            <circle cx="28" cy="-4" r="22" fill="#14532d" />
            <circle cx="0" cy="-20" r="23" fill="#16a34a" />
            <path d="M-48 8 q 10 -14 22 -6 M40 12 q -10 -16 -22 -6" stroke="#065f46" strokeWidth="2" fill="none" opacity="0.6" />
            {/* chamas que não consomem a moita */}
            <g fill="#fb923c">
              <path d="M-26 -20 q -6 -16 4 -28 q 4 12 10 10 q 4 14 -14 18 Z" />
              <path d="M6 -30 q -4 -16 8 -26 q 2 12 12 8 q 6 16 -20 18 Z" />
              <path d="M-6 -6 q -6 -14 2 -24 q 4 10 10 8 q 4 12 -12 16 Z" />
            </g>
            <g fill="#fde047">
              <path d="M-14 -22 q -3 -9 2 -16 q 2 7 7 5 q 2 8 -9 11 Z" />
              <path d="M10 -26 q -2 -9 4 -14 q 1 7 7 4 q 2 8 -11 10 Z" />
            </g>
          </g>
        </svg>
      );

    case 'mar-aberto':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="1" stopColor="#bae6fd" />
            </linearGradient>
            <linearGradient id={g.sea} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1d4ed8" />
              <stop offset="1" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <path d="M0 84 q 22 -12 44 0 t 44 0 t 44 0 t 44 0 t 44 0 t 44 0 t 44 0 t 44 0 t 44 0 t 44 0" stroke="#fff" strokeWidth={5} fill="none" opacity={0.5} />
          <rect y="120" width="400" height="180" fill={`url(#${g.sea})`} />
          <Waves y={150} color="#60a5fa" />
          <Waves y={196} color="#3b82f6" />
          <Waves y={242} color="#2563eb" />
          {/* barquinho de Jonas: casco + mastro + velas */}
          <g transform="translate(150 122)">
            <path d="M-14 22 L 78 22 L 64 42 L 0 42 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M-14 22 H78" stroke="#78350f" strokeWidth="2.2" />
            <path d="M-14 30 H78M-14 37 H72" stroke="#78350f" strokeWidth="1" opacity="0.7" />
            <rect x="30" y="-36" width="3.4" height="58" fill="#78350f" />
            <path d="M33 -34 L 66 14 L 33 14 Z" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M30 -32 L 6 14 L 30 14 Z" fill="#fde68a" stroke="#0f172a" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M31.7 -40 l7 4.5 -7 4.5 Z" fill="#dc2626" />
          </g>
          <Gulls />
        </svg>
      );

    case 'peixe':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <radialGradient id={uid('pelo')} cx="0.5" cy="0.4" r="0.95">
              <stop offset="0" stopColor="#b45309" />
              <stop offset="0.6" stopColor="#7c2d12" />
              <stop offset="1" stopColor="#3f0a0a" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${uid('pelo')})`} />
          {/* costelas do grande peixe (arcos ao fundo) */}
          <g stroke="#450a0a" strokeWidth={10} fill="none" opacity={0.55} strokeLinecap="round">
            <path d="M30 -10 Q 80 150 30 310" />
            <path d="M120 -10 Q 168 150 120 310" />
            <path d="M215 -10 Q 258 150 215 310" />
            <path d="M305 -10 Q 345 150 305 310" />
          </g>
          <g stroke="#fb923c" strokeWidth={3} fill="none" opacity={0.22} strokeLinecap="round">
            <path d="M30 -10 Q 80 150 30 310" />
            <path d="M120 -10 Q 168 150 120 310" />
            <path d="M215 -10 Q 258 150 215 310" />
            <path d="M305 -10 Q 345 150 305 310" />
          </g>
          {/* abertura da boca, com luz do mar entrando */}
          <path d="M400 78 Q 322 150 400 222 Z" fill="#fde68a" opacity={0.3} />
          <path d="M400 96 Q 350 150 400 204 Z" fill="#fef3c7" opacity={0.22} />
          {/* bolhas e algas */}
          <g fill="#fde68a" opacity={0.3}>
            <circle cx="150" cy="120" r="5" />
            <circle cx="205" cy="96" r="3" />
            <circle cx="262" cy="140" r="4" />
            <circle cx="316" cy="176" r="2.6" />
          </g>
          <g stroke="#166534" strokeWidth={7} fill="none" opacity={0.55} strokeLinecap="round">
            <path d="M60 300 Q 48 250 66 216" />
            <path d="M92 300 Q 106 256 88 224" />
          </g>
          <path d="M0 300 Q 200 268 400 300 Z" fill="#1c1917" opacity={0.6} />
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
            <path d="M-40 210 L 130 40 L 250 190 Z" />
            <path d="M210 210 L 320 70 L 450 220 Z" />
          </g>
          <path d="M130 40 L 108 70 L 152 70 Z" fill="#e2e8f0" />
          <path d="M320 70 L 302 96 L 340 96 Z" fill="#e2e8f0" />
          {/* altar de pedras com o fogo do céu */}
          <g transform="translate(130 122)">
            <path d="M-30 46 h60 l-6 -26 h-48 Z" fill="#64748b" stroke="#334155" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M-24 20 h48" stroke="#475569" strokeWidth="2" />
            <path d="M-18 46 l4 -26M0 46 v-26M18 46 l-4 -26" stroke="#475569" strokeWidth="1.4" opacity={0.8} />
            <path d="M0 -4 q -10 -14 0 -30 q 6 14 12 4 q 8 16 -4 26 q -6 -6 -8 -10 Z" fill="#f97316" />
            <path d="M2 -10 q -4 -8 0 -16 q 3 8 6 4 q 3 10 -6 12 Z" fill="#fde047" />
            <ellipse cx="0" cy="-2" rx="22" ry="8" fill="#f59e0b" opacity={0.7} />
          </g>
          {/* fumaça subindo */}
          <path d="M118 76 q 14 -16 34 -10 q 12 6 14 20 q -10 6 -18 0 q -14 6 -20 -4 q -8 4 -10 -6 Z" fill="#94a3b8" opacity={0.8} />
          <path d="M0 250 Q 120 226 400 252 L 400 300 L 0 300 Z" fill="#1e293b" />
        </svg>
      );

    case 'rio':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={g.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fcd34d" />
              <stop offset="1" stopColor="#fef3c7" />
            </linearGradient>
            <linearGradient id={uid('rioAgua')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id={uid('rioSeco')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d9b98a" />
              <stop offset="1" stopColor="#c08f4d" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          {/* colinas de Quiriate-Jearim ao fundo */}
          <g fill="#65a30d" opacity={0.45}>
            <path d="M-20 128 Q 90 82 200 126 Q 300 74 420 130 L 420 180 L -20 180 Z" />
          </g>
          {/* margens verdes de juncos */}
          <path d="M0 176 Q 100 158 200 172 Q 300 184 400 168 L 400 300 L 0 300 Z" fill="#4d7c0f" />
          {/* paredes de água paradas em pé */}
          <path d="M0 196 L 96 176 Q 128 184 142 214 Q 130 248 96 262 L 30 300 L 0 300 Z" fill={`url(#${uid('rioAgua')})`} />
          <path d="M400 196 L 304 176 Q 272 184 258 214 Q 270 248 304 262 L 370 300 L 400 300 Z" fill={`url(#${uid('rioAgua')})`} />
          {/* espuma na crista das paredes de água */}
          <path d="M84 181 q 14 -8 26 2 M292 181 q -14 -8 -26 2 M120 214 q 8 -6 14 0 M268 214 q -8 -6 -14 0" stroke="#e0f2fe" strokeWidth={3} fill="none" strokeLinecap="round" />
          {/* leito seco por onde o povo atravessou */}
          <path d="M116 178 L 284 178 L 262 300 L 138 300 Z" fill={`url(#${uid('rioSeco')})`} />
          <path d="M150 286 q 20 -6 40 0 q -10 6 -20 4 Z" fill="#a16207" opacity={0.4} />
          {/* arca da aliança repousando no seco */}
          <g transform="translate(200 196)">
            <rect x="-26" y="-24" width="52" height="14" fill="#ca8a04" />
            <rect x="-30" y="-10" width="60" height="34" rx="3" fill="#eab308" stroke="#a16207" strokeWidth={2} />
            <rect x="-30" y="-12" width="60" height="4" fill="#ca8a04" />
            <path d="M-30 -10 L -44 -18 L -38 -30 M 30 -10 L 44 -18 L 38 -30" stroke="#92400e" strokeWidth={3.4} fill="none" strokeLinecap="round" />
            <path d="M-20 10 h40 M-20 16 h40" stroke="#a16207" strokeWidth={1.6} opacity={0.7} />
          </g>
          {/* sacerdotes em pé ao lado da arca (silhuetas) */}
          <g fill="#7c2d12" opacity={0.85}>
            <circle cx="150" cy="188" r="7" />
            <rect x="143" y="195" width="14" height="30" rx="5" />
            <circle cx="256" cy="188" r="7" />
            <rect x="249" y="195" width="14" height="30" rx="5" />
          </g>
          {/* juncos nas margens */}
          <g stroke="#166534" strokeWidth={4} strokeLinecap="round">
            <path d="M40 214 L 32 184 M52 214 L 52 178 M64 214 L 72 186" />
          </g>
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
              <stop offset="0.55" stopColor="#fdba74" />
              <stop offset="1" stopColor="#fed7aa" />
            </linearGradient>
            <linearGradient id={uid('pedra')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b8916a" />
              <stop offset="1" stopColor="#8a6845" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g.sky})`} />
          <circle cx="60" cy="66" r="32" fill="#fbbf24" opacity={0.95} />
          {/* morro da cidade atrás da muralha */}
          <path d="M-20 140 Q 110 60 240 130 Q 320 170 420 130 L 420 180 L -20 180 Z" fill="#d9a05b" opacity={0.5} />
          {/* corpo da muralha com textura de pedras */}
          <rect y="128" width="400" height="172" fill={`url(#${uid('pedra')})`} />
          <g stroke="#6f5233" strokeWidth={2} fill="none" opacity={0.45}>
            <path d="M20 128 v40 M60 128 v40 M120 128 v40 M160 128 v40 M220 128 v40 M260 128 v40 M320 128 v40 M360 128 v40" />
            <path d="M0 168 h120 M120 168 h400 M0 206 h60 M60 206 h160 M220 206 h120 M340 206 h60 M60 244 h140 M200 244 h200" />
          </g>
          {/* ameias */}
          <g fill="#6f5233">
            {[6, 46, 86, 126, 166, 206, 246, 286, 326, 366].map((x) => (
              <rect key={x} x={x} y="114" width="16" height="14" />
            ))}
          </g>
          <rect y="128" width="400" height="10" fill="#5a4127" />
          {/* porta com madeira */}
          <path d="M150 300 L 150 178 A 50 50 0 0 1 250 178 L 250 300 Z" fill="#78350f" />
          <path d="M166 300 L 166 196 A 34 34 0 0 1 234 196 L 234 300 Z" fill="#92400e" />
          <g stroke="#451a03" strokeWidth={2.4}>
            <line x1="176" y1="210" x2="176" y2="294" />
            <line x1="192" y1="206" x2="192" y2="298" />
            <line x1="208" y1="206" x2="208" y2="298" />
            <line x1="224" y1="210" x2="224" y2="294" />
          </g>
          {/* poeira da queda subindo */}
          <g fill="#78350f" opacity={0.4}>
            <ellipse cx="120" cy="300" rx="70" ry="18" />
            <ellipse cx="288" cy="300" rx="70" ry="18" />
            <ellipse cx="180" cy="294" rx="50" ry="12" />
            <ellipse cx="230" cy="298" rx="42" ry="10" />
          </g>
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
          <rect y="40" width="400" height="210" fill="#f5d78e" opacity={0.55} />
          {/* arco do trono */}
          <path d="M148 252 L 148 128 A 52 52 0 0 1 252 128 L 252 252 Z" fill="#eab308" opacity={0.85} />
          {/* colunas com capitel, fuste canelado e base */}
          {[36, 116, 284, 364].map((x) => (
            <g key={x}>
              <rect x={x - 13} y="44" width="26" height="13" rx="3" fill="#ca8a04" />
              <rect x={x - 9} y="57" width="18" height="190" fill="#eab308" />
              <path d={`M${x - 4} 58 V247 M${x + 4} 58 V247`} stroke="#ca8a04" strokeWidth="1.4" opacity={0.7} />
              <rect x={x - 13} y="247" width="26" height="13" rx="3" fill="#ca8a04" />
            </g>
          ))}
          {/* trono */}
          <rect x="176" y="168" width="48" height="84" rx="6" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
          <rect x="182" y="146" width="36" height="34" rx="6" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
          <path d="M182 168 h36" stroke="#fcd34d" strokeWidth="2" />
          {/* piso e tapete */}
          <rect y="250" width="400" height="50" fill="#b45309" />
          <rect y="242" width="400" height="8" fill="#92400e" />
          <path d="M120 300 L 280 300 L 262 252 L 138 252 Z" fill="#dc2626" opacity={0.85} />
          <path d="M158 300 L 180 252 L 220 252 L 242 300 Z" fill="#991b1b" opacity={0.8} />
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
          {/* o quarto homem, como um filho dos deuses, no meio da fornalha */}
          <g transform="translate(200 208)">
            <circle cx="0" cy="-42" r="12" fill="#fef9c3" opacity={0.95} />
            <rect x="-10" y="-34" width="20" height="62" rx="6" fill="#fef3c7" opacity={0.95} />
            <rect x="-16" y="-22" width="32" height="16" rx="6" fill="#fdf4ff" opacity={0.9} />
            <ellipse cx="0" cy="34" rx="20" ry="7" fill="#fde047" opacity={0.5} />
          </g>
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
            <radialGradient id={uid('luzAnjo')} cx="0.5" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#fde68a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${uid('caverna')})`} />
          {/* luz celestial que fecha a boca dos leões */}
          <rect width="400" height="300" fill={`url(#${uid('luzAnjo')})`} />
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
          {/* leões sentados e calmos */}
          {[
            { x: 96, flip: -1 },
            { x: 304, flip: 1 },
          ].map(({ x, flip }) => (
            <g key={x} transform={`translate(${x} 252) scale(${flip} 1)`}>
              <ellipse cx="0" cy="10" rx="26" ry="12" fill="#a16207" opacity={0.9} />
              <circle cx="-6" cy="-10" r="11" fill="#d97706" />
              <ellipse cx="-18" cy="-20" rx="8" ry="5" fill="#d97706" />
              <circle cx="-8" cy="-11" r="1.4" fill="#1c1917" />
            </g>
          ))}
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