import { RotateCcw } from 'lucide-react';

interface RotateHintProps {
  /** Mostrar o aviso (celular em pé). */
  show: boolean;
  /** "Continuar assim mesmo" — o jogo volta a rodar. */
  onContinue?: () => void;
}

/**
 * Aviso para virar o aparelho.
 *
 * Em celular na vertical a área de jogo fica estreita demais para o mundo 2D.
 * Em vez de girar a câmera (que deixaria o jogo minúsculo), pausamos e pedimos
 * para virar — decisão D1 do ADR-002. Tablet e computador não veem este aviso.
 */
export default function RotateHint({ show, onContinue }: RotateHintProps) {
  if (!show) return null;

  return (
    <div
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-slate-950/85 p-6 text-center"
      role="alertdialog"
      aria-live="polite"
      aria-label="Vire o aparelho para jogar"
    >
      <span className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-amber-400/20">
        <RotateCcw className="h-11 w-11 text-amber-300" />
      </span>
      <p className="text-2xl font-black text-amber-300">Vire o aparelho 🔄</p>
      <p className="max-w-xs text-base font-bold text-white/90">
        Deite o celular de lado para ver o mundo inteiro e jogar melhor.
      </p>
      {onContinue ? (
        <button
          type="button"
          onClick={onContinue}
          className="mt-1 rounded-full bg-white/15 px-6 py-3 text-base font-bold text-white shadow"
        >
          Continuar assim mesmo
        </button>
      ) : null}
    </div>
  );
}
