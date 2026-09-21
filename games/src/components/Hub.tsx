import { useEffect, useState } from 'react';
import { games, FAIXAS, TIPOS, MAX_LEVELS_PER_GAME, type GameDefinition, type Tipo } from '../data/games';
import { chapterLevelsDone, chapterStars, loadLevels, totalStars, type ProgressMap } from '../lib/progress';
import {
  isMusicMuted,
  isSfxMuted,
  setMusicMuted,
  setSfxMuted,
  setVoiceMuted,
  subscribeSoundPrefs,
  sfx,
} from '../lib/audio';
import { isIOS, isStandalone } from '../lib/device';
import InstallHint from './InstallHint';
import { isSmallKidsMode, setSmallKidsMode } from '../lib/prefs';
import { StarItem } from './art';
import { SCENE_COUNT } from '../data/scenes';
import { loadStickers, subscribeStickers } from '../lib/stickers';
import { getLang, isEn, setLang, t, type TKey } from '../lib/i18n';
import CollectionBook from './CollectionBook';

interface HubProps {
  onSelectGame: (id: string) => void;
  onLogout?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const FILTROS: { id: 'todos' | Tipo; tKey: TKey }[] = [
  { id: 'todos', tKey: 'filtro.todos' },
  { id: 'at', tKey: 'filtro.at' },
  { id: 'nt', tKey: 'filtro.nt' },
  { id: 'at-nt', tKey: 'filtro.at-nt' },
];

// ─── Ícones inline (sem lucide, para manter o bundle pequeno) ──────────
const SoundOnIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const SoundOffIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>;
const MusicOnIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const MusicOffIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const SmallKidsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;

// ─── Cards ──────────────────────────────────────────────────────────────
function GameCard({
  game,
  progress,
  onPlay,
}: {
  game: GameDefinition;
  progress: ProgressMap;
  onPlay: () => void;
}) {
  const Icon = game.icon;
  const tipo = TIPOS.find((t) => t.id === game.tipo);
  const total = game.totalLevels ?? MAX_LEVELS_PER_GAME;
  const stars = chapterStars(progress, game.id);
  const done = chapterLevelsDone(progress, game.id);

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Jogar ${game.title}`}
      className="ui-press flex w-full items-center gap-3 rounded-3xl border-2 border-slate-100 bg-white p-4 text-left shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${game.color}`}>
        <Icon size={48} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-lg leading-tight font-black text-slate-800">{game.title}</span>
        <span className="truncate text-xs font-bold text-slate-500">{game.subtitle}</span>
        <span className="flex flex-wrap items-center gap-1.5">
          {tipo ? (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${tipo.badge} ${tipo.text}`}>
              {tipo.emoji} {tipo.nome}
            </span>
          ) : null}
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-700">
            <StarItem size={12} /> {stars}/{total * 3}
          </span>
        </span>
      </span>
      <span className="ui-press shrink-0 rounded-full bg-indigo-500 px-4 py-2 text-sm font-black text-white shadow-md">
        {done > 0 ? t('hub.continuar') : t('hub.jogar')}
      </span>
    </button>
  );
}

function SoonCard({ game }: { game: GameDefinition }) {
  const Icon = game.icon;
  const tipo = TIPOS.find((t) => t.id === game.tipo);

  return (
    <div className="flex w-full select-none items-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-4 opacity-90">
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl opacity-60 ${game.color}`}>
        <Icon size={48} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-base leading-tight font-black text-slate-500">{game.title}</span>
        <span className="text-xs font-bold text-slate-400">{game.emBreveMotivo}</span>
        {tipo ? (
          <span className={`self-start rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${tipo.badge} ${tipo.text}`}>
            {tipo.emoji} {tipo.nome}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-black text-slate-500">
        {t('hub.em-breve')} 🔨
      </span>
    </div>
  );
}

export default function Hub({ onSelectGame, onLogout }: HubProps) {
  const [sfxOn, setSfxOn] = useState(() => !isSfxMuted());
  const [musicOn, setMusicOn] = useState(() => !isMusicMuted());
  const [smallKids, setSmallKids] = useState(isSmallKidsMode);
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | Tipo>('todos');
  const [gate, setGate] = useState<string | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [stickerCount, setStickerCount] = useState(() => loadStickers().size);
  const [lang, setLangState] = useState<ReturnType<typeof getLang>>(getLang);
  const ios = isIOS();

  // Mantém os botões de som em sincronia com o que estiver salvo.
  useEffect(
    () =>
      subscribeSoundPrefs(() => {
        setSfxOn(!isSfxMuted());
        setMusicOn(!isMusicMuted());
      }),
    [],
  );

  // Contador de figurinhas reage quando a Aventura coleciona uma cena.
  useEffect(() => subscribeStickers(() => setStickerCount(loadStickers().size)), []);

  function toggleLang() {
    const next: 'pt' | 'en' = isEn() ? 'pt' : 'en';
    setLang(next);
    setLangState(next);
    sfx.pop();
  }

  // Acompanha instalabilidade (PWA) nos dois navegadores principais.
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const progress = loadLevels();
  const ready = games.filter((g) => g.status === 'pronto');
  const maxLevels = ready.reduce((acc, g) => acc + (g.totalLevels ?? MAX_LEVELS_PER_GAME), 0);
  const doneLevels = ready.reduce(
    (acc, g) => acc + Math.min(chapterLevelsDone(progress, g.id), g.totalLevels ?? MAX_LEVELS_PER_GAME),
    0,
  );
  const stars = totalStars(progress);
  // Instalação só é obrigatória onde o aparelho realmente oferece instalar.
  const installable = !installed && (Boolean(installPrompt) || ios);

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

  function toggleSmallKids() {
    const next = !smallKids;
    setSmallKids(next);
    setSmallKidsMode(next);
    if (next) {
      // Pré-leitores precisam da voz em tudo: garante a narração ligada.
      setVoiceMuted(false);
      setSfxOn(true);
      setSfxMuted(false);
      sfx.pop();
    }
  }

  /** Jogos só abrem quando instalado — senão, popup de instalação primeiro. */
  function handleSelect(id: string) {
    sfx.pop();
    if (installed || !installable) {
      onSelectGame(id);
      return;
    }
    setGate(id);
  }

  function playAnyway() {
    if (!gate) return;
    sfx.pop();
    setGate(null);
    onSelectGame(gate);
  }

  return (
    <div className="safe-area-pad relative min-h-screen-safe w-full overflow-x-hidden bg-gradient-to-b from-sky-100 via-rose-50 to-amber-100">
      {/* brilhos de fundo */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-yellow-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative z-10">
        {/* ─── barra superior fixa: progresso + toggles ─── */}
        <div className="sticky top-0 z-40 border-b-2 border-slate-100 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-2 text-sm font-black text-amber-900 shadow">
              <StarItem size={16} />
              {stars} ⭐
              <span className="text-amber-400">·</span>
              {doneLevels}/{maxLevels} níveis
            </div>
            <div className="flex items-center gap-1.5">
              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Sair"
                  className="ui-press flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow"
                >
                  🚪
                </button>
              ) : null}
              <button
                type="button"
                onClick={toggleSmallKids}
                aria-pressed={smallKids}
                aria-label={`Modo pequeninos ${smallKids ? 'ligado' : 'desligado'}`}
                className={`ui-press flex h-9 w-9 items-center justify-center rounded-full shadow ${
                  smallKids
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                <SmallKidsIcon />
              </button>
              <button
                type="button"
                onClick={toggleSfx}
                aria-pressed={sfxOn}
                aria-label={`Efeitos sonoros ${sfxOn ? 'ligados' : 'desligados'}`}
                className={`ui-press flex h-9 w-9 items-center justify-center rounded-full shadow ${
                  sfxOn
                    ? 'bg-sky-400 text-sky-950'
                    : 'border border-slate-200 bg-white text-slate-400'
                }`}
              >
                {sfxOn ? <SoundOnIcon /> : <SoundOffIcon />}
              </button>
              <button
                type="button"
                onClick={() => setBookOpen(true)}
                aria-label={`${t('hub.figurinhas')} — ${stickerCount}/${SCENE_COUNT}`}
                className="ui-press relative flex h-9 w-9 items-center justify-center rounded-full bg-violet-400 text-violet-950 shadow"
              >
                💮
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-amber-950 shadow">
                  {stickerCount}
                </span>
              </button>
              <button
                type="button"
                onClick={toggleLang}
                aria-label={`Idioma: ${lang === 'pt' ? 'português' : 'inglês'}`}
                className="ui-press flex h-9 items-center rounded-full border border-slate-200 bg-white px-2 text-xs font-black text-slate-600 shadow"
              >
                {lang === 'pt' ? 'PT' : 'EN'}
              </button>
              <button
                type="button"
                onClick={toggleMusic}
                aria-pressed={musicOn}
                aria-label={`Música ${musicOn ? 'ligada' : 'desligada'}`}
                className={`ui-press flex h-9 w-9 items-center justify-center rounded-full shadow ${
                  musicOn
                    ? 'bg-rose-400 text-rose-950'
                    : 'border border-slate-200 bg-white text-slate-400'
                }`}
              >
                {musicOn ? <MusicOnIcon /> : <MusicOffIcon />}
              </button>
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-3xl px-4">
          {/* ─── herói ─── */}
          <header className="pt-8 text-center">
            <div className="flex items-center justify-center gap-4 text-6xl">
              <span className="inline-block animate-hero-bob">🌱</span>
              <span className="inline-block animate-hero-bob" style={{ animationDelay: '180ms' }}>
                🧭
              </span>
              <span className="inline-block animate-hero-bob" style={{ animationDelay: '360ms' }}>
                🙏
              </span>
            </div>
            <h1 className="mt-3 text-5xl font-black tracking-tight text-slate-800 drop-shadow-sm sm:text-6xl">
              Jogos Bíblicos
            </h1>
            <p className="mx-auto mt-2 max-w-md text-base font-bold text-slate-500">
              Pequeninos, Exploradores e Íntimos de Deus — crescendo como Jesus: em sabedoria, estatura e graça!
            </p>
          </header>

          {/* ─── filtro por tipo ─── */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTipoFiltro(f.id)}
                aria-pressed={tipoFiltro === f.id}
                className={`ui-press rounded-full px-4 py-2 text-sm font-black shadow ${
                  tipoFiltro === f.id
                    ? 'bg-indigo-500 text-white'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                {t(f.tKey)}
              </button>
            ))}
          </div>

          {smallKids ? (
            <p className="animate-pop mx-auto mt-3 max-w-md rounded-3xl bg-emerald-200/70 px-6 py-2 text-center text-sm font-bold text-emerald-800">
              🧒 Modo pequeninos: figuras grandes e voz em tudo. Feito para quem ainda não lê!
            </p>
          ) : null}

          {/* convite para instalar (PWA) */}
          <div className="mt-2">
            <InstallHint />
          </div>

          {/* ─── seções por faixa ─── */}
          <div className="mt-6 flex flex-col gap-6">
            {FAIXAS.map((faixa) => {
              const visiveis = games.filter(
                (g) =>
                  g.faixa === faixa.id &&
                  (tipoFiltro === 'todos' || g.tipo === tipoFiltro),
              );
              const prontos = visiveis.filter((g) => g.status === 'pronto');
              if (prontos.length === 0) return null;
              const breves = visiveis.filter((g) => g.status === 'em-breve');

              return (
                <section
                  key={faixa.id}
                  className="relative overflow-hidden rounded-3xl border-2 border-slate-100 bg-white shadow-xl"
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${faixa.gradient} opacity-70`}
                  />
                  <div className="relative p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow">
                        {faixa.mascote}
                      </span>
                      <div>
                        <h2 className={`text-2xl font-black ${faixa.text}`}>{faixa.nome}</h2>
                        <p className="text-xs font-bold text-slate-500">{faixa.idade}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {prontos.map((g) => (
                        <GameCard
                          key={g.id}
                          game={g}
                          progress={progress}
                          onPlay={() => handleSelect(g.id)}
                        />
                      ))}
                      {breves.map((g) => (
                        <SoonCard key={g.id} game={g} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {/* ─── em breve nas outras faixas (todas, agrupadas) ─── */}
          {games.some((g) => g.status === 'em-breve') ? (
          <section className="mt-6 rounded-3xl border-2 border-slate-100 bg-white px-4 py-5 shadow-xl">
            <h2 className="text-center text-xl font-black text-slate-700">
              Em breve nas outras faixas ✨
            </h2>
            <p className="mt-1 text-center text-xs font-bold text-slate-400">
              Novas aventuras para cada idade estão a caminho!
            </p>
            {FAIXAS.map((faixa) => {
              const breves = games.filter(
                (g) =>
                  g.faixa === faixa.id &&
                  g.status === 'em-breve' &&
                  (tipoFiltro === 'todos' || g.tipo === tipoFiltro),
              );
              if (breves.length === 0) return null;
              return (
                <div key={faixa.id} className="mt-4">
                  <h3
                    className={`flex items-center gap-2 text-sm font-black uppercase tracking-wide ${faixa.text}`}
                  >
                    {faixa.mascote} {faixa.nome} — em breve
                  </h3>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {breves.map((g) => (
                      <SoonCard key={g.id} game={g} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
          ) : null}

          <footer className="mt-8 pb-10 text-center text-xs font-bold text-slate-400">
            Feito com 💛 para crianças brasileiras · v0.1
          </footer>
        </main>
      </div>

      {/* ─── livrinho de figurinhas (Fase 8) ─── */}
      <CollectionBook open={bookOpen} onClose={() => setBookOpen(false)} />

      {/* ─── popup de instalação (gate) ─── */}
      {gate ? (
        <div
          role="alertdialog"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
        >
          <div className="w-full max-w-md rounded-3xl border-2 border-slate-100 bg-white p-6 text-center shadow-2xl">
            <p className="text-xl font-black text-slate-800">📲 Para jogar sem travar!</p>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Instale o jogo na tela de início para abrir com um toque — e continuar jogando até
              sem internet.
            </p>
            <div className="text-left">
              <InstallHint />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setGate(null)}
                className="ui-press rounded-full bg-slate-100 px-5 py-2 text-sm font-black text-slate-600"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={playAnyway}
                className="ui-press rounded-full bg-amber-400 px-5 py-2 text-sm font-black text-amber-950 shadow"
              >
                Jogar mesmo assim ▶
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}