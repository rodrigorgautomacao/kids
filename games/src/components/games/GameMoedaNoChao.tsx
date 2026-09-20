import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Coins, Frown, Smile, Sparkles, UserRound } from 'lucide-react';
import GameShell from '../GameShell';
import ForgivenessCard from '../ForgivenessCard';

interface GameProps {
  onExit: () => void;
}

type GamePhase = 'choice' | 'immediate' | 'consequence' | 'forgiveness';

const IMMEDIATE_MS = 2800;
const CONSEQUENCE_MS = 4200;

export default function GameMoedaNoChao({ onExit }: GameProps) {
  const [phase, setPhase] = useState<GamePhase>('choice');
  const [kept, setKept] = useState<boolean | null>(null); // true = guardou, false = devolveu

  // avanço automático das fases (com botão "Depois…" de alternativa)
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

  function choose(opt: 'keep' | 'return') {
    setKept(opt === 'keep');
    setPhase('immediate');
  }

  function reset() {
    setKept(null);
    setPhase('choice');
  }

  const ownerSad = kept === true && phase !== 'choice' && phase !== 'immediate';
  const ownerHappy = kept === false && phase !== 'choice' && phase !== 'immediate';

  return (
    <GameShell
      title="A Moeda no Chão"
      subtitle="O que fazer com a moeda que você achou?"
      onExit={onExit}
      bg="bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100"
      titleClass="text-sky-700"
    >
      {phase === 'immediate' && kept === true ? (
        <Confetti recycle={false} numberOfPieces={90} gravity={0.3} />
      ) : null}

      <div aria-live="polite" className="sr-only">
        {phase === 'immediate' && kept === true
          ? 'A moeda brilhou para você'
          : phase === 'immediate' && kept === false
            ? 'Você devolveu com um sorriso'
            : phase === 'consequence' && kept === true
              ? 'O dono ficou triste e desconfiado'
              : phase === 'consequence' && kept === false
                ? 'O dono convidou você a brincar'
                : ''}
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 pb-8">
        {/* ------- cena ------- */}
        <div className="relative flex h-44 w-full max-w-md items-end justify-center">
          {/* chão */}
          <div className="absolute bottom-0 h-6 w-3/4 rounded-full bg-sky-900/15" />

          {/* moeda caída (sumiu quando devolvida) */}
          <div
            className={`absolute bottom-8 left-[30%] transition-all duration-700 ${
              kept === false && phase !== 'choice'
                ? 'scale-0 opacity-0'
                : 'scale-100 opacity-100'
            }`}
          >
            <Coins className="h-16 w-16 rotate-[-18deg] text-yellow-500 drop-shadow-lg" />
            <Sparkles className="absolute -top-3 -right-3 h-5 w-5 text-yellow-400 animate-pulse" />
          </div>

          {/* dono */}
          <div
            className={`absolute bottom-1 right-[8%] flex flex-col items-center transition-all duration-700 ${
              ownerSad ? 'scale-95 opacity-80' : ownerHappy ? 'scale-105' : 'scale-100'
            }`}
          >
            <div className="relative">
              <UserRound
                className={`h-16 w-16 transition-colors duration-700 ${
                  ownerSad ? 'text-slate-400' : ownerHappy ? 'text-emerald-500' : 'text-sky-500'
                }`}
              />
              <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow">
                {ownerSad ? (
                  <Frown className="h-4 w-4 text-slate-500" />
                ) : ownerHappy ? (
                  <Smile className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Smile className="h-4 w-4 text-sky-400" />
                )}
              </span>
            </div>
            <span className="mt-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-sky-700 shadow-sm">
              O dono
            </span>
          </div>

          {/* você (jogador) */}
          <div className="absolute bottom-1 left-[8%] flex flex-col items-center">
            <div className="relative">
              <UserRound
                className={`h-16 w-16 text-amber-600 transition-transform duration-700 ${
                  phase === 'immediate' && kept === true ? 'scale-110' : ''
                }`}
              />
              <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow">
                {phase === 'immediate' && kept === false ? (
                  <Smile className="h-4 w-4 text-amber-500" />
                ) : kept === false && phase !== 'choice' ? (
                  <Smile className="h-4 w-4 text-amber-500" />
                ) : (
                  <Smile className="h-4 w-4 text-slate-400" />
                )}
              </span>
            </div>
            <span className="mt-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-amber-700 shadow-sm">
              Você
            </span>
          </div>

          {/* contador de moedas (recompensa vistosa imediata) */}
          {phase === 'immediate' && kept === true ? (
            <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 animate-pop">
              <span className="flex items-center gap-1 rounded-full bg-yellow-400 px-4 py-1.5 text-lg font-black text-yellow-950 shadow-lg">
                <Coins className="h-5 w-5" /> +1
              </span>
            </div>
          ) : null}

          {phase === 'immediate' && kept === false ? (
            <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 animate-pop">
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-4 py-1.5 text-base font-bold text-emerald-600 shadow-lg">
                <Smile className="h-5 w-5" /> Devolvido!
              </span>
            </div>
          ) : null}
        </div>

        {/* ------- mensagem ------- */}
        <p className="max-w-md rounded-3xl bg-white/80 px-6 py-3 text-center text-lg font-bold text-slate-700 shadow-md">
          {phase === 'choice' && 'A moeda caiu no chão. O que você faz?'}
          {phase === 'immediate' && kept === true && 'Brilha, brilha… a moeda é sua!'}
          {phase === 'immediate' && kept === false && 'Um sorriso simples, sem brilho…'}
          {phase === 'consequence' && kept === true && (
            <>
              Guardar deixou o dono triste e desconfiado…{' '}
              <span className="block pt-1 text-base font-semibold text-slate-500">
                A moeda sumiu do seu bolso.
              </span>
            </>
          )}
          {phase === 'consequence' && kept === false && (
            <>
              O dono sorriu e convidou você a brincar! 🎈{' '}
              <span className="block pt-1 text-base font-semibold text-emerald-600">
                O pátio ficou cheio de amigos.
              </span>
            </>
          )}
          {phase === 'forgiveness' &&
            'Cada escolha nova é uma nova chance. Deus guarda a recompensa de quem faz o certo! ✨'}
        </p>

        {/* amigos chegando (consequência da escolha certa) */}
        {phase === 'consequence' && kept === false ? (
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="animate-pop"
                style={{ animationDelay: `${i * 350}ms` }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 shadow">
                  <Smile className="h-7 w-7 text-emerald-500" />
                </span>
              </span>
            ))}
          </div>
        ) : null}

        {/* ------- escolha ------- */}
        {phase === 'choice' ? (
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => choose('keep')}
              className="flex w-full items-center justify-center gap-3 rounded-3xl border-4 border-yellow-300 bg-gradient-to-b from-yellow-300 to-amber-500 px-8 py-5 text-2xl font-extrabold text-yellow-950 shadow-[0_0_22px_rgba(250,204,21,0.9)] transition-transform hover:scale-105 active:scale-95 animate-pulse"
            >
              <Coins className="h-8 w-8" />
              <Sparkles className="h-5 w-5 text-yellow-200" />
              Guardar pra mim
              <Sparkles className="h-5 w-5 text-yellow-200" />
            </button>
            <button
              type="button"
              onClick={() => choose('return')}
              className="w-full items-center justify-center rounded-3xl border-2 border-slate-200 bg-white/90 px-8 py-5 text-xl font-bold text-emerald-600 shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              Devolver ao dono
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
            gameId="moeda-no-chao"
            stars={kept === true ? 1 : 3}
          />
        ) : null}
      </div>
    </GameShell>
  );
}