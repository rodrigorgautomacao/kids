import { Lock, Star, X } from 'lucide-react';
import { Motif } from './art';

export interface MapItem {
  id: string;
  label: string;
  /** linha de apoio (ex.: referência bíblica) */
  sublabel?: string;
  /** estrelas já conquistadas (0..maxStars) */
  stars: number;
  maxStars: number;
  locked?: boolean;
  /** já concluído ao menos uma vez */
  done?: boolean;
  /** motivo (estações da Aventura) */
  motif?: string;
  /** emoji de apoio quando não há motivo */
  emoji?: string;
}

interface LevelMapProps {
  title: string;
  subtitle?: string;
  items: MapItem[];
  /** rótulo do botão de cada cartão (ex.: "Jogar", "Ir até") */
  actionLabel?: string;
  onPick: (id: string) => void;
  onClose: () => void;
}

/**
 * Mapa/seleção de trechos e estações (skill `jogos-game-design` §G3): a criança
 * rejoga o que quiser sem depender de ler a sinopse. Cartões grandes, estrelas
 * visíveis e cadeado claro no que ainda não abriu.
 */
export default function LevelMap({
  title,
  subtitle,
  items,
  actionLabel = 'Jogar',
  onPick,
  onClose,
}: LevelMapProps) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 p-3">
      <div className="animate-pop flex max-h-full w-full max-w-2xl flex-col gap-3 rounded-3xl bg-slate-900/95 p-4 shadow-2xl ring-2 ring-white/15">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-yellow-300">{title}</h3>
            {subtitle ? <p className="text-sm font-bold text-white/75">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar o mapa"
            className="ui-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.locked}
              onClick={() => onPick(item.id)}
              aria-label={`${item.label}${item.locked ? ' (bloqueado)' : ''}`}
              className={`ui-press flex flex-col items-center gap-1 rounded-2xl p-3 text-center ${
                item.locked
                  ? 'bg-slate-800/80 text-slate-400'
                  : item.done
                    ? 'bg-emerald-900/70 text-white ring-2 ring-emerald-400/50'
                    : 'bg-white/10 text-white ring-2 ring-white/15'
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30">
                {item.locked ? (
                  <Lock className="h-6 w-6" />
                ) : item.motif ? (
                  <Motif id={item.motif} size={30} />
                ) : (
                  <span className="text-2xl">{item.emoji ?? '📖'}</span>
                )}
              </span>
              <span className="text-sm leading-tight font-black">
                {item.label}
                {item.done ? ' ✅' : ''}
              </span>
              {item.sublabel ? (
                <span className="text-[11px] font-bold text-white/70">{item.sublabel}</span>
              ) : null}
              {!item.locked ? (
                <>
                  <span className="flex items-center gap-0.5" aria-hidden>
                    {Array.from({ length: item.maxStars }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < item.stars ? 'fill-yellow-300 text-yellow-300' : 'text-white/25'
                        }`}
                      />
                    ))}
                  </span>
                  <span className="rounded-full bg-yellow-400 px-3 py-0.5 text-[11px] font-black text-amber-950">
                    {actionLabel}
                  </span>
                </>
              ) : (
                <span className="text-[11px] font-black text-slate-400">
                  Complete a anterior
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
