import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { FAIXAS, type Faixa } from '../../data/games';
import { faixaNumero } from '../../lib/faixa';
import { sfx } from '../../lib/audio';
import { t } from '../../lib/i18n';
import { FAIXA_NEON } from './faixaNeon';
import FaixaNumero from './FaixaNumero';

interface AgeSelectScreenProps {
  onSelect: (faixa: Faixa) => void;
  onBack: () => void;
}

/** Ícones de linha (SVG traço grosso) — sem personagem, sem emoji. */
const ICONES: Record<Faixa, ReactNode> = {
  '3-4': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21v-8" />
      <path d="M12 13c0-4 3-7 7-7 0 4-3 7-7 7Z" />
      <path d="M12 13C12 9 9 6 5 6c0 4 3 7 7 7Z" />
    </svg>
  ),
  '5-6': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13.4 13.4 8.5 15.5l2.1-4.9 4.9-2.1Z" />
      <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21" />
    </svg>
  ),
  '7-9': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.5C10 5 7.5 4.6 4 5v12c3.5-.4 6 0 8 1.5 2-1.5 4.5-1.9 8-1.5V5c-3.5-.4-6 0-8 1.5Z" />
      <path d="M12 6.5v12" />
    </svg>
  ),
};

/**
 * Tela 2 do fliperama: "escolha a sua idade".
 *
 * Sem personagem de propósito: quem escolhe é a criança, olhando um painel de
 * letreiro. Número gigante em fonte pixel + ícone de linha + a cor neon da
 * faixa. O foco acende a moldura, dá um leve zoom e toca o som do salão.
 */
export default function AgeSelectScreen({ onSelect, onBack }: AgeSelectScreenProps) {
  const [focado, setFocado] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus({ preventScroll: true });
  }, []);

  function mover(delta: number) {
    const total = FAIXAS.length;
    const next = (focado + delta + total) % total;
    setFocado(next);
    refs.current[next]?.focus({ preventScroll: true });
    sfx.pop();
  }

  function voltar() {
    sfx.close();
    onBack();
  }

  function escolher(faixa: Faixa) {
    sfx.open();
    onSelect(faixa);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      mover(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      mover(-1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      voltar();
    }
  }

  return (
    <div className="arcade-bg safe-area-pad relative flex h-screen-safe w-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-1/5 -bottom-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pt-2 pb-2 sm:px-6">

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3">
        <button
          type="button"
          onClick={voltar}
          className="arcade-btn min-h-12 px-4 text-[11px] font-black tracking-wide text-amber-200"
        >
          ◀ {t('faixa.voltar')}
        </button>
        <div className="min-w-0 text-right">
          <p className="hidden text-[9px] font-black tracking-[0.35em] text-cyan-200/70 uppercase sm:block">
            Jogos Bíblicos · Arcade da Fé
          </p>
          <h1
            id="faixa-titulo"
            className="text-balance text-sm font-black tracking-tight text-amber-200 uppercase sm:text-lg"
          >
            {t('faixa.titulo')}
          </h1>
        </div>
      </header>

      <div
        role="radiogroup"
        aria-labelledby="faixa-titulo"
        onKeyDown={onKeyDown}
        className="relative z-10 grid min-h-0 flex-1 grid-rows-3 gap-3 py-3 sm:grid-cols-3 sm:grid-rows-1 sm:gap-5 sm:py-6"
      >
        {FAIXAS.map((faixa, index) => {
          const neon = FAIXA_NEON[faixa.id];
          const aceso = index === focado;
          return (
            <button
              key={faixa.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={aceso}
              aria-label={`${faixaNumero(faixa.id)} ${t('faixa.anos')} — ${faixa.idade}`}
              onClick={() => escolher(faixa.id)}
              onFocus={() => setFocado(index)}
              className={`group relative flex min-h-0 items-center justify-center overflow-hidden rounded-3xl border-4 bg-black/45 transition-transform duration-200 will-change-transform sm:flex-col ${
                aceso
                  ? `${neon.borderFocus} ${neon.glow} scale-[1.02] sm:scale-[1.04]`
                  : `${neon.border} scale-100`
              }`}
            >
              {aceso ? (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 z-20 animate-pulse rounded-3xl ring-4 ring-inset ${neon.ring}`}
                />
              ) : null}
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${neon.bar}`}
              />

              <span className="flex items-center gap-4 px-5 sm:flex-col sm:gap-4 sm:px-4">
                <span className={`h-10 w-10 shrink-0 sm:h-14 sm:w-14 ${neon.name}`}>
                  {ICONES[faixa.id]}
                </span>
                <span className="flex flex-col items-center gap-1.5">
                  <span className={`pixel text-4xl sm:text-5xl lg:text-6xl ${neon.name}`}>
                    <FaixaNumero faixa={faixa.id} />
                  </span>
                  <span className="pixel-sm text-[9px] tracking-[0.3em] text-white/55 sm:text-[10px]">
                    {t('faixa.anos')}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

        <p className="shrink-0 pt-1 text-center text-[10px] font-bold tracking-[0.22em] text-white/30 uppercase">
          {t('faixa.fichas')} · ← → + Enter
        </p>
      </div>
    </div>
  );
}
