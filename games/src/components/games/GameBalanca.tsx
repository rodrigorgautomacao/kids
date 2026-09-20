import { useRef, useState } from 'react';
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
import { Heart, Square } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { completeLevel, loadLevels, nextUnfinishedLevel } from '../../lib/progress';
import { playCorrect, playWin, playWrong } from '../../lib/sound';

interface GameProps {
  onExit: () => void;
}

interface Situation {
  id: number;
  text: string;
  emoji: string;
  good: boolean;
}

const SITUATIONS: Situation[] = [
  { id: 1, text: 'Devolver a moeda que achou', emoji: '🪙', good: true },
  { id: 2, text: 'Mentir para não levar bronca', emoji: '🤥', good: false },
  { id: 3, text: 'Dividir o lanche com o amigo', emoji: '🍞', good: true },
  { id: 4, text: 'Rir de quem errou na prova', emoji: '😆', good: false },
  { id: 5, text: 'Falar a verdade para a professora', emoji: '💬', good: true },
  { id: 6, text: 'Pegar o brinquedo do irmão escondido', emoji: '🧸', good: false },
  { id: 7, text: 'Encorajar quem está triste', emoji: '🫂', good: true },
  { id: 8, text: 'Colar na prova', emoji: '📄', good: false },
  { id: 9, text: 'Convidar o colega sozinho para brincar', emoji: '⚽', good: true },
  { id: 10, text: 'Furar fila no lanche', emoji: '🍕', good: false },
  { id: 11, text: 'Ajudar a arrumar a sala', emoji: '🧹', good: true },
  { id: 12, text: 'Atender o celular escondido na aula', emoji: '📱', good: false },
  { id: 13, text: 'Ser gentil com quem precisa', emoji: '👴', good: true },
  { id: 14, text: 'Xingar quem é diferente', emoji: '🗯️', good: false },
  { id: 15, text: 'Pedir desculpas ao machucar sem querer', emoji: '🙏', good: true },
  { id: 16, text: 'Jogar lixo no chão', emoji: '🗑️', good: false },
  { id: 17, text: 'Ouvir com atenção quem fala com você', emoji: '👂', good: true },
  { id: 18, text: 'Fazer barulho na hora da oração', emoji: '🙊', good: false },
  { id: 19, text: 'Compartilhar os doces com a turma', emoji: '🍬', good: true },
  { id: 20, text: 'Esconder o erro para não ser visto', emoji: '🕳️', good: false },
  { id: 21, text: 'Respeitar a vez dos outros', emoji: '⏳', good: true },
  { id: 22, text: 'Quebrar a promessa que fez', emoji: '💔', good: false },
  { id: 23, text: 'Estudar para a prova', emoji: '📚', good: true },
  { id: 24, text: 'Deixar o amigo de fora do jogo', emoji: '🚫', good: false },
  { id: 25, text: 'Cuidar com carinho do animalzinho', emoji: '🐶', good: true },
  { id: 26, text: 'Bater em quem te empurrou', emoji: '👊', good: false },
  { id: 27, text: 'Agradecer pela comida', emoji: '🙌', good: true },
  { id: 28, text: 'Contar o segredo que prometeu guardar', emoji: '🤫', good: false },
  { id: 29, text: 'Dar lugar para quem usa cadeira de rodas', emoji: '♿', good: true },
  { id: 30, text: 'Reclamar de tudo o tempo todo', emoji: '😠', good: false },
];

const CARDS_PER_LEVEL = 3;
const TOTAL_LEVELS = SITUATIONS.length / CARDS_PER_LEVEL;

/* ------------------------------ zona de drop ------------------------------ */

interface DropProps {
  id: string;
  label: string;
  kind: 'certa' | 'errada';
}

function DropZone({ id, label, kind }: DropProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const isCerta = kind === 'certa';
  return (
    <div
      ref={setNodeRef}
      aria-label={`Zona ${label}`}
      className={`flex h-24 flex-1 flex-col items-center justify-center gap-1 rounded-3xl border-4 transition-all duration-150 ${
        isCerta
          ? 'border-rose-300 bg-gradient-to-b from-rose-100 to-rose-200'
          : 'border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200'
      } ${isOver ? (isCerta ? 'scale-105 ring-8 ring-rose-300/60' : 'scale-105 ring-8 ring-slate-400/50') : ''}`}
    >
      <span className="text-3xl">{isCerta ? '💖' : '🪨'}</span>
      <span
        className={`rounded-full px-4 py-1 text-sm font-black ${
          isCerta ? 'bg-rose-500 text-white' : 'bg-slate-500 text-white'
        }`}
      >
        A {label}
      </span>
    </div>
  );
}

/* ------------------------------- carta -------------------------------- */

interface CardProps {
  s: Situation;
  disabled: boolean;
  shaking: boolean;
}

