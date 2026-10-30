import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Pause, Volume2, VolumeX } from 'lucide-react';
import { isAllMuted, setAllMuted, sfx, subscribeSoundPrefs } from '../lib/audio';
import { loadLevels, totalStars } from '../lib/progress';
import { StarItem } from './art';

interface GameShellProps {
  title: string;
  subtitle?: string;
  onExit: () => void;
  /** Classes Tailwind do fundo da tela do jogo */
  bg: string;
  /** Mantido por compatibilidade do catálogo — o jogo agora usa a cor do próprio fundo. */
  titleClass?: string;
  /** Abre a pausa (o jogo controla o estado) */
  onPause?: () => void;
  children: ReactNode;
}

/**
 * Casca comum dos jogos — agora uma TELA CHEIA, sem gabinete.
 *
 * Por que mudou: o CRT do salão (scanlines, vinheta, moldura) vazava para
 * dentro do jogo e deixava o texto e o desenho com cara de baixa resolução.
 * A regra passou a ser: efeito de fliperama mora SÓ nas telas do hub
 * (letreiro, idade, cartuchos). Aqui é imagem limpa, sem `filter`, sem
 * `mix-blend-mode`, sem `opacity` e sem `transform` sobre a área do jogo.
 *
 * O jogo ocupa 100vw × 100dvh com uma barra fina no topo (sair · título ·
 * estrelas · som) e o conteúdo usa toda a largura útil — nada de moldura
 * gigante nem vazio nas laterais.
 */
export default function GameShell(props: GameShellProps) {
  const { title, onExit, bg, onPause, children } = props;
  const [muted, setMuted] = useState(isAllMuted);
  const stars = totalStars(loadLevels());

  // Se o mudo mudar em outra tela (Hub), este botão acompanha.
  useEffect(() => subscribeSoundPrefs(() => setMuted(isAllMuted())), []);

  return (
    <div className="safe-area-pad h-screen-safe w-full overflow-hidden bg-slate-950 select-none">
      <div className="flex h-full w-full flex-col">
        {/* ─── barra fina: sair · título · estrelas · som ─── */}
        <header data-game-bar className="relative z-40 flex h-12 shrink-0 items-center gap-1.5 border-b border-white/10 bg-slate-950/95 px-2 text-white">
          <button
            type="button"
            onClick={() => {
              sfx.click();
              onExit();
            }}
            aria-label="Sair do jogo e voltar aos cartuchos"
            className="flex min-h-10 shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 text-[11px] font-black tracking-wide text-amber-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Sair
          </button>

          <p className="min-w-0 flex-1 truncate text-center text-[11px] font-black tracking-wide text-white/60">
            {title}
          </p>

          <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/10 px-2.5 py-1 text-[11px] font-black text-amber-100">
            <StarItem size={12} />
            {stars}
          </span>

          {onPause ? (
            <button
              type="button"
              onClick={() => {
                sfx.click();
                onPause();
              }}
              aria-label="Pausar o jogo"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-amber-100"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              const next = !muted;
              if (!next) sfx.click();
              setMuted(next);
              setAllMuted(next);
            }}
            aria-pressed={muted}
            aria-label={muted ? 'Ligar o som' : 'Desligar o som'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-100"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </header>

        {/* ─── área do jogo: largura útil, sem efeito nenhum ─── */}
        <main className={`relative min-h-0 w-full flex-1 ${bg}`}>
          <div className="arcade-content mx-auto h-full w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
