import { useEffect, useRef, useState } from 'react';
import { games, jogoNaFaixa, TIPOS, MAX_LEVELS_PER_GAME, type Faixa, type GameDefinition, type Tipo } from '../data/games';
import { bestScore, chapterLevelsDone, chapterStars, loadLevels, totalStars, type ProgressMap } from '../lib/progress';
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
import {
  isSmallKidsMode,
  setSmallKidsMode,
  loadTipoFilter,
  saveTipoFilter,
} from '../lib/prefs';
import { faixaNumero } from '../lib/faixa';
import { FAIXA_NEON } from './arcade/faixaNeon';
import FaixaArt from './arcade/FaixaArt';
import { StarItem } from './art';
import { SCENE_COUNT } from '../data/scenes';
import { loadStickers, subscribeStickers } from '../lib/stickers';
import { getLang, isEn, setLang, t, type TKey } from '../lib/i18n';
import CollectionBook from './CollectionBook';
import ArcadeMarquee from './arcade/ArcadeMarquee';
import { ARCADE_MODE, enableArcadeMode } from '../lib/arcade';

interface HubProps {
  /** Faixa escolhida na tela de idade (`#jogos/3-4`). */
  faixa: Faixa;
  onSelectGame: (id: string) => void;
  /** Volta para a tela de escolha da idade. */
  onBack: () => void;
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
const SoundOnIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const SoundOffIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>;
const MusicOnIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const MusicOffIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const SmallKidsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;

/** Botão redondo de controle do gabinete (44 px — alvo de toque). */
const ICON_BTN =
  'ui-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors';
const ICON_OFF = 'border-white/10 bg-white/5 text-slate-400';

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
  const record = bestScore(game.id);

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Jogar ${game.title}`}
      className="arcade-cart ui-press group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:border-cyan-300/50 hover:shadow-[0_0_32px_-12px_rgba(34,211,238,0.75)]"
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-[inset_0_-4px_0_rgba(0,0,0,0.18)] ${game.color}`}
      >
        <Icon size={40} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-base leading-tight font-black text-white sm:text-lg">{game.title}</span>
        <span className="truncate text-[11px] font-bold text-slate-300">{game.subtitle}</span>
        <span className="flex flex-wrap items-center gap-1.5">
          {tipo ? (
            <span
              title={tipo.nome}
              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${tipo.badge} ${tipo.text}`}
            >
              {tipo.emoji} {tipo.curto}
            </span>
          ) : null}
          {game.progressoLeitura ? (
            // Jogo de leitura: estrela não faz sentido (reler não é erro) e o
            // Hub não pode importar o conteúdo só para contar unidades — o
            // número mora dentro do jogo, que é quem sabe o que tem.
            <span className="flex items-center gap-1 rounded-full bg-teal-400/15 px-2 py-0.5 text-[11px] font-black text-teal-100">
              📖 Leitura
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-black text-amber-100">
              <StarItem size={12} /> {stars}/{total * 3}
            </span>
          )}
          {record > 0 ? (
            <span className="rounded-full bg-yellow-300/15 px-2 py-0.5 text-[11px] font-black text-yellow-100">
              🏆 {record}
            </span>
          ) : null}
        </span>
      </span>

      <span className="arcade-btn min-h-11 shrink-0 px-4 text-xs font-black tracking-wide text-amber-200">
        {done > 0 ? t('hub.continuar') : t('hub.jogar')} ▶
      </span>
    </button>
  );
}

function SoonCard({ game }: { game: GameDefinition }) {
  const Icon = game.icon;
  const tipo = TIPOS.find((t) => t.id === game.tipo);

  return (
    <div className="flex w-full select-none items-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] p-3 opacity-80">
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl opacity-60 ${game.color}`}>
        <Icon size={40} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-base leading-tight font-black text-slate-300">{game.title}</span>
        <span className="text-[11px] font-bold text-slate-400">{game.emBreveMotivo}</span>
        {tipo ? (
          <span
            title={tipo.nome}
            className={`self-start rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${tipo.badge} ${tipo.text}`}
          >
            {tipo.emoji} {tipo.curto}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-slate-300">
        {t('hub.em-breve')} 🔨
      </span>
    </div>
  );
}

export default function Hub({ faixa, onSelectGame, onBack, onLogout }: HubProps) {
  const [sfxOn, setSfxOn] = useState(() => !isSfxMuted());
  const [musicOn, setMusicOn] = useState(() => !isMusicMuted());
  const [smallKids, setSmallKids] = useState(isSmallKidsMode);
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | Tipo>(() => {
    const saved = loadTipoFilter();
    return FILTROS.some((f) => f.id === saved) ? (saved as 'todos' | Tipo) : 'todos';
  });
  const [gate, setGate] = useState<string | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [stickerCount, setStickerCount] = useState(() => loadStickers().size);
  const [lang, setLangState] = useState<ReturnType<typeof getLang>>(getLang);
  const [exitTaps, setExitTaps] = useState(0);
  const exitTimer = useRef(0);
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

  // O filtro de testamento sobrevive à ida ao jogo e volta igual (ver lib/prefs).
  useEffect(() => saveTipoFilter(tipoFiltro), [tipoFiltro]);

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
  const neon = FAIXA_NEON[faixa];
  const ready = games.filter((g) => g.status === 'pronto');
  // O gabinete mostra só a faixa escolhida na tela de idade.
  const prontos = ready.filter(
    (g) => jogoNaFaixa(g.faixa, faixa) && (tipoFiltro === 'todos' || g.tipo === tipoFiltro),
  );
  const breves = games.filter(
    (g) =>
      g.status === 'em-breve' &&
      jogoNaFaixa(g.faixa, faixa) &&
      (tipoFiltro === 'todos' || g.tipo === tipoFiltro),
  );
  const maxLevels = ready.reduce((acc, g) => acc + (g.totalLevels ?? MAX_LEVELS_PER_GAME), 0);
  const doneLevels = ready.reduce(
    (acc, g) => acc + Math.min(chapterLevelsDone(progress, g.id), g.totalLevels ?? MAX_LEVELS_PER_GAME),
    0,
  );
  const stars = totalStars(progress);
  // Instalação só é obrigatória onde o aparelho realmente oferece instalar.
  // No modo sala ela NÃO existe: o tablet do evento precisa abrir o jogo já.
  const installable = !ARCADE_MODE && !installed && (Boolean(installPrompt) || ios);

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

  /** Volta para a escolha de idade — o "EJECT" da máquina. */
  function handleBack() {
    sfx.close();
    onBack();
  }

  /** "Jogo surpresa": sorteia um jogo pronto da faixa escolhida (fila do evento). */
  function surprise() {
    const pool = ready.filter(
      (g) => jogoNaFaixa(g.faixa, faixa) && (tipoFiltro === 'todos' || g.tipo === tipoFiltro),
    );
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    sfx.open();
    handleSelect(pick.id);
  }

  function playAnyway() {
    if (!gate) return;
    sfx.pop();
    setGate(null);
    onSelectGame(gate);
  }

  /** Saída discreta do quiosque: 3 toques no selo do rodapé. */
  function tapExitArcade() {
    window.clearTimeout(exitTimer.current);
    const next = exitTaps + 1;
    if (next >= 3) {
      enableArcadeMode(false);
      window.location.reload();
      return;
    }
    setExitTaps(next);
    exitTimer.current = window.setTimeout(() => setExitTaps(0), 2600);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* navegador sem Fullscreen API: segue no tamanho normal */
    }
  }

  return (
    <div className="arcade-bg safe-area-pad relative min-h-screen-safe w-full overflow-x-hidden">
      {/* brilhos do salão */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-fuchsia-600/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-2 pb-8 sm:px-4">
        <ArcadeMarquee
          heading="h1"
          title="Jogos Bíblicos"
          subtitle="ARCADE DA FÉ · 3 a 9 anos"
          badge={ARCADE_MODE ? 'Sala de Jogos · FestKids' : undefined}
          className="mt-2"
          right={
            ARCADE_MODE ? (
              <span className="hidden flex-col items-end gap-0.5 rounded-xl border border-white/10 bg-black/25 px-3 py-1.5 sm:flex">
                <span className="text-[9px] font-black tracking-[0.2em] text-white/45 uppercase">Fichas</span>
                <span className="text-lg leading-none font-black text-cyan-200">∞</span>
              </span>
            ) : undefined
          }
        />

        {/* ─── barra fixa: progresso + controles ─── */}
        <div className="sticky top-0 z-40 mt-2 rounded-2xl border border-white/10 bg-arcade-noite/95 px-2.5 py-2 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.9)] backdrop-blur sm:px-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-100 sm:text-sm">
              <StarItem size={15} />
              <span>{stars}</span>
              {/* No celular o "x/y níveis" não cabe ao lado dos controles;
                  o placar de estrelas é o que a criança entende mesmo. */}
              <span className="hidden text-amber-300/50 sm:inline">·</span>
              <span className="hidden truncate sm:inline">
                {doneLevels}/{maxLevels} níveis
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Sair"
                  className={`${ICON_BTN} ${ICON_OFF}`}
                >
                  🚪
                </button>
              ) : null}
              {ARCADE_MODE ? (
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label="Tela cheia"
                  title="Tela cheia"
                  className={`${ICON_BTN} ${ICON_OFF}`}
                >
                  ⛶
                </button>
              ) : null}
              <button
                type="button"
                onClick={toggleSmallKids}
                aria-pressed={smallKids}
                aria-label={`Modo pequeninos ${smallKids ? 'ligado' : 'desligado'}`}
                className={`${ICON_BTN} ${smallKids ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-100' : ICON_OFF}`}
              >
                <SmallKidsIcon />
              </button>
              <button
                type="button"
                onClick={toggleSfx}
                aria-pressed={sfxOn}
                aria-label={`Efeitos sonoros ${sfxOn ? 'ligados' : 'desligados'}`}
                className={`${ICON_BTN} ${sfxOn ? 'border-sky-300/60 bg-sky-400/20 text-sky-100' : ICON_OFF}`}
              >
                {sfxOn ? <SoundOnIcon /> : <SoundOffIcon />}
              </button>
              <button
                type="button"
                onClick={() => setBookOpen(true)}
                aria-label={`${t('hub.figurinhas')} — ${stickerCount}/${SCENE_COUNT}`}
                className={`${ICON_BTN} relative border-violet-300/50 bg-violet-400/20 text-violet-100`}
              >
                💮
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-arcade-noite bg-amber-400 px-1 text-[10px] font-black text-amber-950">
                  {stickerCount}
                </span>
              </button>
              <button
                type="button"
                onClick={toggleLang}
                aria-label={`Idioma: ${lang === 'pt' ? 'português' : 'inglês'}`}
                className={`${ICON_BTN} ${ICON_OFF} text-[11px] font-black`}
              >
                {lang === 'pt' ? 'PT' : 'EN'}
              </button>
              <button
                type="button"
                onClick={toggleMusic}
                aria-pressed={musicOn}
                aria-label={`Música ${musicOn ? 'ligada' : 'desligada'}`}
                className={`${ICON_BTN} ${musicOn ? 'border-rose-300/60 bg-rose-400/20 text-rose-100' : ICON_OFF}`}
              >
                {musicOn ? <MusicOnIcon /> : <MusicOffIcon />}
              </button>
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-3xl">
          {/* ─── saída da faixa + selo da idade escolhida ─── */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="arcade-btn min-h-14 px-5 text-sm font-black tracking-wide text-amber-200"
            >
              ◀ {t('faixa.voltar')}
            </button>
            <span
              className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-black ${neon.border} ${neon.chip}`}
              aria-label={`${faixaNumero(faixa)} ${t('faixa.anos')}`}
            >
              <span className="tabular-nums">{faixaNumero(faixa)}</span>
              <span className="text-[10px] tracking-[0.2em] opacity-80">{t('faixa.anos')}</span>
            </span>
          </div>

          {/* ─── herói / convite: o personagem da faixa recebe a criança ─── */}
          <header className="flex items-center justify-center gap-3 pt-4 sm:gap-5">
            <span className="inline-block shrink-0 animate-hero-bob">
              <FaixaArt faixa={faixa} className="h-20 w-auto sm:h-24" />
            </span>
            <p className="max-w-xs text-balance text-left text-sm font-bold text-white/70 sm:max-w-sm sm:text-base">
              Escolha seu jogo e cresça como Jesus: em sabedoria, estatura e graça!
            </p>
          </header>

          {/* ─── filtro por tipo + surpresa ─── */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTipoFiltro(f.id)}
                aria-pressed={tipoFiltro === f.id}
                className={`ui-press min-h-10 rounded-full px-3.5 text-xs font-black sm:text-sm ${
                  tipoFiltro === f.id
                    ? 'bg-fuchsia-400 text-slate-950 shadow-[0_0_20px_rgba(232,121,249,0.45)]'
                    : 'border border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                {t(f.tKey)}
              </button>
            ))}
            <button
              type="button"
              onClick={surprise}
              className="ui-press min-h-10 rounded-full border-2 border-amber-300/40 bg-amber-400/10 px-4 text-xs font-black text-amber-100 sm:text-sm"
            >
              🎲 Surpresa
            </button>
          </div>

          {smallKids ? (
            <p className="animate-pop mx-auto mt-3 max-w-md rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-5 py-2 text-center text-sm font-bold text-emerald-100">
              🧒 Modo pequeninos: figuras grandes e voz em tudo. Feito para quem ainda não lê!
            </p>
          ) : null}

          {/* convite para instalar (PWA) — nunca no quiosque do evento */}
          {!ARCADE_MODE ? (
            <div className="mt-2">
              <InstallHint />
            </div>
          ) : null}

          {/* ─── gabinete da faixa escolhida ─── */}
          <div className="mt-5 flex flex-col gap-5">
            {prontos.length > 0 ? (
              <section
                className={`relative overflow-hidden rounded-3xl border-2 ${neon.border} bg-black/25 p-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.9)] sm:p-4`}
              >
                <div aria-hidden className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${neon.bar}`} />

                <div className="flex items-center gap-3 pb-3">
                  <span className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white/15 bg-white/5 shadow">
                    <FaixaArt faixa={faixa} className="h-full w-auto" />
                  </span>
                  <div className="min-w-0">
                    <h2 className={`flex items-baseline gap-2 text-xl font-black sm:text-2xl ${neon.name}`}>
                      <span className="tabular-nums">{faixaNumero(faixa)}</span>
                      <span className="text-[10px] font-black tracking-[0.25em] text-white/45">
                        {t('faixa.anos')}
                      </span>
                    </h2>
                    <p className="text-[11px] font-bold text-white/50">
                      {prontos.length} {prontos.length === 1 ? 'jogo' : 'jogos'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {prontos.map((g) => (
                    <GameCard
                      key={g.id}
                      game={g}
                      progress={progress}
                      onPlay={() => handleSelect(g.id)}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {breves.length > 0 ? (
              <section className="rounded-3xl border-2 border-white/10 bg-black/25 px-4 py-5">
                <h2 className="text-center text-lg font-black text-slate-200">
                  {t('hub.em-breve')} ✨
                </h2>
                <p className="mt-1 text-center text-xs font-bold text-white/45">
                  Novas aventuras estão a caminho!
                </p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {breves.map((g) => (
                    <SoonCard key={g.id} game={g} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <footer className="mt-8 pb-8 text-center text-[11px] font-bold text-white/35">
            Feito com 💛 para crianças brasileiras · v0.1
            {ARCADE_MODE ? (
              <>
                <span className="mx-1.5 text-white/20">·</span>
                <button
                  type="button"
                  onClick={tapExitArcade}
                  className="min-h-11 rounded-full px-3 py-2 font-black tracking-wide text-cyan-200/70 uppercase"
                  aria-label={
                    exitTaps > 0 ? 'Toque mais uma vez para sair do modo sala' : 'Modo sala de jogos'
                  }
                >
                  {exitTaps === 0
                    ? 'Sala de Jogos · FestKids'
                    : exitTaps === 1
                      ? 'Toque 2× para sair'
                      : 'Toque 1× para sair'}
                </button>
              </>
            ) : null}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
        >
          <div className="w-full max-w-md rounded-3xl border-2 border-white/10 bg-arcade-noite p-6 text-center shadow-2xl">
            <p className="text-xl font-black text-white">📲 Para jogar sem travar!</p>
            <p className="mt-1 text-sm font-bold text-slate-300">
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
                className="ui-press min-h-11 rounded-full bg-white/10 px-5 text-sm font-black text-slate-200"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={playAnyway}
                className="arcade-btn min-h-11 px-5 text-sm font-black text-amber-200"
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
