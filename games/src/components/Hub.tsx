import { useCallback, useEffect, useRef, useState } from 'react';
import {
  games,
  jogoNaFaixa,
  TIPOS,
  MAX_LEVELS_PER_GAME,
  type Faixa,
  type GameDefinition,
  type Tipo,
} from '../data/games';
import {
  chapterLevelsDone,
  chapterStars,
  loadLevels,
  totalStars,
} from '../lib/progress';
import {
  isMusicMuted,
  isSfxMuted,
  setMusicMuted,
  setSfxMuted,
  subscribeSoundPrefs,
  sfx,
} from '../lib/audio';
import { isIOS, isStandalone } from '../lib/device';
import { isSmallKidsMode, setSmallKidsMode, loadTipoFilter, saveTipoFilter } from '../lib/prefs';
import { loadStickers, subscribeStickers } from '../lib/stickers';
import { SCENE_COUNT } from '../data/scenes';
import { StarItem } from './art';
import InstallHint from './InstallHint';
import CollectionBook from './CollectionBook';
import { ARCADE_MODE } from '../lib/arcade';
import { FAIXA_NEON } from './arcade/faixaNeon';
import FaixaNumero from './arcade/FaixaNumero';

interface HubProps {
  /** Faixa escolhida na tela de idade (`#jogos/3-4`). */
  faixa: Faixa;
  onSelectGame: (id: string) => void;
  /** Volta para a tela de escolha da idade. */
  onBack: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const BASE = import.meta.env.BASE_URL;

/** Capa 1280×720 (preview) ou 512×512 (miniatura), com variante @2x. */
function capa(id: string, variante: 'preview' | 'quadrada' = 'preview', x2 = false) {
  const sufixo = variante === 'quadrada' ? '-sq' : '';
  return `${BASE}assets/covers/${id}${sufixo}${x2 ? '@2x' : ''}.webp`;
}

const FILTROS: { id: 'todos' | Tipo; rotulo: string }[] = [
  { id: 'todos', rotulo: 'TODOS' },
  { id: 'at', rotulo: 'AT' },
  { id: 'nt', rotulo: 'NT' },
  { id: 'at-nt', rotulo: 'AT+NT' },
];

const ICONE_TOPO =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors';

/** Quanto vale a estrela daquele jogo (leitura não pontua por estrela). */
function estrelasDoJogo(game: GameDefinition, progress: ReturnType<typeof loadLevels>) {
  const total = (game.totalLevels ?? MAX_LEVELS_PER_GAME) * 3;
  return { ganhas: chapterStars(progress, game.id), total };
}

/**
 * Tela 3: seleção de cartucho (menu de arcade estilo MVS).
 *
 * Um PREVIEW grande do jogo focado (capa, título em fonte pixel, sinopse,
 * estrelas e JOGAR/CONTINUAR) e uma fileira de miniaturas quadradas embaixo.
 * Desktop: ← → rolam a fileira, Enter abre, Esc volta. Mobile: toque na
 * miniatura troca o preview e o JOGAR fica fixo no rodapé.
 *
 * Não existe mais lista antiga: nem cabeçalho, nem avatar, nem cards em
 * duas colunas com botão dentro.
 */
export default function Hub({ faixa, onSelectGame, onBack }: HubProps) {
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | Tipo>(() => {
    const salvo = loadTipoFilter();
    return FILTROS.some((f) => f.id === salvo) ? (salvo as 'todos' | Tipo) : 'todos';
  });
  const [foco, setFoco] = useState(0);
  const [sfxOn, setSfxOn] = useState(() => !isSfxMuted());
  const [musicOn, setMusicOn] = useState(() => !isMusicMuted());
  const [smallKids, setSmallKids] = useState(isSmallKidsMode);
  const [bookOpen, setBookOpen] = useState(false);
  const [stickerCount, setStickerCount] = useState(() => loadStickers().size);
  const [gate, setGate] = useState<string | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const thumbs = useRef<Array<HTMLButtonElement | null>>([]);
  const progress = loadLevels();
  const stars = totalStars(progress);
  const neon = FAIXA_NEON[faixa];

  const lista = games.filter(
    (g) =>
      g.status === 'pronto' &&
      jogoNaFaixa(g.faixa, faixa) &&
      (tipoFiltro === 'todos' || g.tipo === tipoFiltro),
  );
  const indice = lista.length === 0 ? 0 : Math.min(foco, lista.length - 1);
  const jogo = lista[indice];

  // Trocar de faixa/filtro começa do primeiro cartucho.
  useEffect(() => {
    setFoco(0);
  }, [faixa, tipoFiltro]);

  useEffect(() => {
    saveTipoFilter(tipoFiltro);
  }, [tipoFiltro]);

  useEffect(() => subscribeSoundPrefs(() => {
    setSfxOn(!isSfxMuted());
    setMusicOn(!isMusicMuted());
  }), []);

  useEffect(() => subscribeStickers(() => setStickerCount(loadStickers().size)), []);

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

  const installable = !ARCADE_MODE && !installed && (Boolean(installPrompt) || isIOS());

  const focar = useCallback((i: number) => {
    setFoco(i);
    thumbs.current[i]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, []);

  /** Jogos só abrem quando instalado — senão, popup de instalação primeiro. */
  const abrir = useCallback(
    (id: string) => {
      sfx.pop();
      if (installed || !installable) {
        onSelectGame(id);
        return;
      }
      setGate(id);
    },
    [installable, installed, onSelectGame],
  );

  const abrirFocado = useCallback(() => {
    if (lista.length > 0) abrir(lista[indice].id);
  }, [abrir, indice, lista]);

  // Teclado: ← → navegam, Enter abre, Esc volta (fechando o popup primeiro).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (gate) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setGate(null);
        }
        return;
      }
      const alvo = event.target as HTMLElement | null;
      const emCampo = alvo?.closest('input, textarea, select');
      if (emCampo) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (lista.length > 0) focar((indice + 1) % lista.length);
        sfx.pop();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (lista.length > 0) focar((indice - 1 + lista.length) % lista.length);
        sfx.pop();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        sfx.close();
        onBack();
      } else if (event.key === 'Enter') {
        // Enter só abre o cartucho quando o foco não está em outro botão.
        if (alvo?.closest('button')) return;
        event.preventDefault();
        abrirFocado();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abrirFocado, focar, gate, indice, lista.length, onBack]);

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
    if (next) setSfxMuted(false);
    sfx.pop();
  }

  const tipoDoJogo = jogo ? TIPOS.find((tp) => tp.id === jogo.tipo) : undefined;
  const estrelas = jogo ? estrelasDoJogo(jogo, progress) : { ganhas: 0, total: 0 };
  const continuar = jogo ? chapterLevelsDone(progress, jogo.id) > 0 : false;

  return (
    <div className="arcade-bg h-screen-safe safe-area-pad flex w-full flex-col overflow-hidden">
      {/* ─── topo: sair · título pequeno · placar · controles ─── */}
      <header className="relative z-20 flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1.5 px-2.5 py-2">
        <button
          type="button"
          onClick={() => {
            sfx.close();
            onBack();
          }}
          aria-label={`Voltar para ${'a escolha da idade'}`}
          className="arcade-btn h-10 shrink-0 px-3 text-[11px] font-black tracking-wide text-amber-200"
        >
          ◀
        </button>

        <div className="min-w-0">
          <p className="pixel-sm hidden truncate text-[9px] tracking-[0.22em] text-cyan-200/80 sm:block sm:text-[10px]">
            JOGOS BÍBLICOS
          </p>
          <p className={`pixel-sm truncate text-[10px] ${neon.name}`}>
            <FaixaNumero faixa={faixa} /> <span className="text-white/45">ANOS</span>
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          <span className="flex h-10 items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/10 px-3 text-xs font-black text-amber-100">
            <StarItem size={13} />
            {stars}
          </span>

          <button
            type="button"
            onClick={toggleSmallKids}
            aria-pressed={smallKids}
            aria-label="Modo para os menores (letras grandes e voz)"
            className={`${ICONE_TOPO} ${smallKids ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-100' : 'border-white/10 bg-white/5 text-slate-400'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
          </button>

          <button
            type="button"
            onClick={() => setBookOpen(true)}
            aria-label={`Figurinhas — ${stickerCount}/${SCENE_COUNT}`}
            className={`${ICONE_TOPO} relative border-violet-300/40 bg-violet-400/15 text-violet-100`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M8 4v16M16 4v16" /></svg>
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-amber-950">
              {stickerCount}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleSfx}
            aria-pressed={sfxOn}
            aria-label={sfxOn ? 'Desligar efeitos sonoros' : 'Ligar efeitos sonoros'}
            className={`${ICONE_TOPO} ${sfxOn ? 'border-sky-300/50 bg-sky-400/15 text-sky-100' : 'border-white/10 bg-white/5 text-slate-400'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />{sfxOn ? <><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></> : <><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>}</svg>
          </button>

          <button
            type="button"
            onClick={toggleMusic}
            aria-pressed={musicOn}
            aria-label={musicOn ? 'Desligar música' : 'Ligar música'}
            className={`${ICONE_TOPO} ${musicOn ? 'border-rose-300/50 bg-rose-400/15 text-rose-100' : 'border-white/10 bg-white/5 text-slate-400'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />{musicOn ? null : <line x1="1" y1="1" x2="23" y2="23" />}</svg>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col gap-2 px-2.5 pb-2 sm:gap-3 sm:px-4 sm:pb-4">
        {jogo ? (
          <>
            <p className="hidden shrink-0 truncate px-1 text-center text-xs font-black text-amber-200 [@media(max-height:520px)]:block">
              {jogo.title}
            </p>

            {/* ─── preview do cartucho focado (16:9, cabe na altura) ─── */}
            <div className="hub-preview relative flex min-h-0 max-sm:flex-none flex-1 items-center justify-center">
            <section className="relative aspect-video max-h-full w-full shrink-0 overflow-hidden rounded-2xl border-4 border-amber-300/80 bg-black shadow-[0_0_70px_-24px_rgba(251,191,36,0.9)]">
              <img
                key={jogo.id}
                src={capa(jogo.id)}
                srcSet={`${capa(jogo.id)} 1x, ${capa(jogo.id, 'preview', true)} 2x`}
                alt=""
                loading="eager"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover object-[50%_58%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 via-35% to-transparent" />

              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-3 sm:p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tipoDoJogo ? (
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${tipoDoJogo.badge} ${tipoDoJogo.text}`}>
                        {tipoDoJogo.curto}
                      </span>
                    ) : null}
                    {jogo.progressoLeitura ? (
                      <span className="rounded bg-teal-400/20 px-1.5 py-0.5 text-[9px] font-black text-teal-100">
                        LEITURA
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-black text-amber-100">
                        <StarItem size={11} />
                        {estrelas.ganhas}/{estrelas.total}
                      </span>
                    )}
                  </div>

                  <h2 className="pixel mt-2 text-balance text-sm leading-relaxed text-amber-100 sm:text-xl lg:text-2xl">
                    {jogo.title}
                  </h2>
                  <p className="mt-1 line-clamp-1 max-w-xl text-[11px] leading-snug font-bold text-white/80 sm:line-clamp-2 sm:text-sm">
                    {jogo.sinopse}
                  </p>
                </div>

                <div className="hidden shrink-0 sm:block">
                  <button
                    type="button"
                    onClick={() => abrirFocado()}
                    className="arcade-btn flex min-h-12 px-6 text-sm font-black tracking-wide text-amber-200"
                  >
                    {continuar ? 'CONTINUAR ▶' : 'JOGAR ▶'}
                  </button>
                </div>
              </div>
            </section>
            </div>

            {/* ─── filtro de testamento: pequeno, no canto ─── */}
            <div className="flex shrink-0 items-center justify-end gap-0.5">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTipoFiltro(f.id)}
                  aria-pressed={tipoFiltro === f.id}
                  className={`rounded px-2 py-1 text-[9px] font-black tracking-wide sm:text-[10px] ${
                    tipoFiltro === f.id
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {f.rotulo}
                </button>
              ))}
            </div>

            {/* ─── fileira de miniaturas (desktop) / grade 3 col (mobile) ─── */}
            <div
              role="listbox"
              aria-label="Cartuchos da faixa"
              className="flex min-h-0 flex-1 flex-wrap content-start items-start gap-2 overflow-y-auto pt-2 pb-1 sm:flex-none sm:flex-nowrap sm:gap-3 sm:overflow-x-auto sm:overflow-y-hidden sm:pb-1"
            >
              {lista.map((g, i) => {
                const ativo = i === indice;
                return (
                  <button
                    key={g.id}
                    ref={(el) => {
                      thumbs.current[i] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={ativo}
                    aria-label={g.title}
                    onClick={() => {
                      sfx.click();
                      focar(i);
                    }}
                    onDoubleClick={() => abrir(g.id)}
                    className={`relative aspect-square w-[calc((100%-1rem)/3)] shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-150 sm:w-[104px] ${
                      ativo
                        ? '-translate-y-1 border-amber-300 shadow-[0_0_26px_-2px_rgba(251,191,36,0.85)] sm:-translate-y-2'
                        : 'border-white/15 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={capa(g.id, 'quadrada')}
                      srcSet={`${capa(g.id, 'quadrada')} 1x, ${capa(g.id, 'quadrada', true)} 2x`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="block h-full w-full object-cover"
                    />
                    {ativo ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-amber-200/90 ring-inset"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* ─── mobile: JOGAR grande fixo embaixo ─── */}
            <div className="shrink-0 sm:hidden">
              <button
                type="button"
                onClick={() => abrirFocado()}
                className="arcade-btn min-h-14 w-full text-base font-black tracking-wide text-amber-200"
              >
                {continuar ? 'CONTINUAR ▶' : 'JOGAR ▶'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="pixel-sm text-[11px] text-white/60">NENHUM JOGO COM ESSE FILTRO</p>
            <button
              type="button"
              onClick={() => setTipoFiltro('todos')}
              className="arcade-btn min-h-12 px-5 text-sm font-black text-amber-200"
            >
              Ver todos
            </button>
          </div>
        )}
      </main>

      <CollectionBook open={bookOpen} onClose={() => setBookOpen(false)} />

      {gate ? (
        <div
          role="alertdialog"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
        >
          <div className="w-full max-w-md rounded-3xl border-2 border-white/10 bg-[#160c2e] p-6 text-center shadow-2xl">
            <p className="text-xl font-black text-white">📲 Para jogar sem travar!</p>
            <p className="mt-1 text-sm font-bold text-slate-300">
              Instale o jogo na tela de início para abrir com um toque — e continuar jogando
              até sem internet.
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
                onClick={() => {
                  const id = gate;
                  setGate(null);
                  sfx.pop();
                  onSelectGame(id);
                }}
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
