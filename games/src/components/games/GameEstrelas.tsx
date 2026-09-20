import { useState } from 'react';
import Confetti from 'react-confetti';
import { PartyPopper, RotateCcw, Star } from 'lucide-react';
import GameShell from '../GameShell';

interface GameProps {
  onExit: () => void;
}

interface StarSpot {
  id: number;
  left: string;
  top: string;
  size: string;
  delay: string;
}

// Cinco estrelas espalhadas pelo céu (posições em % — funcionam em qualquer tela)
const STAR_SPOTS: StarSpot[] = [
  { id: 1, left: '12%', top: '14%', size: 'h-16 w-16 sm:h-20 sm:w-20', delay: '0s' },
  { id: 2, left: '72%', top: '12%', size: 'h-20 w-20 sm:h-24 sm:w-24', delay: '0.8s' },
  { id: 3, left: '78%', top: '58%', size: 'h-16 w-16 sm:h-20 sm:w-20', delay: '1.4s' },
  { id: 4, left: '8%', top: '62%', size: 'h-20 w-20 sm:h-24 sm:w-24', delay: '2s' },
  { id: 5, left: '36%', top: '30%', size: 'h-24 w-24 sm:h-28 sm:w-28', delay: '2.6s' },
];

const TOTAL = STAR_SPOTS.length;

export default function GameEstrelas({ onExit }: GameProps) {
  const [lit, setLit] = useState<number[]>([]);
  const won = lit.length === TOTAL;

  function lightStar(id: number) {
    if (won || lit.includes(id)) return;
    setLit((prev) => [...prev, id]);
  }

  function reset() {
    setLit([]);
  }

  return (
    <GameShell
      title="Conte as Estrelas"
      subtitle="Toca nas estrelas e conta até 5!"
      onExit={onExit}
      bg="bg-gradient-to-b from-[#0b1029] via-[#1e1b4b] to-[#312e81]"
      titleClass="text-yellow-300"
    >
      {won ? <Confetti recycle={false} numberOfPieces={380} gravity={0.14} /> : null}

      <div aria-live="polite" className="sr-only">
        {won
          ? 'Você acendeu todas as estrelas!'
          : `${lit.length} de 5 estrelas acesas`}
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 pb-8">
        {/* estrelas que acendem ao toque */}
        {STAR_SPOTS.map(({ id, left, top, size, delay }) => {
          const isLit = lit.includes(id) || won;
          return (
            <button
              key={id}
              type="button"
              onClick={() => lightStar(id)}
              disabled={won}
              aria-label={`Estrela ${id} de 5`}
              className={`absolute z-20 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90 animate-float ${size} ${
                isLit
                  ? 'drop-shadow-[0_0_18px_rgba(253,224,71,0.95)]'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{ left, top, animationDelay: delay }}
            >
              <Star
                className={`h-full w-full transition-all duration-300 ${
                  isLit ? 'scale-110 fill-yellow-300 text-yellow-300 animate-pop' : 'fill-none text-white/70'
                }`}
                strokeWidth={1.5}
              />
            </button>
          );
        })}

        {/* contador grande */}
        <div className="z-10 flex items-center gap-3 rounded-full bg-white/10 px-8 py-4 shadow-xl backdrop-blur-sm">
          <Star className="h-8 w-8 fill-yellow-300 text-yellow-300" />
          <span className="text-4xl font-black text-white">
            {lit.length}
            <span className="mx-1 text-white/50">/</span>
            <span className="text-white/70">{TOTAL}</span>
          </span>
        </div>

        {/* estado final */}
        {won ? (
          <div className="animate-pop z-20 flex flex-col items-center gap-4">
            <p className="rounded-3xl bg-white/10 px-6 py-4 text-center text-2xl font-black text-yellow-200 shadow-xl backdrop-blur-sm sm:text-3xl">
              Você acendeu todas as estrelas! ⭐⭐⭐⭐⭐
              <span className="mt-1 block text-base font-bold text-white/80">
                Cada estrela é uma boa escolha que brilha!
              </span>
            </p>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-3 rounded-full bg-yellow-400 px-10 py-5 text-2xl font-extrabold text-indigo-950 shadow-[0_8px_0_rgba(202,138,4,0.9)] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none sm:text-3xl"
            >
              <RotateCcw className="h-8 w-8" /> Jogar Novamente
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-2 rounded-full bg-white/70 px-6 py-2 text-sm font-bold text-indigo-900 shadow active:scale-95"
            >
              <PartyPopper className="h-4 w-4" /> Outros jogos
            </button>
          </div>
        ) : (
          <p className="z-10 text-sm font-bold text-white/70">
            Toca nas estrelas para acendê-las ✨
          </p>
        )}
      </div>
    </GameShell>
  );
}