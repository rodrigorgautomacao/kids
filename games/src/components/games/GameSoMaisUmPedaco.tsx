import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Candy, Gift, Smile, Sparkles } from 'lucide-react';
import GameShell from '../GameShell';
import ForgivenessCard from '../ForgivenessCard';

interface GameProps {
  onExit: () => void;
}

type GamePhase = 'choice' | 'immediate' | 'consequence' | 'forgiveness';

const IMMEDIATE_MS = 2800;
const CONSEQUENCE_MS = 4200;
const CANDIES = 5;

export default function GameSoMaisUmPedaco({ onExit }: GameProps) {
  const [phase, setPhase] = useState<GamePhase>('choice');
  const [hogged, setHogged] = useState<boolean | null>(null); // true = pegou tudo

  useEffect(() => {
    if (phase === 'immediate') {
      const t = window.setTimeout(() => setPhase('consequence'), IMMEDIATE_MS);
      return () => window.clearTimeout(t);
    }
    if (phase === 'consequence') {
      const t = window.setTimeout(() => setPhase('forgiveness'), CONSEQUENCE_MS);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  function choose(opt: 'hog' | 'share') {
    setHogged(opt === 'hog');
    setPhase('immediate');
  }

  function reset() {
    setHogged(null);
    setPhase('choice');
  }

  const friendsGone = hogged === true && phase !== 'choice' && phase !== 'immediate';
  const friendsTogether = hogged === false && phase !== 'choice';

  return (
    <GameShell
      title="Só Mais um Pedaço"
      subtitle="A bandeja tem doces para todo mundo?"
      onExit={onExit}
      bg="bg-gradient-to-b from-pink-100 via-rose-50 to-amber-100"
      titleClass="text-rose-600"
    >
      {phase === 'immediate' && hogged === true ? (
        <Confetti recycle={false} numberOfPieces={220} gravity={0.18} />
      ) : null}

      <div aria-live="polite" className="sr-only">
        {phase === 'immediate' && hogged === true
          ? 'Você ficou com todos os doces'
          : phase === 'immediate' && hogged === false
            ? 'Você entregou metade'
            : phase === 'consequence' && hogged === true
              ? 'Ficar com tudo deixou você sozinho'
              : phase === 'consequence' && hogged === false
                ? 'Vocês dividiram e foram mais felizes'
                : ''}
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 pb-8">
        {/* ------- cena: bandeja de doces ------- */}
        <div className="relative flex h-44 w-full max-w-md items-end justify-center">
          <div className="absolute bottom-0 h-6 w-3/4 rounded-full bg-rose-900/10" />

          {/* bandeja */}
          <div className="absolute bottom-4 left-1/2 flex h-12 w-44 -translate-x-1/2 items-center justify-center rounded-2xl border-b-4 border-amber-300 bg-gradient-to-b from-white to-amber-100 shadow-xl">
            {Array.from({ length: CANDIES }).map((_, i) => (
              <Candy
                key={i}
                className={`mx-0.5 h-6 w-6 text-rose-400 transition-all duration-700 ${
                  hogged === true && phase !== 'choice'
                    ? 'scale-125'
                    : 'scale-100'
                }`}
              />
            ))}
          </div>

          {/* amigos */}
          {[0, 1, 2].map((i) => {
            const gone = friendsGone;
            return (
              <div
                key={i}
                className={`absolute bottom-16 flex flex-col items-center transition-all duration-1000 ${
                  i === 0 ? 'left-[4%]' : i === 1 ? 'right-[4%]' : 'left-1/2 -translate-x-1/2 top-0'
                } ${
                  gone
                    ? `translate-y-6 scale-0 opacity-0`
                    : 'scale-100 opacity-100'
                } ${friendsTogether ? 'animate-bounce' : ''}`}
                style={gone ? { transitionDelay: `${(i + 1) * 350}ms` } : undefined}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full shadow ${
                    friendsTogether ? 'bg-emerald-100' : 'bg-rose-100'
                  }`}
                >
                  <Smile
                    className={`h-7 w-7 ${
                      friendsTogether
                        ? 'text-emerald-500'
                        : gone
                          ? 'text-slate-300'
                          : 'text-rose-400'
                    }`}
                  />
                </span>
                <span className="sr-only">amigo</span>
              </div>
            );
          })}

          {/* você segurando tudo (imediato do "pegar tudo") */}
          {phase === 'immediate' && hogged === true ? (
            <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 animate-pop">
              <span className="flex items-center gap-1 rounded-full bg-rose-400 px-4 py-1.5 text-lg font-black text-white shadow-[0_0_18px_rgba(251,113,133,0.9)]">
                <Candy className="h-5 w-5" /> {CANDIES + 1} doces!
              </span>
            </div>
          ) : null}

          {phase === 'immediate' && hogged === false ? (
            <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 animate-pop">
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-4 py-1.5 text-base font-bold text-emerald-600 shadow-lg">
                <Gift className="h-5 w-5" /> Metade entregue
              </span>
            </div>
          ) : null}
        </div>

        {/* ------- mensagem ------- */}
        <p className="max-w-md rounded-3xl bg-white/80 px-6 py-3 text-center text-lg font-bold text-slate-700 shadow-md">
          {phase === 'choice' && 'A bandeja de doces chegou. Seus amigos olham…'}
          {phase === 'immediate' && hogged === true && 'Tudo seu, agora! Que brilho de vitória…'}
          {phase === 'immediate' && hogged === false && 'Você entregou metade. Um gesto simples.'}
          {phase === 'consequence' && hogged === true && (
            <>
              Ficar com tudo deixou você sozinho…{' '}
              <span className="block pt-1 text-base font-semibold text-slate-500">
                Os amigos saíram um a um.
              </span>
            </>
          )}
          {phase === 'consequence' && hogged === false && (
            <>
              Vocês dividiram e foram mais felizes!{' '}
              <span className="block pt-1 text-base font-semibold text-emerald-600">
                A alegria ficou do tamanho da turma.
              </span>
            </>
          )}
          {phase === 'forgiveness' &&
            'Dividir dobra a alegria e enche o céu de estrelas! ✨'}
        </p>

        {/* ------- escolha ------- */}
        {phase === 'choice' ? (
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => choose('hog')}
              className="flex w-full items-center justify-center gap-3 rounded-3xl border-4 border-pink-300 bg-gradient-to-b from-pink-400 to-rose-500 px-8 py-5 text-2xl font-extrabold text-white shadow-[0_0_22px_rgba(244,114,182,0.95)] transition-transform hover:scale-105 active:scale-95 animate-pulse"
            >
              <Candy className="h-8 w-8" />
              <Sparkles className="h-5 w-5 text-pink-200" />
              Pegar tudo pra mim
              <Sparkles className="h-5 w-5 text-pink-200" />
            </button>
            <button
              type="button"
              onClick={() => choose('share')}
              className="w-full items-center justify-center rounded-3xl border-2 border-slate-200 bg-white/90 px-8 py-5 text-xl font-bold text-rose-500 shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              Dividir
            </button>
          </div>
        ) : null}

        {/* ------- avanço opcional ------- */}
        {phase === 'immediate' ? (
          <button
            type="button"
            onClick={() => setPhase('consequence')}
            className="rounded-full bg-white/60 px-5 py-2 text-sm font-bold text-slate-500 shadow transition-transform active:scale-95"
          >
            Depois…
          </button>
        ) : null}
        {phase === 'consequence' ? (
          <button
            type="button"
            onClick={() => setPhase('forgiveness')}
            className="rounded-full bg-white/60 px-5 py-2 text-sm font-bold text-slate-500 shadow transition-transform active:scale-95"
          >
            Depois…
          </button>
        ) : null}

        {/* ------- perdão e recomeço ------- */}
        {phase === 'forgiveness' ? (
          <ForgivenessCard
            onForgive={reset}
            onExit={onExit}
            gameId="so-mais-um-pedaco"
            stars={hogged === true ? 1 : 3}
          />
        ) : null}
      </div>
    </GameShell>
  );
}