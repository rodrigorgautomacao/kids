import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { FAIXAS, type Faixa } from '../../data/games';
import { faixaNumero } from '../../lib/faixa';
import { sfx } from '../../lib/audio';
import { t } from '../../lib/i18n';
import FaixaArt from './FaixaArt';
import { FAIXA_NEON } from './faixaNeon';

interface AgeSelectScreenProps {
  onSelect: (faixa: Faixa) => void;
  onBack: () => void;
}

/**
 * Tela 2 do fliperama: "escolha a sua idade".
 *
 * Só os números aparecem (3–4 · 5–6 · 7–9): a criança pequena reconhece a
 * própria idade antes de ler, e o adulto que acompanha entende na hora. Cada
 * bloco é um retrato original no escuro do salão, com moldura pulsando no foco.
 * Um toque escolhe; teclado/gamepad navega com as setas e confirma com Enter.
 */
export default function AgeSelectScreen({ onSelect, onBack }: AgeSelectScreenProps) {
  const [focado, setFocado] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  // Abre com o primeiro bloco aceso: quem chega de teclado já pode setar.
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
    <div className="arcade-bg safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center overflow-hidden px-3 py-4">
      <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/5 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-3xl">
        <button
          type="button"
          onClick={voltar}
          className="arcade-btn min-h-14 px-5 text-sm font-black tracking-wide text-amber-200"
        >
          ◀ {t('faixa.voltar')}
        </button>

        <header className="mt-3 text-center sm:mt-4">
          <p className="text-[10px] font-black tracking-[0.4em] text-cyan-200/70 uppercase">
            Jogos Bíblicos · Arcade da Fé
          </p>
          <h1
            id="faixa-titulo"
            className="arcade-neon mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-4xl"
          >
            {t('faixa.titulo')}
          </h1>
          <p className="mt-1 text-[11px] font-bold text-white/50 sm:text-sm">{t('faixa.dica')}</p>
        </header>

        <div
          role="radiogroup"
          aria-labelledby="faixa-titulo"
          onKeyDown={onKeyDown}
          className="mt-4 grid gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-4"
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
                className={`ui-press relative flex w-full items-center gap-3 overflow-hidden rounded-3xl border-4 bg-arcade-noite p-2 text-left transition sm:flex-col sm:gap-0 sm:p-0 sm:text-center ${
                  aceso ? `${neon.borderFocus} ${neon.glow}` : neon.border
                }`}
              >
                {aceso ? (
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 z-20 animate-pulse rounded-3xl ring-4 ring-inset ${neon.ring}`}
                  />
                ) : null}

                <span className="w-20 shrink-0 overflow-hidden rounded-2xl sm:w-full">
                  <FaixaArt faixa={faixa.id} className="block h-auto w-full" />
                </span>

                <span className="flex min-w-0 flex-1 flex-col items-center justify-center sm:w-full sm:flex-none sm:py-3">
                  <span
                    className={`text-4xl font-black leading-none tabular-nums sm:text-5xl ${neon.name}`}
                  >
                    {faixaNumero(faixa.id)}
                  </span>
                  <span className="mt-1 text-[10px] font-black tracking-[0.3em] text-white/55 uppercase">
                    {t('faixa.anos')}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-3 hidden text-center text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase sm:mt-4 sm:block">
          {t('faixa.fichas')}
        </p>
      </div>
    </div>
  );
}
