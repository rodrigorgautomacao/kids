import { useEffect, useState } from 'react';
import { Crown, Lock, Mic, MicOff, Music, Star, Volume2, VolumeX } from 'lucide-react';
import { games } from '../data/games';
import {
  chapterLevelsDone,
  chapterStars,
  isChapterUnlocked,
  isFreeMode,
  loadLevels,
  MAX_LEVELS_PER_GAME,
  setFreeMode,
  totalLevelsDone,
  totalStars,
} from '../lib/progress';
import {
  isMusicMuted,
  isSfxMuted,
  isVoiceMuted,
  setMusicMuted,
  setSfxMuted,
  setVoiceMuted,
  subscribeSoundPrefs,
  sfx,
  voice,
} from '../lib/audio';
import InstallHint from './InstallHint';
import { isSmallKidsMode, setSmallKidsMode } from '../lib/prefs';

interface HubProps {
  onSelectGame: (id: string) => void;
}

/**
 * Tela principal da saga "A Estrada da Luz": cada resposta certa aproxima
 * o jogador de Deus; errar escurece o caminho e recua um passo.
 * A ordem dos jogos em src/data/games.ts é a ordem dos capítulos.
 */
export default function Hub({ onSelectGame }: HubProps) {
  const [freeMode, setFree] = useState(isFreeMode());
  const [sfxOn, setSfxOn] = useState(() => !isSfxMuted());
  const [musicOn, setMusicOn] = useState(() => !isMusicMuted());
  const [voiceOn, setVoiceOn] = useState(() => !isVoiceMuted());
  const [smallKids, setSmallKids] = useState(isSmallKidsMode);
  const [hint, setHint] = useState<string | null>(null);

  // Mantém os três botões em sincronia com o que estiver salvo (ex.: mudo
  // acionado dentro de um jogo).
  useEffect(
    () =>
      subscribeSoundPrefs(() => {
        setSfxOn(!isSfxMuted());
        setMusicOn(!isMusicMuted());
        setVoiceOn(!isVoiceMuted());
      }),
    [],
  );

  const progress = loadLevels();
  const totalGameLevels = (g: { id: string; totalLevels?: number }) =>
    g.totalLevels ?? MAX_LEVELS_PER_GAME;
  const doneLevels = totalLevelsDone(
    progress,
    games.map((g) => g.id),
    totalGameLevels,
  );
  const maxLevels = games.reduce((acc, g) => acc + totalGameLevels(g), 0);
  const journeyDone = doneLevels >= maxLevels;

  function toggleFree() {
    const next = !freeMode;
    setFree(next);
    setFreeMode(next);
    setHint(null);
  }

  function toggleSfx() {
    const next = !sfxOn;
    setSfxOn(next);
    setSfxMuted(!next);
    if (next) sfx.pop();
  }

  function toggleMusic() {
    const next = !musicOn;
    setMusicOn(next);
    setMusicMuted(!next);
  }

  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    setVoiceMuted(!next);
    if (next) voice.speak('Narração ligada!');
    else voice.stopSpeaking();
  }

  /**
   * Modo pequeninos (pré-leitores): 3 opções grandes no lugar de 5 e narração
   * sempre ligada. É a diferença entre jogar e não jogar para quem tem 6 anos.
   */
  function toggleSmallKids() {
    const next = !smallKids;
    setSmallKids(next);
    setSmallKidsMode(next);
    if (next) {
      setVoiceMuted(false);
      setVoiceOn(true);
      voice.speak('Modo pequeninos ligado! Agora tem menos opções e voz em tudo.');
    } else {
      voice.speak('Modo pequeninos desligado.');
    }
  }

  function lockedHint(index: number) {
    setHint(`Complete pelo menos 1 nível do capítulo ${index} para abrir este! 🔒`);
  }

  return (
    <div className="safe-area-pad relative min-h-screen-safe w-full overflow-hidden bg-[#150b2e]">
      {/* brilhos de fundo (estilo cabinet de fliperama) */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(0deg,transparent,transparent_34px,#fff_34px,#fff_36px)]" />

      <main className="relative z-10 flex min-h-screen-safe flex-col items-center gap-6 p-6">
        {/* ------- cabeçalho da saga ------- */}
        <header className="text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-yellow-300 uppercase">
            A Grande Jornada
          </p>
          <h1 className="mt-2 bg-gradient-to-r from-yellow-300 via-sky-300 to-emerald-300 bg-clip-text text-5xl font-black italic text-transparent drop-shadow-[0_4px_0_rgba(0,0,0,0.45)] sm:text-6xl">
            Jogos da Lição
          </h1>
          <p className="mt-3 text-lg text-white/80">
            {journeyDone
              ? 'Você venceu todos os níveis da jornada! 🏆'
              : 'Responda certo e caminhe cada vez mais perto de Deus! ☀️'}
          </p>
        </header>

        {/* ------- progresso ------- */}
        <div className="w-full max-w-3xl">
          <div className="mb-1 flex items-center justify-between text-sm font-bold text-white/85">
            <span className="flex items-center gap-1.5">
              {journeyDone ? (
                <>
                  <Crown className="h-5 w-5 text-yellow-300" /> Jornada completa!
                </>
              ) : (
                <>
                  <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />{' '}
                  {doneLevels}/{maxLevels} níveis
                </>
              )}
            </span>
            <span>
              {journeyDone
                ? '100%'
                : `${Math.round((doneLevels / maxLevels) * 100)}%`}{' '}
              · {totalStars(progress)} ⭐
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-black/30">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                journeyDone
                  ? 'bg-gradient-to-r from-yellow-300 to-amber-400 shadow-[0_0_16px_rgba(253,224,71,0.9)]'
                  : 'bg-gradient-to-r from-sky-400 to-cyan-300'
              }`}
              style={{
                width: `${Math.max((doneLevels / maxLevels) * 100, journeyDone ? 100 : 2)}%`,
              }}
            />
          </div>
        </div>

        {/* ------- controles: modo livre + som ------- */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={toggleFree}
            aria-pressed={freeMode}
            className={`ui-press rounded-full px-5 py-2 text-sm font-extrabold shadow ${
              freeMode ? 'bg-yellow-300 text-amber-900' : 'bg-white/10 text-white/85'
            }`}
          >
            {freeMode ? '✨ Modo livre: ON' : '🔒 Modo sequencial'}
          </button>
          <button
            type="button"
            onClick={toggleSmallKids}
            aria-pressed={smallKids}
            aria-label={`Modo pequeninos ${smallKids ? 'ligado' : 'desligado'}`}
            className={`ui-press rounded-full px-5 py-2 text-sm font-extrabold shadow ${
              smallKids ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-white/85'
            }`}
          >
            🧒 Modo pequeninos: {smallKids ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={toggleSfx}
            aria-pressed={sfxOn}
            aria-label={`Efeitos sonoros ${sfxOn ? 'ligados' : 'desligados'}`}
            className={`ui-press flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold shadow ${
              sfxOn ? 'bg-white/15 text-white' : 'bg-white/5 text-white/50'
            }`}
          >
            {sfxOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Efeitos: {sfxOn ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={toggleMusic}
            aria-pressed={musicOn}
            aria-label={`Música ${musicOn ? 'ligada' : 'desligada'}`}
            className={`ui-press flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold shadow ${
              musicOn ? 'bg-white/15 text-white' : 'bg-white/5 text-white/50'
            }`}
          >
            <Music className="h-4 w-4" />
            Música: {musicOn ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={toggleVoice}
            aria-pressed={voiceOn}
            aria-label={`Narração ${voiceOn ? 'ligada' : 'desligada'}`}
            className={`ui-press flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold shadow ${
              voiceOn ? 'bg-white/15 text-white' : 'bg-white/5 text-white/50'
            }`}
          >
            {voiceOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            Narração: {voiceOn ? 'ON' : 'OFF'}
          </button>
        </div>

        {smallKids ? (
          <p className="animate-pop max-w-xl rounded-3xl bg-emerald-400/15 px-6 py-2 text-center text-sm font-bold text-emerald-100">
            🧒 Modo pequeninos: 3 opções grandes e voz em tudo. Feito para quem ainda não lê!
          </p>
        ) : null}

        {/* ------- convite para instalar (PWA) ------- */}
        <InstallHint />

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
            const unlocked = isChapterUnlocked(index, games, progress);
            const totalLevels = totalGameLevels(game);
            const levelsDone = chapterLevelsDone(progress, game.id);
            const stars = chapterStars(progress, game.id);
            const complete = levelsDone >= totalLevels;
            const isLastChapter = index === games.length - 1;
            const Icon = game.icon;

            return (
              <button
                key={game.id}
                type="button"
                onClick={() => (unlocked ? onSelectGame(game.id) : lockedHint(index))}
                aria-label={unlocked ? `Jogar ${game.title}` : `${game.title} (bloqueado)`}
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
                  {unlocked ? String(index + 1).padStart(2, '0') : <Lock className="h-5 w-5" />}
                </span>

                {/* ícone do jogo */}
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 ${
                    unlocked ? 'border-white/40 bg-white/25' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <Icon
                    className={`h-8 w-8 ${unlocked ? 'text-white drop-shadow' : 'text-slate-500'}`}
                  />
                </span>

                {/* título + sinopse + progresso */}
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="truncate text-lg leading-tight font-extrabold text-white drop-shadow-md">
                    {game.title}
                  </span>
                  <span className="line-clamp-2 text-xs font-medium text-white/85">
                    {game.sinopse}
                  </span>

                  {unlocked ? (
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center justify-between gap-2 text-xs font-black text-white">
                        <span>
                          {levelsDone}/{totalLevels} níveis
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
                          {stars}/{totalLevels * 3}
                        </span>
                      </span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-black/25">
                        <span
                          className={`block h-full rounded-full transition-all duration-500 ${
                            complete
                              ? 'bg-yellow-300'
                              : 'bg-white/70'
                          }`}
                          style={{ width: `${(levelsDone / totalLevels) * 100}%` }}
                        />
                      </span>
                    </span>
                  ) : null}

                  {isLastChapter && unlocked && complete ? (
                    <span className="mt-0.5 flex items-center gap-1 text-xs font-black text-yellow-200">
                      <Crown className="h-4 w-4" /> Jornada encerrada com vitória!
                    </span>
                  ) : null}
                </span>

                {/* botão */}
                <span
                  className={`flex shrink-0 flex-col items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition-transform group-active:scale-90 ${
                    unlocked
                      ? complete
                        ? 'bg-yellow-300 text-amber-900'
                        : 'bg-black/30 text-white'
                      : 'bg-black/40 text-slate-300'
                  }`}
                >
                  {!unlocked ? (
                    '🔒 Bloqueado'
                  ) : complete ? (
                    '🏆 Vencido'
                  ) : levelsDone > 0 ? (
                    '▶ CONTINUAR'
                  ) : (
                    '▶ COMEÇAR'
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <p className="animate-bounce text-lg font-bold text-cyan-200">▼ toca para começar ▼</p>
      </main>
    </div>
  );
}