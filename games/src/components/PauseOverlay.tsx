import { Play, RotateCcw, DoorOpen } from 'lucide-react';

interface PauseOverlayProps {
  onResume: () => void;
  onExit: () => void;
  /** Se ausente, não mostra "começar de novo" */
  onRestart?: () => void;
  title?: string;
}

/**
 * Pausa (skill `jogos-game-design` §G6): o jogo para de verdade — o laço de
 * física e a narração ficam bloqueados enquanto isto está aberto. Sempre com uma
 * saída óbvia para continuar.
 */
export default function PauseOverlay({ onResume, onExit, onRestart, title }: PauseOverlayProps) {
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/65 p-4">
      <div className="animate-pop flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-slate-900/95 p-6 text-center shadow-2xl ring-2 ring-white/15">
        <p className="text-5xl">⏸️</p>
        <h3 className="text-2xl font-black text-yellow-300">{title ?? 'Pausa'}</h3>

        <button
          type="button"
          onClick={onResume}
          className="ui-press flex w-full items-center justify-center gap-3 rounded-full bg-emerald-500 px-8 py-4 text-xl font-black text-white shadow-[0_6px_0_rgba(5,150,105,0.9)]"
        >
          <Play className="h-6 w-6" /> Continuar
        </button>

        {onRestart ? (
          <button
            type="button"
            onClick={onRestart}
            className="ui-press flex w-full items-center justify-center gap-3 rounded-full bg-yellow-400 px-6 py-3 text-lg font-black text-amber-950 shadow-[0_5px_0_rgba(202,138,4,0.9)]"
          >
            <RotateCcw className="h-5 w-5" /> Começar de novo
          </button>
        ) : null}

        <button
          type="button"
          onClick={onExit}
          className="ui-press flex w-full items-center justify-center gap-2 rounded-full bg-white/15 px-6 py-3 text-base font-black text-white"
        >
          <DoorOpen className="h-5 w-5" /> Sair do jogo
        </button>
      </div>
    </div>
  );
}
