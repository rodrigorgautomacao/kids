import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface GameShellProps {
  title: string;
  subtitle?: string;
  onExit: () => void;
  /** Classes Tailwind do fundo da tela do jogo */
  bg: string;
  /** Classe de cor do título */
  titleClass: string;
  children: ReactNode;
}

/**
 * Casca comum de todos os jogos: fundo colorido, botão "Voltar",
 * título grande e área de jogo. Foco em touch (seleção desativada).
 */
export default function GameShell({
  title,
  subtitle,
  onExit,
  bg,
  titleClass,
  children,
}: GameShellProps) {
  return (
    <div
      className={`relative flex min-h-screen w-full flex-col overflow-hidden select-none ${bg}`}
    >
      <button
        type="button"
        onClick={onExit}
        aria-label="Voltar ao menu de jogos"
        className="absolute top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-lg transition-transform active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" /> Voltar
      </button>

      <header className="pt-16 pb-2 px-4 text-center">
        <h2
          className={`text-3xl font-extrabold drop-shadow-sm sm:text-4xl ${titleClass}`}
        >
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-base text-white/90">{subtitle}</p> : null}
      </header>

      {children}
    </div>
  );
}