function DraggableCard({ s, disabled, shaking }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(s.id),
    data: { good: s.good },
    disabled,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    touchAction: 'none' as const,
  };
  const wrong = s.good === false;
  return (
    <div
      className={`${shaking ? 'animate-shake' : 'animate-float-slow'}`}
      style={{ animationDelay: `${(s.id % 3) * 0.4}s` }}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        aria-label={`carta: ${s.text}`}
        className={`flex h-28 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-4 px-1 text-center shadow-xl ${
          wrong
            ? 'border-slate-400 bg-gradient-to-b from-slate-200 to-slate-400'
            : 'border-rose-200 bg-gradient-to-b from-rose-200 to-rose-400'
        } ${isDragging ? 'scale-110 opacity-85' : ''}`}
      >
        <span className="text-4xl">{s.emoji}</span>
        <span className="text-[10px] leading-tight font-extrabold text-white drop-shadow">
          {s.text}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------- jogo -------------------------------- */

export default function GameBalanca({ onExit }: GameProps) {
  const [level, setLevel] = useState(() => nextUnfinishedLevel(loadLevels(), 'balanca'));
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [shakingId, setShakingId] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const recorded = useRef<Set<number>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const start = (level - 1) * CARDS_PER_LEVEL;
  const cards = SITUATIONS.slice(start, start + CARDS_PER_LEVEL);
  const isLast = level === TOTAL_LEVELS;

  function starsFrom(errCount: number): number {
    return errCount === 0 ? 3 : errCount <= 2 ? 2 : 1;
  }

  function handleDragEnd(event: DragEndEvent) {
    if (finished) return;
    const { active, over } = event;
    if (!over) return;
    const id = Number(active.id);
    const card = SITUATIONS.find((c) => c.id === id);
    if (!card || done.has(id)) return;

    const droppedOnCerta = over.id === 'certa';
    const correct = droppedOnCerta === card.good;

    if (correct) {
      playCorrect();
      const next = new Set(done);
      next.add(id);
      setDone(next);
      if (next.size === CARDS_PER_LEVEL) {
        finishLevel();
      }
    } else {
      playWrong();
      setErrors((e) => e + 1);
      setShakingId(id);
      window.setTimeout(() => setShakingId(null), 550);
    }
  }

  function finishLevel() {
    const stars = starsFrom(errors);
    if (!recorded.current.has(level)) {
      recorded.current.add(level);
      completeLevel('balanca', level, stars);
      if (isLast) playWin();
    }
    setFinished(true);
  }

  function nextLevel() {
    setLevel((l) => l + 1);
    setErrors(0);
    setDone(new Set());
    setShakingId(null);
    setFinished(false);
  }

  return (
    <GameShell
      title="A Balança das Escolhas"
      subtitle="10 níveis · Arraste cada situação para o lado que ela merece!"
      onExit={onExit}
      bg="bg-gradient-to-b from-amber-100 via-orange-100 to-amber-200"
      titleClass="text-amber-700"
    >
      {finished ? <Confetti recycle={false} numberOfPieces={220} gravity={0.16} /> : null}

      <div aria-live="polite" className="sr-only">
        {finished
          ? 'Nível concluído!'
          : `${done.size} de ${CARDS_PER_LEVEL} cartas no lugar certo`}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative flex w-full flex-1 flex-col items-center gap-5 px-4 pb-8">
          <LevelHUD level={level} totalLevels={TOTAL_LEVELS} />

          {/* placar de erros */}
          <span
            className={`rounded-full px-5 py-1.5 text-sm font-black shadow ${
              errors === 0 ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-500 text-white'
            }`}
          >
            {errors === 0
              ? '⚖️ Zero erros — capricha!'
              : `💥 ${errors} erro${errors > 1 ? 's' : ''} até aqui`}
          </span>

          {/* zonas de destino */}
          <div className="flex w-full max-w-lg items-center gap-3">
            <DropZone id="errada" label="ERRADA" kind="errada" />
            <span className="text-2xl font-black text-amber-600">×</span>
            <DropZone id="certa" label="CERTA" kind="certa" />
          </div>

          {/* instrução */}
          <p className="text-sm font-bold text-amber-700/80">
            💡 Leia a situação e solte no lado certo!
          </p>

          {/* cartas */}
          <div
            className={`flex items-start justify-center gap-5 transition-all duration-500 ${
              finished ? 'scale-90 opacity-0' : ''
            }`}
          >
            {cards.map((s) => {
              const isDone = done.has(s.id);
              if (isDone) return <span key={s.id} className="flex h-28 w-24 items-center justify-center text-5xl" aria-hidden>✅</span>;
              return (
                <DraggableCard
                  key={s.id}
                  s={s}
                  disabled={finished}
                  shaking={shakingId === s.id}
                />
              );
            })}
          </div>

          {/* conclusão */}
          {finished ? (
            <div className="-mt-2 flex flex-col items-center">
              <LevelDone
                stars={starsFrom(errors)}
                onNext={isLast ? undefined : nextLevel}
                onExit={onExit}
                lesson={
                  isLast
                    ? 'A balança de Deus pesa o coração: cada boa escolha é um tesouro! ⚖️'
                    : undefined
                }
              />
            </div>
          ) : null}

          <span className="flex items-center gap-1 text-xs font-bold text-amber-700/60">
            <Heart className="h-4 w-4 text-rose-400" /> carta para o coração ·
            <Square className="h-3 w-3 text-slate-500" /> carta para a pedra
          </span>
        </div>
      </DndContext>
    </GameShell>
  );
}