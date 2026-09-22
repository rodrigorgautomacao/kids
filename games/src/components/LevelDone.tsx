import { useEffect, useRef } from 'react';
import { PartyPopper, Star } from 'lucide-react';
import { music, sfx } from '../lib/audio';

interface LevelDoneProps {
  /** Estrelas ganhas no nível (1-3) */
  stars: number;
  /** Sobe para o próximo nível. Ausente = é o último nível do capítulo */
  onNext?: () => void;
  /** Volta ao hub de jogos */
  onExit: () => void;
  /** Título da vitória (padrão: "Nível concluído!") */
  headline?: string;
  /** Fala do capítulo (surge na tela final) */
  lesson?: string;
  /** Erros cometidos no nível — explica POR QUE ganhou essas estrelas (G5) */
  wrong?: number;
  /** Abre o mapa de trechos */
  onOpenMap?: () => void;
  /** Toca fanfarra + música de vitória ao montar (padrão: true). Desligue em
   *  jogos que já tocam a própria vitória (Estrada, Heróis, Aventura). */
  celebrate?: boolean;
}

/** Explicação curta das estrelas (G5): a criança entende o que ganhou. */
export function starReason(stars: number, wrong?: number): string {
  if (typeof wrong === 'number') {
    if (wrong === 0) return 'Perfeito: nenhum erro no caminho!';
    if (wrong === 1) return 'Quase perfeito: só 1 erro no caminho.';
    return `Teve ${wrong} erros — na próxima dá para acertar mais!`;
  }
  if (stars >= 3) return 'Perfeito: nenhum erro no caminho!';
  if (stars === 2) return 'Quase perfeito: só 1 erro no caminho.';
  return 'Você conseguiu! Na próxima dá para acertar mais.';
}

/** Tela de fim de nível/capítulo: estrelas (entrando uma a uma) + avanço. */
export default function LevelDone({
  stars,
  onNext,
  onExit,
  headline,
  lesson,
  wrong,
  onOpenMap,
  celebrate = true,
}: LevelDoneProps) {
  const isChapterEnd = !onNext;
  const reason = starReason(stars, wrong);
  const celebrated = useRef(false);

  // Fanfarra + música de vitória centralizada (G4/Áudio): os motores de jogo
  // (Puzzle, Memory, Choice, Sort, Connect, Count, Order e os wrappers) não
  // tocavam nenhuma comemoração ao fechar nível. Guard de StrictMode (dev
  // monta efeito 2x) com ref que sobreiye à remontagem só no primeiro frame.
  useEffect(() => {
    if (!celebrate || celebrated.current) return;
    celebrated.current = true;
    if (isChapterEnd) {
      sfx.withDuck(sfx.chapter, 1.9);
      music.playVictory('game', 8);
    } else {
      sfx.withDuck(sfx.win, 1.3);
      music.playVictory('game', 5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-pop flex flex-col items-center gap-4">
      <span className="hud-pill flex items-center gap-1.5 px-5 py-2">
        <span className="text-base font-extrabold text-white">
          {headline ?? (isChapterEnd ? 'Capítulo concluído!' : 'Nível concluído!')}
        </span>
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            style={{ animationDelay: `${(i - 1) * 90}ms` }}
            className={`animate-star-in h-6 w-6 ${
              i <= stars ? 'fill-yellow-300 text-yellow-300 drop-shadow' : 'text-white/25'
            }`}
          />
        ))}
      </span>

      {stars < 3 ? (
        <p className="max-w-md rounded-3xl bg-black/55 px-6 py-3 text-center text-base font-black text-white shadow">
          ⭐ {reason}
        </p>
      ) : null}

      {isChapterEnd ? (
        <p className="max-w-md rounded-3xl bg-black/55 px-6 py-4 text-center text-lg font-extrabold text-white shadow">
          🏆 Você completou todos os níveis deste capítulo!
          {lesson ? (
            <span className="mt-1 block text-base font-bold text-white/85">{lesson}</span>
          ) : null}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="ui-press flex items-center gap-3 rounded-full bg-yellow-400 px-10 py-5 text-2xl font-extrabold text-amber-950 shadow-[0_8px_0_rgba(202,138,4,0.9)] sm:text-3xl"
          >
            Próximo nível ▶
          </button>
        ) : null}

        {onOpenMap ? (
          <button
            type="button"
            onClick={onOpenMap}
            className="ui-press flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 text-base font-black text-white"
          >
            🗺️ Escolher trecho
          </button>
        ) : null}
      </div>

      <p className="max-w-md text-center text-xs font-bold text-white/70">
        3 ⭐ sem nenhum erro · 2 ⭐ com 1 erro · 1 ⭐ com 2 erros ou mais
      </p>

      <button
        type="button"
        onClick={onExit}
        className="ui-press flex items-center gap-2 rounded-full bg-white/70 px-6 py-2 text-sm font-bold text-slate-700 shadow"
      >
        <PartyPopper className="h-4 w-4" /> Outros jogos
      </button>
    </div>
  );
}
