import { prefersReducedMotion } from './motion';

/**
 * Efeitos imperativos (skill `jogos-visual` §5): partículas, número voando e
 * screen shake. Escrevem direto no DOM com a Web Animations API — são animados
 * pela compositor thread, não passam pelo estado do React e se removem sozinhos,
 * então não custam re-render nem ficam presos na árvore do mundo.
 *
 * Ordem de desenho esperada no host: chão < cenário < NPC < jogador < fx < HUD.
 * Use hosts em espaço de mundo (dentro da câmera) ou de tela (HUD), conforme o
 * efeito.
 */

export type FxKind = 'spark' | 'dust' | 'splash' | 'puff';

export interface BurstOptions {
  kind?: FxKind;
  count?: number;
  colors?: string[];
  /** Distância máxima que as partículas percorrem (px) */
  spread?: number;
  duration?: number;
  size?: number;
}

/** Paleta padrão por tipo de efeito (tokens da `tailwind.config.js`). */
const PALETTE: Record<FxKind, string[]> = {
  spark: ['#fde047', '#fef3c7', '#f59e0b', '#ffffff'],
  dust: ['#cbd5e1', '#fcd34d', '#94a3b8'],
  splash: ['#7dd3fc', '#38bdf8', '#bae6fd'],
  puff: ['#cbd5e1', '#94a3b8', '#ffffff'],
};

const DEFAULT_COUNT: Record<FxKind, number> = { spark: 12, dust: 5, splash: 9, puff: 6 };
const DEFAULT_SIZE: Record<FxKind, number> = { spark: 7, dust: 9, splash: 6, puff: 8 };

/** Teto defensivo: se o host já tem muita coisa animando, não empilha mais. */
const MAX_CHILDREN = 140;

function canAnimate(host: HTMLElement | null): host is HTMLElement {
  if (!host) return false;
  if (prefersReducedMotion()) return false;
  if (typeof host.animate !== 'function' && typeof document.body.animate !== 'function') {
    return false;
  }
  return host.childElementCount < MAX_CHILDREN;
}

/**
 * Explosão de partículas em `(x, y)` relativos ao host (que precisa ser um
 * elemento posicionado). Não faz nada quando o sistema pede menos movimento.
 */
export function burst(host: HTMLElement | null, x: number, y: number, options: BurstOptions = {}) {
  if (!canAnimate(host)) return;
  const kind = options.kind ?? 'spark';
  const count = options.count ?? DEFAULT_COUNT[kind];
  const colors = options.colors ?? PALETTE[kind];
  const spread = options.spread ?? (kind === 'spark' ? 58 : 30);
  const duration = options.duration ?? (kind === 'dust' ? 340 : 460);
  const size = options.size ?? DEFAULT_SIZE[kind];
  const gravity = kind === 'dust' ? 6 : kind === 'splash' ? -6 : -10;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.borderRadius = kind === 'spark' ? '9999px' : '2px';
    el.style.background = colors[i % colors.length];
    el.style.pointerEvents = 'none';
    el.style.willChange = 'transform, opacity';
    if (kind === 'spark') el.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`;
    host.appendChild(el);

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const dist = spread * (0.55 + Math.random() * 0.6);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist + gravity;

    const anim = el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.25)`,
          opacity: 0,
        },
      ],
      { duration: duration + i * 12, easing: 'cubic-bezier(.22,.9,.3,1)' },
    );
    anim.onfinish = () => el.remove();
  }
}

/** Número voando ("+10") do ponto até o placar. */
export function flyNumber(
  host: HTMLElement | null,
  x: number,
  y: number,
  text: string,
  color = '#fde047',
  rise = 54,
) {
  if (!canAnimate(host)) return;
  const el = document.createElement('span');
  el.textContent = text;
  el.style.position = 'absolute';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.fontWeight = '900';
  el.style.fontSize = '20px';
  el.style.color = color;
  el.style.pointerEvents = 'none';
  el.style.whiteSpace = 'nowrap';
  el.style.textShadow = '0 2px 0 rgba(0,0,0,.45)';
  el.style.willChange = 'transform, opacity';
  host.appendChild(el);

  const anim = el.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 0 },
      { transform: 'translate(-50%, -90%) scale(1.15)', opacity: 1, offset: 0.35 },
      { transform: `translate(-50%, calc(-50% - ${rise}px)) scale(1)`, opacity: 0 },
    ],
    { duration: 820, easing: 'cubic-bezier(.2,.8,.3,1)' },
  );
  anim.onfinish = () => el.remove();
}

/** Screen shake contido (≤ 6 px, 250 ms) — ignora `prefers-reduced-motion`. */
export function shake(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  el.classList.remove('stage-shake');
  // força o reinício da animação quando dois erros acontecem em sequência
  void el.offsetWidth;
  el.classList.add('stage-shake');
  el.addEventListener('animationend', () => el.classList.remove('stage-shake'), { once: true });
}

/** Anel de expansão (coleta/selo): barato, um elemento, 500 ms. */
export function ring(host: HTMLElement | null, x: number, y: number, color = '#fde047', size = 26) {
  if (!canAnimate(host)) return;
  const el = document.createElement('span');
  el.style.position = 'absolute';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = '9999px';
  el.style.border = `3px solid ${color}`;
  el.style.pointerEvents = 'none';
  el.style.willChange = 'transform, opacity';
  host.appendChild(el);

  const anim = el.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0.95 },
      { transform: 'translate(-50%, -50%) scale(2.2)', opacity: 0 },
    ],
    { duration: 500, easing: 'ease-out' },
  );
  anim.onfinish = () => el.remove();
}
