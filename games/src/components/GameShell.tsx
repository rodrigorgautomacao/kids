import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Pause, Volume2, VolumeX } from 'lucide-react';
import { isAllMuted, setAllMuted, sfx, subscribeSoundPrefs } from '../lib/audio';
import { ARCADE_MODE } from '../lib/arcade';
import ArcadeMarquee from './arcade/ArcadeMarquee';

interface GameShellProps {
  title: string;
  subtitle?: string;
  onExit: () => void;
  /** Classes Tailwind do fundo da tela do jogo */
  bg: string;
  /** Classe de cor do título */
  titleClass: string;
  /** Abre a pausa (o jogo controla o estado) */
  onPause?: () => void;
  children: ReactNode;
}

/**
 * Casca comum de todos os jogos — agora um GABINETE de fliperama:
 *
 *   [ marquee com o nome do jogo ]   ← topo, neon
 *   [ tela (CRT + fundo do jogo) ]   ← o jogo roda aqui dentro
 *   [ deck: voltar · pausa · som  ]  ← embaixo, ao alcance do polegar
 *
 * Por que mudou: na Sala de Jogos do FestKids a criança troca de aparelho a
 * cada partida. O botão de sair estava no canto superior (longe da mão e perto
 * do notch); no deck ele fica grande, igual em TODOS os 31 jogos, e o jogo
 * ganha a moldura de arcade pedida pelo dono.
 *
 * `safe-area-pad` continua recuando tudo para fora do notch/ilha/home
 * indicator. Nada de `transform`/`filter` no contêiner: os `position: fixed`
 * internos (confete, véu) precisam da viewport como referência.
 */
export default function GameShell({
  title,
  subtitle,
  onExit,
  bg,
  titleClass,
  onPause,
  children,
}: GameShellProps) {
  const [muted, setMuted] = useState(isAllMuted);

  // Se o mudo mudar em outra tela (Hub), este botão acompanha.
  useEffect(() => subscribeSoundPrefs(() => setMuted(isAllMuted())), []);

  return (
    <div className="arcade-bg safe-area-pad h-screen-safe relative flex w-full flex-col overflow-hidden select-none">
      {/* ─── marquee do gabinete ─── */}
      <div className="relative z-30 px-2 pt-2 sm:px-3">
        <ArcadeMarquee
          compact
          title="Jogos Bíblicos"
          badge={ARCADE_MODE ? 'Sala de Jogos · FestKids' : undefined}
          right={
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-black tracking-wide text-cyan-200 uppercase">
              {ARCADE_MODE ? '∞ fichas' : '1 ficha'}
            </span>
          }
        />
      </div>

      {/* ─── tela ─── */}
      <div
        className={`arcade-screen crt relative mx-2 mt-2 flex min-h-0 flex-1 flex-col overflow-hidden bg-arcade-ink sm:mx-3 ${bg}`}
      >
        <header className="shrink-0 px-3 pt-2 pb-1 text-center">
          <h2 className={`truncate text-xl font-extrabold drop-shadow-sm sm:text-2xl ${titleClass}`}>
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto mt-1 w-fit max-w-full truncate rounded-full bg-slate-950/35 px-3 py-0.5 text-[11px] font-bold text-white/90 sm:text-xs">
              {subtitle}
            </p>
          ) : null}
        </header>

        <div className="arcade-content relative min-h-0 flex-1">{children}</div>
      </div>

      {/* ─── deck de controles (embaixo, ao alcance do polegar) ─── */}
      <div className="arcade-deck relative z-30 mt-2 flex items-center justify-between gap-2 px-2 pt-2 pb-2 sm:px-3">
        <button
          type="button"
          onClick={() => {
            sfx.click();
            onExit();
          }}
          aria-label="Voltar ao menu de jogos"
          className="arcade-btn min-h-12 px-4 text-sm font-black text-amber-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </button>

        <span
          aria-hidden
          className="hidden items-center gap-1.5 text-[10px] font-black tracking-[0.22em] text-white/55 uppercase sm:flex"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/70" />
          {ARCADE_MODE ? 'Jogo livre' : 'Boa aventura'}
        </span>

        <div className="flex items-center gap-2">
          {onPause ? (
            <button
              type="button"
              onClick={() => {
                sfx.click();
                onPause();
              }}
              aria-label="Pausar o jogo"
              className="arcade-btn h-12 w-12 text-amber-100"
            >
              <Pause className="h-5 w-5" />
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
            className="arcade-btn h-12 w-12 text-cyan-100"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
