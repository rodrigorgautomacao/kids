import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Check, Flower2, HeartHandshake, MessageCircle, UserRound } from 'lucide-react';
import GameShell from '../GameShell';
import ForgivenessCard from '../ForgivenessCard';

interface GameProps {
  onExit: () => void;
}

type GamePhase = 'choice' | 'immediate' | 'consequence' | 'forgiveness';

const IMMEDIATE_MS = 2800;
const CONSEQUENCE_MS = 4200;

export default function GameMentirinhaQueCresce({ onExit }: GameProps) {
  const [phase, setPhase] = useState<GamePhase>('choice');
  const [lied, setLied] = useState<boolean | null>(null); // true = mentiu, false = verdade

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

  function choose(opt: 'lie' | 'truth') {
    setLied(opt === 'lie');
    setPhase('immediate');
  }

  function reset() {
    setLied(null);
    setPhase('choice');
  }

  const cracked = lied === true && phase !== 'choice' && phase !== 'immediate';
  const hugged = lied === false && phase !== 'choice' && phase !== 'immediate';

  return (
    <GameShell
      title="A Mentirinha que Cresce"
      subtitle="O que dizer sobre o vaso quebrado?"
      onExit={onExit}
      bg="bg-gradient-to-b from-slate-100 via-indigo-50 to-indigo-100"
      titleClass="text-indigo-700"
    >
      {phase === 'immediate' && lied === true ? (
        <Confetti recycle={false} numberOfPieces={70} gravity={0.3} />
      ) : null}

      <div aria-live="polite" className="sr-only">
        {phase === 'immediate' && lied === true
          ? 'Um alívio por um instante'
          : phase === 'immediate' && lied === false
            ? 'O adulto ficou sério por um instante'
            : phase === 'consequence' && lied === true
              ? 'A mentira começou a crescer e pesar'
              : phase === 'consequence' && lied === false
                ? 'A verdade trouxe um abraço'
                : ''}
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 pb-8">
        {/* ------- cena ------- */}
        <div className="relative flex h-48 w-full max-w-md items-end justify-center">
          {/* chão */}
          <div className="absolute bottom-0 h-6 w-3/4 rounded-full bg-indigo-900/15" />

          {/* vaso quebrado */}
          <div className="absolute bottom-6 left-[24%] flex flex-col items-center">
            <div className="relative">
              <Flower2
                className={`h-20 w-20 transition-all duration-700 ${
                  cracked ? 'rotate-6 scale-90 opacity-80 grayscale-[40%]' : 'text-orange-500'
                }`}
              />
              {/* rachadura que cresce */}
              {cracked ? (
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full transition-transform duration-[2500ms]"
                  style={{ transform: 'scale(1)', transformOrigin: '50% 20%' }}
                >
                  <path
                    d="M50 8 L46 24 L54 38 L44 52 L52 66 L45 84"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </div>
            {/* caco caído */}
            <div
              className={`mt-1 h-4 w-5 rounded-sm border-2 border-orange-300 bg-orange-200 transition-all duration-700 ${
                phase !== 'choice' ? 'rotate-12' : '-rotate-8'
              }`}
            />
          </div>

          {/* adulto */}
          <div className="absolute bottom-1 right-[10%] flex flex-col items-center">
            <div className="relative">
              <UserRound
                className={`h-16 w-16 transition-colors duration-700 ${
                  hugged ? 'text-amber-500' : 'text-slate-500'
                }`}
              />
              <span className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow">
                <MessageCircle className="h-5 w-5 text-slate-500" />
                <span className="absolute text-[9px] font-black text-white">?</span>
              </span>
            </div>
            <span className="mt-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
              O que aconteceu?
            </span>
          </div>

          {/* você */}
          <div className="absolute bottom-1 left-[6%] flex flex-col items-center">
            <UserRound
              className={`h-16 w-16 transition-colors duration-700 ${
                hugged ? 'text-emerald-500' : 'text-indigo-600'
              }`}
            />
            <span className="mt-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm">
              Você
            </span>
          </div>

          {/* selo verde no "não fui eu" (alívio imediato) */}
          {phase === 'immediate' && lied === true ? (
            <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 animate-pop">
              <span className="flex items-center gap-1 rounded-full bg-emerald-400 px-4 py-1.5 text-lg font-black text-emerald-950 shadow-[0_0_18px_rgba(16,185,129,0.9)]">
                <Check className="h-5 w-5" strokeWidth={4} /> Ufa…
              </span>
            </div>
          ) : null}

          {/* expressão séria na verdade */}
          {phase === 'immediate' && lied === false ? (
            <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 animate-pop rounded-full bg-white/90 px-4 py-1.5 text-base font-bold text-slate-500 shadow">
              😐
            </span>
          ) : null}
        </div>

        {/* ------- mensagem ------- */}
        <p className="max-w-md rounded-3xl bg-white/80 px-6 py-3 text-center text-lg font-bold text-slate-700 shadow-md">
          {phase === 'choice' && 'O adulto pergunta: quem quebrou o vaso?'}
          {phase === 'immediate' && lied === true && 'Ufa… por um instante, pareceu resolvido.'}
          {phase === 'immediate' && lied === false && 'O adulto só ficou sério por um instante. Sem castigo.'}
          {phase === 'consequence' && lied === true && (
            <>
              A mentira cresceu e começou a pesar…{' '}
              <span className="block pt-1 text-base font-semibold text-slate-500">
                A rachadura no vaso só aumentou.
              </span>
            </>
          )}
          {phase === 'consequence' && lied === false && (
            <>
              A verdade trouxe um abraço! 💛{' '}
              <span className="block pt-1 text-base font-semibold text-emerald-600">
                A cena ficou mais clara e leve.
              </span>
            </>
          )}
          {phase === 'forgiveness' && 'Todo dia é uma chance de recomeçar.'}
        </p>

        {/* abraço (consequência da verdade) */}
        {phase === 'consequence' && lied === false ? (
          <div className="animate-pop flex items-center justify-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <UserRound className="h-8 w-8 text-amber-500" />
            </span>
            <HeartHandshake className="h-12 w-12 text-rose-400 drop-shadow" />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <UserRound className="h-8 w-8 text-emerald-500" />
            </span>
          </div>
        ) : null}

        {/* sombra pesando (consequência da mentira) */}
        {cracked ? (
          <div className="pointer-events-none absolute inset-0 bg-slate-800/15 transition-opacity duration-[2000ms]" />
        ) : null}

        {/* ------- escolha ------- */}
        {phase === 'choice' ? (
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => choose('lie')}
              className="flex w-full items-center justify-center gap-3 rounded-3xl border-4 border-emerald-300 bg-gradient-to-b from-emerald-300 to-emerald-500 px-8 py-5 text-2xl font-extrabold text-emerald-950 shadow-[0_0_22px_rgba(52,211,153,0.9)] transition-transform hover:scale-105 active:scale-95 animate-pulse"
            >
              <Check className="h-8 w-8" strokeWidth={3.5} /> Dizer que não fui eu
            </button>
            <button
              type="button"
              onClick={() => choose('truth')}
              className="w-full items-center justify-center rounded-3xl border-2 border-slate-200 bg-white/90 px-8 py-5 text-xl font-bold text-indigo-600 shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              Contar a verdade
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
          <ForgivenessCard onForgive={reset} onExit={onExit} />
        ) : null}
      </div>
    </GameShell>
  );
}