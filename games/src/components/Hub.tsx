import { useState } from 'react';
import { Crown, Lock, Star, Volume2, VolumeX } from 'lucide-react';
import { games } from '../data/games';
import {
  isFreeMode,
  isUnlocked,
  loadProgress,
  MAX_STARS_PER_GAME,
  setFreeMode,
  totalStars,
} from '../lib/progress';
import { isMuted, setMuted } from '../lib/sound';

interface HubProps {
  onSelectGame: (id: string) => void;
}

/**
 * Tela principal da saga "A Grande Jornada": capítulos em sequência,
 * estrelas por capítulo, barra de progresso, modo livre e som.
 * A ordem dos jogos em src/data/games.ts é a ordem dos capítulos.
 */
export default function Hub({ onSelectGame }: HubProps) {
  const [freeMode, setFree] = useState(isFreeMode());
  const [muted, setSound] = useState(isMuted());
  const [hint, setHint] = useState<string | null>(null);

  const progress = loadProgress();
  const earned = totalStars(progress);
  const maxStars = games.length * MAX_STARS_PER_GAME;
  const journeyDone = earned >= maxStars;

  function toggleFree() {
    const next = !freeMode;
    setFree(next);
    setFreeMode(next);
    setHint(null);
  }

  function toggleMute() {
    const next = !muted;
    setSound(next);
    setMuted(next);
  }

  function open(gameId: string) {
    onSelectGame(gameId);
  }

  function lockedHint(index: number) {
    setHint(`Complete o capítulo ${index} para abrir este! 🔒`);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#150b2e]">
      {/* brilhos de fundo (estilo cabinet de fliperama) */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(0deg,transparent,transparent_34px,#fff_34px,#fff_36px)]" />

      <main className="relative z-10 flex min-h-screen flex-col items-center gap-6 p-6">
        {/* ------- cabeçalho da saga ------- */}
        <header className="text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-yellow-300 uppercase">
            A Grande Jornada
          </p>
          <h1 className="mt-2 bg-gradient-to-r from-yellow-300 via-sky-300 to-emerald-300 bg-clip-text text-5xl font-black italic text-transparent drop-shadow-[0_4px_0_rgba(0,0,0,0.45)] sm:text-6xl">
            Jogos da Lição
          </h1>
          <p className="mt-3 text-lg text-white/80">
            Faz o certo em cada capítulo e caminha até a Luz de Deus! ☀️
          </p>
        </header>

        {/* ------- progresso ------- */}
        <div className="w-full max-w-3xl">
          <div className="mb-1 flex items-center justify-between text-sm font-bold text-white/85">
            <span className="flex items-center gap-1.5">
              {journeyDone ? (
                <>
                  <Crown className="h-5 w-5 text-yellow-300" /> Você chegou à Luz de Deus! 🏆
                </>
              ) : (
                <>
                  <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />{' '}
                  {earned}/{maxStars} estrelas
                </>
              )}
            </span>
            <span>{journeyDone ? '100%' : `${Math.round((earned / maxStars) * 100)}%`}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-black/30">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                journeyDone
                  ? 'bg-gradient-to-r from-yellow-300 to-amber-400 shadow-[0_0_16px_rgba(253,224,71,0.9)]'
                  : 'bg-gradient-to-r from-sky-400 to-cyan-300'
              }`}
              style={{ width: `${Math.max((earned / maxStars) * 100, journeyDone ? 100 : 2)}%` }}
            />
          </div>
        </div>

        {/* ------- controles: modo livre + som ------- */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={toggleFree}
            aria-pressed={freeMode}
            className={`rounded-full px-5 py-2 text-sm font-extrabold shadow transition-transform active:scale-95 ${
              freeMode
                ? 'bg-yellow-300 text-amber-900'
                : 'bg-white/10 text-white/85'
            }`}
          >
            {freeMode ? '✨ Modo livre: ON' : '🔒 Modo sequencial'}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-extrabold text-white/85 shadow transition-transform active:scale-95"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? 'Som: OFF' : 'Som: ON'}
          </button>
        </div>

        {/* ------- aviso de capítulo bloqueado ------- */}
        {hint ? (
          <p
            role="alert"
            className="animate-pop rounded-full bg-white/10 px-6 py-2 text-sm font-bold text-yellow-100 shadow"
          >
            {hint}
          </p>
        ) : null}

        {/* ------- capítulos da jornada ------- */}
        <div className="mt-2 flex w-full max-w-3xl flex-col gap-4">
          {games.map((game, index) => {
            const unlocked = isUnlocked(index, games);
            const st = progress[game.id]?.stars ?? 0;
            const isLastChapter = index === games.length - 1;
            const Icon = game.icon;

            return (
              <button
                key={game.id}
                type="button"
                onClick={() => (unlocked ? open(game.id) : lockedHint(index))}
                aria-label={
                  unlocked ? `Jogar ${game.title}` : `${game.title} (bloqueado)`
                }
                className={`group relative flex w-full items-center gap-4 rounded-3xl border-4 p-5 text-left shadow-[0_10px_0_rgba(0,0,0,0.45)] transition-transform duration-150 active:scale-[0.98] ${
                  unlocked
                    ? `${game.color} border-white/40 hover:scale-[1.02]`
                    : 'border-white/10 bg-slate-800/80 opacity-70'
                }`}
              >
                {/* número do capítulo / cadeado */}
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-lg font-black ${
                    unlocked ? 'bg-black/25 text-white' : 'bg-black/30 text-slate-400'
                  }`}
                >
                  {unlocked ? (
                    String(index + 1).padStart(2, '0')
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </span>

                {/* ícone do jogo */}
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 ${
                    unlocked ? 'border-white/40 bg-white/25' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <Icon
                    className={`h-8 w-8 ${
                      unlocked ? 'text-white drop-shadow' : 'text-slate-500'
                    }`}
                  />
                </span>

                {/* título + sinopse */}
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-lg leading-tight font-extrabold text-white drop-shadow-md">
                    {game.title}
                  </span>
                  <span className="line-clamp-2 text-xs font-medium text-white/85">
                    {game.sinopse}
                  </span>
                  {isLastChapter && unlocked ? (
                    <span className="mt-0.5 flex items-center gap-1 text-xs font-black text-yellow-200">
                      <Crown className="h-4 w-4" /> Capítulo final da jornada
                    </span>
                  ) : null}
                </span>

                {/* estrelas + jogar */}
                <span className="flex shrink-0 flex-col items-center gap-1.5">
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i <= st
                            ? 'fill-yellow-300 text-yellow-300 drop-shadow'
                            : 'text-white/30'
                        }`}
                      />
                    ))}
                  </span>
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-transform group-active:scale-90 ${
                      unlocked ? 'bg-black/30 text-white' : 'bg-black/40 text-slate-300'
                    }`}
                  >
                    {unlocked ? '▶ JOGAR' : '🔒 Bloqueado'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="animate-bounce text-lg font-bold text-cyan-200">
          ▼ toca para começar ▼
        </p>
      </main>
    </div>
  );
}