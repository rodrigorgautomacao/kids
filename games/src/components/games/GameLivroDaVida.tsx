import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { BookOpen, PartyPopper, RotateCcw, Star, Sparkles } from 'lucide-react';
import GameShell from '../GameShell';
import { completeGame } from '../../lib/progress';

interface GameProps {
  onExit: () => void;
}

const WORD = ['A', 'M', 'O', 'R'];

interface FloatingLetter {
  letter: string;
  left: string;
  top: string;
  color: string;
  delay: string;
}

// Letras soltas espalhadas pelo ecrã (posições em % — funcionam em qualquer tela)
const FLOATING_LETTERS: FloatingLetter[] = [
  { letter: 'A', left: '10%', top: '16%', color: 'bg-rose-400 border-rose-200', delay: '0s' },
  { letter: 'M', left: '76%', top: '18%', color: 'bg-violet-400 border-violet-200', delay: '0.7s' },
  { letter: 'O', left: '8%', top: '62%', color: 'bg-emerald-400 border-emerald-200', delay: '1.4s' },
  { letter: 'R', left: '74%', top: '60%', color: 'bg-amber-400 border-amber-200', delay: '2.1s' },
];

export default function GameLivroDaVida({ onExit }: GameProps) {
  const [collected, setCollected] = useState<string[]>([]);
  const won = collected.length === WORD.length;
  const recorded = useRef(false);

  useEffect(() => {
    if (won && !recorded.current) {
      recorded.current = true;
      completeGame('livro-da-vida', 3);
    }
  }, [won]);

  function collect(letter: string) {
    if (won || collected.includes(letter)) return;
    setCollected((prev) => [...prev, letter]);
  }

  function reset() {
    setCollected([]);
  }

  return (
    <GameShell
      title="O Livro da Vida"
      subtitle="Toca nas letras e deixa o teu nome guardado!"
      onExit={onExit}
      bg="bg-gradient-to-b from-indigo-950 via-violet-900 to-indigo-900"
      titleClass="text-yellow-300"
    >
      {won ? <Confetti recycle={false} numberOfPieces={380} gravity={0.14} /> : null}

      <div aria-live="polite" className="sr-only">
        {won ? 'Seu nome está no Livro da Vida!' : `${collected.length} de 4 letras encontradas`}
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-4 pb-8">
        {/* estrelinhas de fundo */}
        <span className="absolute top-[8%] right-[6%] h-5 w-5 text-yellow-200/40 animate-twinkle">
          <Star className="h-5 w-5" />
        </span>
        <span className="absolute bottom-[12%] left-[5%] h-4 w-4 text-white/30 animate-twinkle" style={{ animationDelay: '1s' }}>
          <Star className="h-4 w-4" />
        </span>

        {/* letras flutuantes clicáveis */}
        {FLOATING_LETTERS.map(({ letter, left, top, color, delay }) => {
          const isCollected = collected.includes(letter) || won;
          return (
            <button
              key={letter}
              type="button"
              onClick={() => collect(letter)}
              disabled={isCollected}
              aria-label={`Letra ${letter}`}
              className={`absolute z-20 flex h-20 w-20 items-center justify-center rounded-full border-4 text-4xl font-black text-white shadow-xl transition-all duration-300 active:scale-90 sm:h-24 sm:w-24 sm:text-5xl animate-float ${color} ${
                isCollected
                  ? 'pointer-events-none scale-0 opacity-0'
                  : 'opacity-100 hover:scale-110'
              }`}
              style={{ left, top, animationDelay: delay }}
            >
              {letter}
            </button>
          );
        })}

        {/* Livro da Vida */}
        <div
          className={`relative z-10 mt-8 w-64 transition-all duration-700 sm:w-80 ${
            won ? 'animate-glow-gold scale-105' : ''
          }`}
        >
          {/* capa dourada */}
          <div className="absolute -inset-2.5 rounded-3xl border-4 border-yellow-200/70 bg-gradient-to-b from-yellow-300 to-amber-600 shadow-2xl" />
          {/* páginas abertas */}
          <div className="relative flex aspect-[7/5] overflow-hidden rounded-xl bg-[#fdf6e3] shadow-inner">
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3">
              <BookOpen className="h-7 w-7 text-amber-500" />
              <span className="text-lg font-extrabold text-amber-700">
                {collected.length}/{WORD.length}
              </span>
            </div>
            {/* vinco central */}
            <div className="w-1.5 bg-gradient-to-b from-amber-300 to-amber-500" />
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3">
              <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase">
                Palavra
              </span>
              <div className="flex items-center justify-center gap-1.5">
                {WORD.map((ch) => {
                  const isCollected = collected.includes(ch);
                  return (
                    <span
                      key={ch}
                      className={`flex h-11 w-8 items-center justify-center rounded-md border-2 text-2xl font-black transition-all duration-500 ${
                        isCollected
                          ? 'scale-100 border-amber-400 bg-amber-100 text-amber-600'
                          : 'scale-90 border-amber-100 bg-amber-50 text-amber-200'
                      }`}
                    >
                      {isCollected ? ch : '•'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          {/* marcador */}
          <div className="absolute -bottom-3 left-1/2 h-9 w-6 -translate-x-1/2 rounded-b-md bg-rose-500 shadow" />
        </div>

        {/* estado final */}
        {won ? (
          <div className="animate-pop z-20 flex flex-col items-center gap-4">
            <span className="flex items-center gap-1 rounded-full bg-yellow-300/20 px-4 py-1.5 backdrop-blur-sm">
              <span className="text-sm font-extrabold text-yellow-100">Capítulo concluído!</span>
              {[1, 2, 3].map((i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-300 text-yellow-300" />
              ))}
            </span>
            <p className="rounded-3xl bg-white/10 px-6 py-4 text-center text-xl font-black text-yellow-200 shadow-xl backdrop-blur-sm sm:text-2xl">
              ✨ Seu nome está no Livro da Vida! ✨
              <span className="mt-1 block text-sm font-bold text-white/80">
                Deus guarda para sempre quem ama e faz o certo!
              </span>
            </p>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-3 rounded-full bg-emerald-400 px-10 py-5 text-2xl font-extrabold text-emerald-950 shadow-[0_8px_0_rgba(4,120,87,0.9)] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none sm:text-3xl"
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
          <p className="z-10 flex items-center gap-2 text-sm font-bold text-yellow-100/80">
            <Sparkles className="h-4 w-4 text-yellow-300" /> Toca nas letras para formar
            <span className="rounded-md bg-yellow-300/20 px-2 py-0.5 font-black text-yellow-200">
              AMOR
            </span>
          </p>
        )}
      </div>
    </GameShell>
  );
}