import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Confetti from 'react-confetti';
import { Frown, Heart, PartyPopper, Plus, RotateCcw, Sparkles } from 'lucide-react';
import GameShell from '../GameShell';

interface GameProps {
  onExit: () => void;
}

type ItemKind = 'sad' | 'heart';

interface TrayItem {
  id: string;
  kind: ItemKind;
}

// Blocos cinzentos "tristes" + o coração brilhante com cruz
const TRAY_ITEMS: TrayItem[] = [
  { id: 'triste-1', kind: 'sad' },
  { id: 'triste-2', kind: 'sad' },
  { id: 'coracao-1', kind: 'heart' },
];

/* ------------------------------------------------------------------ */
/*  Balança (zona de drop)                                             */
/* ------------------------------------------------------------------ */

interface ScaleAreaProps {
  tilt: number;
  shaking: boolean;
  blocksGone: boolean;
  heartPlaced: boolean;
}

function ScaleArea({ tilt, shaking, blocksGone, heartPlaced }: ScaleAreaProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'scale-zone' });

  return (
    <div
      ref={setNodeRef}
      aria-label="Balança das escolhas"
      className={`relative mx-auto w-full max-w-xl rounded-3xl transition-shadow duration-300 ${
        isOver ? 'z-20 ring-8 ring-pink-300/70' : ''
      } ${shaking ? 'animate-shake' : ''}`}
      style={{ height: 360 }}
    >
      {/* base + coluna estáticas */}
      <div className="absolute bottom-2 left-1/2 h-5 w-52 -translate-x-1/2 rounded-full bg-amber-900 shadow-lg" />
      <div className="absolute bottom-6 left-1/2 h-28 w-14 -translate-x-1/2 rounded-t-md rounded-b-xl bg-gradient-to-t from-amber-800 to-amber-600" />
      <div className="absolute bottom-[102px] left-1/2 h-0 w-0 -translate-x-1/2 border-b-[34px] border-l-[26px] border-r-[26px] border-b-amber-800 border-l-transparent border-r-transparent" />

      {/* conjunto que gira (braço + pratos) no pino central */}
      <div className="absolute top-[86px] left-1/2 -translate-x-1/2">
        <div
          className="transition-transform duration-1000 ease-in-out"
          style={{
            transform: `rotate(${tilt}deg)`,
            transformOrigin: '50% 8%',
          }}
        >
          {/* braço da balança */}
          <div className="relative h-5 w-[min(68vw,400px)] rounded-full bg-gradient-to-b from-amber-400 to-amber-700 shadow-md">
            <div className="absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-950" />
          </div>

          {/* prato esquerdo — blocos tristes (pesados) */}
          <div className="absolute top-full left-0 flex -translate-x-[120%] flex-col items-center">
            <div className="h-12 w-1.5 bg-amber-800/70" />
            <div
              className={`flex h-14 w-32 items-center justify-center gap-1.5 rounded-2xl border-b-4 border-amber-950 bg-gradient-to-b from-amber-600 to-amber-800 shadow-inner transition-all duration-700 ${
                blocksGone ? 'scale-50 opacity-0' : ''
              }`}
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-500 bg-slate-400 shadow"
                >
                  <Frown className="h-5 w-5 text-white" strokeWidth={2.5} />
                </span>
              ))}
            </div>
          </div>

          {/* prato direito — recebe o coração */}
          <div className="absolute top-full right-0 flex translate-x-[120%] flex-col items-center">
            <div className="h-12 w-1.5 bg-amber-800/70" />
            <div
              className={`flex h-14 w-32 items-center justify-center rounded-2xl border-b-4 border-amber-950 bg-gradient-to-b from-amber-600 to-amber-800 shadow-inner ${
                heartPlaced ? 'animate-pop' : ''
              }`}
            >
              {heartPlaced ? (
                <span className="relative flex items-center justify-center">
                  <Sparkles className="absolute -top-3 left-6 h-5 w-5 text-yellow-200 animate-pulse" />
                  <Heart className="h-10 w-10 fill-white text-pink-300 drop-shadow-lg" />
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Elementos arrastáveis                                              */
/* ------------------------------------------------------------------ */

interface DraggableThingProps {
  item: TrayItem;
  disabled: boolean;
}

function DraggableThing({ item, disabled }: DraggableThingProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { kind: item.kind },
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    touchAction: 'none' as const,
  };

  if (item.kind === 'sad') {
    // a animação "flutuar" fica num wrapper, o transform do drag no elemento interno
    return (
      <div className="animate-float-slow">
        <div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={style}
          aria-label="Bloco cinzento triste"
          className={`flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-4 border-slate-500 bg-gradient-to-b from-slate-300 to-slate-500 shadow-xl ${
            isDragging ? 'rotate-3 scale-105 opacity-80' : ''
          }`}
        >
          <Frown className="h-10 w-10 text-white" strokeWidth={2.5} />
          <span className="text-[10px] font-extrabold tracking-widest text-white/85 uppercase">
            Triste
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-float">
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        aria-label="Coração brilhante com cruz"
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-pink-200 bg-gradient-to-b from-pink-400 to-rose-600 shadow-[0_0_26px_rgba(244,114,182,0.95)] ${
          isDragging ? 'scale-110' : ''
        }`}
      >
        <Sparkles className="absolute -left-2 -top-2 h-6 w-6 text-yellow-300 animate-pulse" />
        <Heart className="h-12 w-12 fill-white text-rose-100 drop-shadow" />
        {/* cruz/mais sobre o coração */}
        <span className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-rose-200 bg-white shadow-lg">
          <Plus className="h-5 w-5 text-rose-500" strokeWidth={3.5} />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Jogo                                                               */
/* ------------------------------------------------------------------ */

export default function GameBalanca({ onExit }: GameProps) {
  const [won, setWon] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [sadHint, setSadHint] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const tilt = won ? 0 : -16;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || over.id !== 'scale-zone') return;

    const kind = active.data.current?.kind as ItemKind | undefined;

    if (kind === 'heart') {
      setWon(true);
      return;
    }

    if (kind === 'sad') {
      // bloco triste na balança: nada acontece de bom — só um "abano" e uma dica
      setShaking(true);
      setSadHint(true);
      window.setTimeout(() => setShaking(false), 600);
    }
  }

  function reset() {
    setWon(false);
    setShaking(false);
    setSadHint(false);
  }

  return (
    <GameShell
      title="A Balança das Escolhas"
      subtitle="Arrasta o coração para dentro da balança!"
      onExit={onExit}
      bg="bg-gradient-to-b from-amber-100 via-orange-100 to-amber-200"
      titleClass="text-amber-700"
    >
      {won ? <Confetti recycle={false} numberOfPieces={380} gravity={0.12} /> : null}

      <div aria-live="polite" className="sr-only">
        {won ? 'Parabéns! A balança equilibrou!' : ''}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 pb-8">
          <ScaleArea tilt={tilt} shaking={shaking} blocksGone={won} heartPlaced={won} />

          {!won && sadHint ? (
            <p className="animate-pop rounded-full bg-rose-100 px-5 py-2 text-center text-sm font-extrabold text-rose-600 shadow">
              😢 Os blocos tristes não servem… procura o ✨ coração ✨ e solta aqui!
            </p>
          ) : null}

          {/* tabuleiro de elementos arrastáveis */}
          <div
            className={`flex items-end justify-center gap-8 pt-4 transition-all duration-700 ${
              won ? 'pointer-events-none scale-90 opacity-0' : ''
            }`}
          >
            {TRAY_ITEMS.map((item) => (
              <DraggableThing key={item.id} item={item} disabled={won} />
            ))}
          </div>

          {/* vitória */}
          {won ? (
            <div className="animate-pop -mt-4 flex flex-col items-center gap-4">
              <p className="rounded-3xl bg-white/90 px-8 py-4 text-center text-2xl font-black text-emerald-600 shadow-xl sm:text-3xl">
                Muito bem! 🎉{' '}
                <span className="block text-base font-bold text-emerald-500">
                  A balança equilibrou!
                </span>
              </p>
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-3 rounded-full bg-emerald-500 px-10 py-5 text-2xl font-extrabold text-white shadow-[0_8px_0_rgba(5,150,105,0.9)] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none sm:text-3xl"
              >
                <RotateCcw className="h-8 w-8" /> Jogar Novamente
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex items-center gap-2 rounded-full bg-white/70 px-6 py-2 text-sm font-bold text-slate-600 shadow active:scale-95"
              >
                <PartyPopper className="h-4 w-4" /> Outros jogos
              </button>
            </div>
          ) : (
            <p className="text-center text-sm font-bold text-amber-700/70">
              Solta o coração em cima da balança ✨
            </p>
          )}
        </div>
      </DndContext>
    </GameShell>
  );
}