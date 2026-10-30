import { useEffect, useRef } from 'react';
import ArcadeMarquee from './ArcadeMarquee';
import { ARCADE_MODE } from '../../lib/arcade';

interface AttractScreenProps {
  onStart: () => void;
}

/**
 * Letreiro de atração do quiosque ("attract mode" de fliperama).
 *
 * No evento ninguém está logado nem instalando nada: o tablet fica parado
 * chamando a criança com o letreiro. QUALQUER toque na tela começa — o botão
 * grande existe para quem prefere (e para leitor de tela).
 */
export default function AttractScreen({ onStart }: AttractScreenProps) {
  const started = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const start = () => {
    if (started.current) return;
    started.current = true;
    onStart();
  };

  // Um único toque em qualquer lugar já vale; o botão também recebe foco para
  // quem navega por teclado.
  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      className="arcade-bg safe-area-pad screen-in relative flex min-h-screen-safe w-full items-center justify-center overflow-hidden px-3 py-5"
      onPointerDown={start}
    >
      {/* poeira/luz do salão */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/5 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="overflow-hidden rounded-3xl border-2 border-white/10 bg-arcade-noite/80 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
          <ArcadeMarquee
            heading="h1"
            title="Jogos Bíblicos"
            subtitle="ARCADE DA FÉ · 3 a 9 anos"
            badge={ARCADE_MODE ? 'Sala de Jogos · FestKids' : undefined}
          />

          <div className="crt relative mx-2 my-2 overflow-hidden rounded-2xl border-4 border-black/70 bg-gradient-to-b from-indigo-950 via-violet-950 to-fuchsia-950 px-4 py-6 text-center sm:mx-3 sm:py-8">
            <div className="relative z-10">
              <div className="flex items-end justify-center gap-4 text-5xl sm:gap-8 sm:text-6xl">
                {['🌱', '🧭', '📖'].map((icone, index) => (
                  <span
                    key={icone}
                    className="animate-arcade-coin inline-block"
                    style={{ animationDelay: `${index * 160}ms` }}
                    aria-hidden
                  >
                    {icone}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-[11px] font-black tracking-[0.35em] text-cyan-200/80 uppercase">
                Jogo livre · ∞ fichas
              </p>

              <button
                ref={buttonRef}
                type="button"
                onClick={start}
                className="arcade-btn mt-3 min-h-14 w-full max-w-sm px-8 py-4 text-xl font-black text-amber-200 sm:text-2xl"
              >
                ▶ Toque para jogar
              </button>

              <p className="mt-3 animate-pulse text-sm font-bold text-white/70">
                Escolha um jogo e boa aventura!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-1 text-[11px] font-black tracking-wide text-white/50 uppercase">
            <span>🕹️ {ARCADE_MODE ? 'Sala de Jogos' : 'Arcade da Fé'}</span>
            <span>Grátis · sem cadastro</span>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] font-bold text-white/35">
          Toque em qualquer lugar da tela para começar
        </p>
      </div>
    </div>
  );
}
