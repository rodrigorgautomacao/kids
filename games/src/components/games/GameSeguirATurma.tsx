import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { ChevronsRight, Frown, Smile, Sparkles, UserRound, Users } from 'lucide-react';
import GameShell from '../GameShell';
import ForgivenessCard from '../ForgivenessCard';

interface GameProps {
  onExit: () => void;
}

type GamePhase = 'choice' | 'immediate' | 'consequence' | 'forgiveness';

const IMMEDIATE_MS = 2800;
const CONSEQUENCE_MS = 4200;

export default function GameSeguirATurma({ onExit }: GameProps) {
  const [phase, setPhase] = useState<GamePhase>('choice');
  const [followed, setFollowed] = useState<boolean | null>(null); // true = foi com a turma

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

  function choose(opt: 'follow' | 'stay') {
    setFollowed(opt === 'follow');
    setPhase('immediate');
  }

  function reset() {
    setFollowed(null);
    setPhase('choice');
  }

  const messy = followed === true && phase !== 'choice' && phase !== 'immediate';
  const peaceful = followed === false && phase !== 'choice' && phase !== 'immediate';

  return (
    <GameShell
      title="Seguir a Turma"
      subtitle="A turma quer ir para um lado…"
      onExit={onExit}
      bg="bg-gradient-to-b from-violet-100 via-fuchsia-50 to-indigo-100"
      titleClass="text-violet-700"
    >
      {phase === 'immediate' && followed === true ? (
        <Confetti recycle={false} numberOfPieces={70} gravity={0.3} />
      ) : null}

      <div aria-live="polite" className="sr-only">
        {phase === 'immediate' && followed === true
          ? 'Que empolgação!'
          : phase === 'immediate' && followed === false
            ? 'Você decidiu ficar com o colega sozinho'
            : phase === 'consequence' && followed === true
              ? 'A brincadeira virou bagunça'
              : phase === 'consequence' && followed === false
                ? 'O coleguinha sorriu'
                : ''}
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 pb-8">
        {/* ------- cena ------- */}
        <div className="relative flex h-48 w-full max-w-md items-end justify-center">
          <div className="absolute bottom-0 h-6 w-3/4 rounded-full bg-indigo-900/15" />

          {/* coleguinha excluído (à parte) */}
          <div
            className={`absolute bottom-1 left-[4%] flex flex-col items-center transition-all duration-1000 ${
              peaceful
                ? 'translate-x-3 scale-110 opacity-100'
                : messy
                  ? 'scale-90 opacity-60'
                  : 'opacity-80'
            }`}
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow ${
                peaceful
                  ? 'bg-amber-100 animate-bounce'
                  : messy
                    ? 'bg-slate-200'
                    : 'bg-slate-100'
              }`}
            >
              {peaceful ? (
                <Smile className="h-8 w-8 text-amber-500" />
              ) : messy ? (
                <Frown className="h-8 w-8 text-slate-400" />
              ) : (
                <UserRound className="h-8 w-8 text-slate-400" />
              )}
            </span>
            <span className="mt-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
              sozinho
            </span>
          </div>

          {/* a turma (grupo) */}
          <div
            className={`absolute bottom-10 right-[2%] flex flex-col items-center transition-all duration-1000 ${
              messy ? 'rotate-6 opacity-80' : 'rotate-0'
            }`}
          >
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg ${
                messy ? 'bg-slate-200' : 'bg-fuchsia-200'
              }`}
            >
              {messy ? (
                <Frown className="h-9 w-9 text-slate-500" />
              ) : (
                <Users className="h-9 w-9 text-fuchsia-500" />
              )}
            </span>
            <span className="mt-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-fuchsia-600 shadow-sm">
              a turma
            </span>
            {/* setinhas piscando puxando para o "caminho" */}
            {!messy ? (
              <span className="mt-1 flex items-center text-fuchsia-400">
                <ChevronsRight className="h-6 w-6 animate-pulse" />
                <ChevronsRight className="-ml-3 h-6 w-6 animate-pulse" style={{ animationDelay: '0.25s' }} />
                <ChevronsRight className="-ml-3 h-6 w-6 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </span>
            ) : (
              <span className="mt-1 flex -rotate-12 items-center gap-1 text-slate-400">
                <ChevronsRight className="h-5 w-5" />
                <ChevronsRight className="h-5 w-5" />
                <ChevronsRight className="h-5 w-5 rotate-90" />
              </span>
            )}
          </div>

          {/* você */}
          <div className="absolute bottom-1 left-[38%] flex flex-col items-center">
            <UserRound
              className={`h-14 w-14 transition-colors duration-700 ${
                messy ? 'rotate-6 text-slate-500' : peaceful ? 'text-emerald-500' : 'text-violet-600'
              }`}
            />
            <span className="mt-1 rounded-full bg-white/80 px-3 py-0.5 text-xs font-bold text-violet-700 shadow-sm">
              Você
            </span>
          </div>

          {/* empolgação (imediato de "ir com a turma") */}
          {phase === 'immediate' && followed === true ? (
            <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 animate-pop">
              <span className="flex items-center gap-1 rounded-full bg-fuchsia-400 px-4 py-1.5 text-lg font-black text-white shadow-[0_0_18px_rgba(232,121,249,0.95)]">
                <Sparkles className="h-5 w-5" /> Que empolgação!
              </span>
            </div>
          ) : null}

          {phase === 'immediate' && followed === false ? (
            <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 animate-pop">
              <span className="rounded-full bg-white/90 px-4 py-1.5 text-base font-bold text-slate-500 shadow-lg">
                Você ficou por perto
              </span>
            </div>
          ) : null}
        </div>

        {/* ------- mensagem ------- */}
        <p className="max-w-md rounded-3xl bg-white/80 px-6 py-3 text-center text-lg font-bold text-slate-700 shadow-md">
          {phase === 'choice' && 'A turma aponta para o caminho, animada! O coleguinha fica para trás…'}
          {phase === 'immediate' && followed === true && 'Que divertido seguir junto…'}
          {phase === 'immediate' && followed === false && 'Sem brilho e sem barulho: você decidiu ficar.'}
          {phase === 'consequence' && followed === true && (
            <>
              A brincadeira virou bagunça…{' '}
              <span className="block pt-1 text-base font-semibold text-slate-500">
                Até a turma ficou com arrependimento.
              </span>
            </>
          )}
          {phase === 'consequence' && followed === false && (
            <>
              O coleguinha sorriu! 💛{' '}
              <span className="block pt-1 text-base font-semibold text-emerald-600">
                A turma percebeu que brincar junto é melhor.
              </span>
            </>
          )}
          {phase === 'forgiveness' && 'Cada amigo importa.'}
        </p>

        {/* ------- escolha ------- */}
        {phase === 'choice' ? (
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => choose('follow')}
              className="flex w-full items-center justify-center gap-3 rounded-3xl border-4 border-fuchsia-300 bg-gradient-to-b from-fuchsia-500 to-purple-600 px-8 py-5 text-2xl font-extrabold text-white shadow-[0_0_22px_rgba(217,70,239,0.95)] transition-transform hover:scale-105 active:scale-95 animate-pulse"
            >
              <ChevronsRight className="h-8 w-8" />
              <Sparkles className="h-5 w-5 text-fuchsia-200" />
              Ir com a turma
              <Sparkles className="h-5 w-5 text-fuchsia-200" />
            </button>
            <button
              type="button"
              onClick={() => choose('stay')}
              className="w-full items-center justify-center rounded-3xl border-2 border-slate-200 bg-white/90 px-8 py-5 text-xl font-bold text-violet-600 shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              Ficar com o coleguinha
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