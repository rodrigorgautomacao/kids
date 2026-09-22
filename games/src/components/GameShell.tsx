import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Pause, Volume2, VolumeX } from 'lucide-react';
import { isAllMuted, setAllMuted, sfx, subscribeSoundPrefs } from '../lib/audio';

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
 * Casca comum de todos os jogos: fundo colorido, botão "Voltar", mudo, pausa,
 * título grande e área de jogo. Foco em touch (seleção desativada).
 *
 * `safe-area-pad` recua todo o conteúdo para fora do notch/ilha/home indicator
 * do iPhone; como os filhos absolutos se posicionam pelo padding box, os botões
 * de "Voltar", som e pausa já ficam dentro da área segura.
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
    <div
      className={`safe-area-pad relative flex min-h-screen-safe w-full flex-col overflow-hidden select-none ${bg}`}
    >
      <button
        type="button"
        onClick={() => {
          sfx.click();
          onExit();
        }}
        aria-label="Voltar ao menu de jogos"
        className="ui-press absolute top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-slate-700 shadow-lg"
      >
        <ArrowLeft className="h-5 w-5" /> Voltar
      </button>

      {onPause ? (
        <button
          type="button"
onClick={() => {
          sfx.click();
          onPause();
        }}
        aria-label="Pausar o jogo"
          className="ui-press absolute top-4 right-16 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg"
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
        className="ui-press absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <header className="pt-16 pb-2 px-4 text-center">
        <h2 className={`text-3xl font-extrabold drop-shadow-sm sm:text-4xl ${titleClass}`}>
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-1 max-w-md text-base font-semibold text-white/85">{subtitle}</p>
        ) : null}
      </header>

      {children}
    </div>
  );
}
