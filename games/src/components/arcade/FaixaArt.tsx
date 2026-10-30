import { useId } from 'react';
import type { Faixa } from '../../data/games';
import { FAIXA_NEON } from './faixaNeon';

interface FaixaArtProps {
  faixa: Faixa;
  className?: string;
}

/**
 * Retrato de "seleção de personagem" da tela de idade.
 *
 * Arte original em SVG inline (sem raster, sem emoji): a criança se reconhece
 * na figura antes de ler o número. Um único boneco-base — mesma proporção de
 * rosto e mesma luz — muda de cor, acessório e gesto por faixa; é o que dá
 * unidade de elenco em vez de três desenhos soltos.
 */
export default function FaixaArt({ faixa, className }: FaixaArtProps) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  const c = FAIXA_NEON[faixa].art;

  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor={c.base} stopOpacity="0.5" />
          <stop offset="55%" stopColor={c.soft} stopOpacity="0.16" />
          <stop offset="100%" stopColor="#0b0618" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`skin-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbd6ad" />
          <stop offset="100%" stopColor="#e0a273" />
        </linearGradient>
        <linearGradient id={`hair-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2c16" />
          <stop offset="100%" stopColor="#2a170a" />
        </linearGradient>
        <linearGradient id={`cloth-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.cloth1} />
          <stop offset="100%" stopColor={c.cloth2} />
        </linearGradient>
        <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={c.base} stopOpacity="0" />
          <stop offset="100%" stopColor={c.base} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* fundo do gabinete */}
      <rect width="200" height="240" fill={`url(#bg-${uid})`} />
      <g stroke={c.base} strokeWidth="2" opacity="0.14" strokeLinecap="round">
        <path d="M100 98 L30 18" />
        <path d="M100 98 L78 6" />
        <path d="M100 98 L122 6" />
        <path d="M100 98 L170 18" />
      </g>
      {faixa === '7-9' ? <circle cx="100" cy="96" r="64" fill={c.base} opacity="0.12" /> : null}

      {/* sombra de contato */}
      <ellipse cx="100" cy="234" rx="76" ry="11" fill="#000" opacity="0.45" />

      {/* corpo */}
      <path
        d="M42 240 C42 188 66 160 100 160 C134 160 158 188 158 240 Z"
        fill={`url(#cloth-${uid})`}
        stroke="#0f172a"
        strokeWidth="2.5"
      />
      <path
        d="M84 162 L100 178 L116 162"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M150 202 C155 214 156 227 156 240"
        stroke={`url(#rim-${uid})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* lenço de explorador */}
      {faixa === '5-6' ? (
        <path
          d="M80 162 Q100 180 120 162 Q114 176 100 177 Q86 176 80 162 Z"
          fill="#22d3ee"
          stroke="#0e7490"
          strokeWidth="1.6"
        />
      ) : null}

      {/* pescoço, orelhas e cabeça */}
      <rect x="91" y="127" width="18" height="19" rx="7" fill={`url(#skin-${uid})`} stroke="#0f172a" strokeWidth="2" />
      <circle cx="62" cy="100" r="8" fill="#f3bd93" stroke="#0f172a" strokeWidth="2" />
      <circle cx="138" cy="100" r="8" fill="#f3bd93" stroke="#0f172a" strokeWidth="2" />
      <circle cx="100" cy="96" r="40" fill={`url(#skin-${uid})`} stroke="#0f172a" strokeWidth="2.5" />

      {/* cabelo */}
      <path
        d="M61 94 C59 54 79 38 100 38 C121 38 141 54 139 94 C134 84 130 77 125 72 C119 79 110 82 100 82 C90 82 81 79 75 72 C70 77 66 84 61 94 Z"
        fill={`url(#hair-${uid})`}
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* sobrancelhas e olhos */}
      <path d="M74 84 Q82 80 90 84" stroke="#3f2412" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M110 84 Q118 80 126 84" stroke="#3f2412" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="84" cy="100" rx="7.5" ry="9" fill="#fff" stroke="#0f172a" strokeWidth="1.6" />
      <ellipse cx="116" cy="100" rx="7.5" ry="9" fill="#fff" stroke="#0f172a" strokeWidth="1.6" />
      <circle cx="85" cy="102" r="4.6" fill="#1f2937" />
      <circle cx="117" cy="102" r="4.6" fill="#1f2937" />
      <circle cx="83.4" cy="99" r="1.7" fill="#fff" />
      <circle cx="115.4" cy="99" r="1.7" fill="#fff" />

      {/* bochechas, nariz e boca */}
      <circle cx="73" cy="112" r="7" fill="#fb7185" opacity="0.33" />
      <circle cx="127" cy="112" r="7" fill="#fb7185" opacity="0.33" />
      <path d="M100 106 q3 4 -1 5" stroke="#c97d4e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M91 118 Q100 127 109 118" stroke="#7f1d1d" strokeWidth="2.6" fill="none" strokeLinecap="round" />

      {/* rim light no contorno do rosto */}
      <path
        d="M131 72 C139 87 139 106 129 122"
        stroke={c.base}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* ── 3–4 anos: broto na cabeça e mão acenando com estrela ── */}
      {faixa === '3-4' ? (
        <g>
          <path d="M100 40 Q100 26 108 19" stroke="#16a34a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M108 19 q14 -6 18 8 q-13 6 -18 -8 Z" fill="#4ade80" stroke="#14532d" strokeWidth="1.5" />
          <path d="M100 27 q-16 -8 -20 6 q14 7 20 -6 Z" fill="#22c55e" stroke="#14532d" strokeWidth="1.5" />
          <path
            d="M64 206 C50 192 42 174 45 156"
            stroke={`url(#cloth-${uid})`}
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="45" cy="151" r="9" fill={`url(#skin-${uid})`} stroke="#0f172a" strokeWidth="2" />
          <path
            d="M45 124 L48 133 L57 136 L48 139 L45 148 L42 139 L33 136 L42 133 Z"
            fill="#fde68a"
            stroke="#b45309"
            strokeWidth="1.2"
          />
        </g>
      ) : null}

      {/* ── 5–6 anos: chapéu de explorador e bússola ── */}
      {faixa === '5-6' ? (
        <g>
          <ellipse cx="100" cy="53" rx="55" ry="12" fill="#b45309" stroke="#0f172a" strokeWidth="2.2" />
          <path d="M72 53 C72 30 128 30 128 53 Z" fill="#d97706" stroke="#0f172a" strokeWidth="2.2" />
          <rect x="73" y="45" width="54" height="8" rx="3" fill="#92400e" />
          <rect x="95" y="44" width="10" height="10" rx="2" fill="#fde68a" stroke="#78350f" strokeWidth="1.2" />
          <path
            d="M60 202 C66 188 77 181 87 183"
            stroke={`url(#cloth-${uid})`}
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="89" cy="187" r="11" fill="#0e7490" stroke="#cffafe" strokeWidth="2" />
          <path d="M89 178 L92.5 186.5 L89 184 L85.5 186.5 Z" fill="#fde68a" />
          <circle cx="89" cy="187" r="1.8" fill="#e0f2fe" />
        </g>
      ) : null}

      {/* ── 7–9 anos: halo, mãos em oração e estrela ── */}
      {faixa === '7-9' ? (
        <g>
          <circle
            cx="100"
            cy="96"
            r="55"
            fill="none"
            stroke={c.base}
            strokeWidth="2"
            strokeDasharray="5 9"
            opacity="0.65"
          />
          <path
            d="M100 10 L103.5 19 L113 20 L106 26 L108 35 L100 30 L92 35 L94 26 L87 20 L96.5 19 Z"
            fill="#fde68a"
            stroke="#b45309"
            strokeWidth="1.2"
          />
          {/* Bíblia aberta segurada pelas duas mãos */}
          <g>
            <path
              d="M76 192 Q88 186 100 192 L100 212 Q88 206 76 212 Z"
              fill="#fef9c3"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M124 192 Q112 186 100 192 L100 212 Q112 206 124 212 Z"
              fill="#fef9c3"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M100 191 L100 213" stroke="#b45309" strokeWidth="2.6" strokeLinecap="round" />
            <g stroke="#a16207" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
              <path d="M82 196 L94 199" />
              <path d="M82 201 L94 204" />
              <path d="M118 196 L106 199" />
              <path d="M118 201 L106 204" />
            </g>
            <circle cx="77" cy="207" r="6.5" fill={`url(#skin-${uid})`} stroke="#0f172a" strokeWidth="2" />
            <circle cx="123" cy="207" r="6.5" fill={`url(#skin-${uid})`} stroke="#0f172a" strokeWidth="2" />
          </g>
        </g>
      ) : null}

      {/* cintilância do gabinete */}
      <g className="animate-pulse" fill="#fff" opacity="0.75">
        <path d="M34 66 L36 73 L43 75 L36 77 L34 84 L32 77 L25 75 L32 73 Z" />
        <path d="M165 116 L166.5 121 L171 122.5 L166.5 124 L165 129 L163.5 124 L159 122.5 L163.5 121 Z" />
        <path d="M52 176 L53.5 181 L58 182.5 L53.5 184 L52 189 L50.5 184 L46 182.5 L50.5 181 Z" />
      </g>
    </svg>
  );
}
