// A Palavra Certa (7–9) — plataforma lateral com duelos de Palavra.
//
// Em vez de soco, a criança DECLARA a Palavra: 3 opções quase iguais, só uma
// verdadeira (pergunta bíblica). O erro esfria um pouquinho a **Conexão com
// Deus** (punição única — nada mais é tirado) e sempre convida a tentar de novo
// (`jogos-biblicos` §5, tom de graça). 10 fases; cada NPC tem 3 variantes de
// situação sorteadas a cada partida; o guardião da fase cede em 3 rodadas.

import { useCallback, useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { ArrowLeft, ArrowRight, ChevronRight, Flame, Map as MapIcon } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import PauseOverlay from '../PauseOverlay';
import HandHint from '../HandHint';
import SpeakChip from '../SpeakChip';
import { Npc } from '../art';
import type { NpcLook } from '../art/Npc';
import {
  completeLevel,
  isLevelUnlocked,
  loadLevels,
  nextUnfinishedLevel,
  type ProgressMap,
} from '../../lib/progress';
import { starsForWrong } from '../../lib/minigame';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { music, sfx, voice } from '../../lib/audio';
import * as pfx from '../../lib/palavracerta/sfx';
import { burst, shake } from '../../lib/fx';
import { isFirstTime, isSmallKidsMode, markPlayed } from '../../lib/prefs';
import { createPlatformer, type PlatformerHandle } from '../../lib/palavracerta/engine';
import {
  embaralharCarta,
  escolherVariante,
  FASES,
  marcarUso,
  type Carta,
  type Encontro,
} from '../../data/palavraCerta';
import type { NpcLookCanvas } from '../../lib/palavracerta/types';

const GAME_ID = 'palavra-certa';
const TOTAL_FASES = FASES.length;
const CONEXAO_MAX = 5;

interface GameProps {
  onExit: () => void;
}

interface Duelo {
  encontro: Encontro;
  carta: Carta;
  opcoes: string[];
  certa: number;
  /** índices das opções já riscadas (erros) */
  removidas: number[];
  /** rodada do guardião (1–3); 0 = encontro comum */
  rodadaGuardiao: number;
}

function toNpcLook(l: NpcLookCanvas): Partial<NpcLook> {
  return {
    skin: l.skin,
    hair: l.hair,
    hairStyle: l.hairStyle,
    beard: false,
    beardColor: '#e5e7eb',
    headwear: l.headwear === 'hat' ? 'none' : l.headwear,
    headwearColor: l.headwearColor,
    robe: l.robe,
  };
}

const BIOME_EMOJI: Record<string, string> = {
  amanhecer: '🌅',
  pomar: '🍎',
  mercado: '🧺',
  escola: '🏫',
  rio: '🏞️',
  floresta: '🌲',
  montanha: '⛰️',
  cidade: '🏙️',
  ponte: '🌉',
  portao: '✨',
};

export default function GameAPalavraCerta({ onExit }: GameProps) {
  const smallKids = isSmallKidsMode();
  const reducedMotion = usePrefersReducedMotion();

  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PlatformerHandle | null>(null);
  const usadas = useRef<Set<string>>(new Set());
  const stageRef = useRef<HTMLDivElement>(null);
  const duelRef = useRef<HTMLDivElement>(null);

  const [faseN, setFaseN] = useState(() =>
    nextUnfinishedLevel(loadLevels(), GAME_ID, TOTAL_FASES),
  );
  const [conexao, setConexao] = useState(CONEXAO_MAX);
  const [wrongCount, setWrongCount] = useState(0);
  const [vencidos, setVencidos] = useState<Set<string>>(new Set());
  const [duelo, setDuelo] = useState<Duelo | null>(null);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string; ref?: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [won, setWon] = useState(false);
  const [levels, setLevels] = useState<ProgressMap>(loadLevels);
  const [showHand, setShowHand] = useState(isFirstTime);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const fase = FASES[faseN - 1] ?? FASES[0];

  /* ------------------------------- motor -------------------------------- */

  useEffect(() => {
    const host = canvasRef.current;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.borderRadius = '1rem';
    host.appendChild(canvas);
    canvasEl.current = canvas;

    const engine = createPlatformer(canvas, {
      biome: fase.biome,
      levelIndex: faseN,
      easy: smallKids,
      reducedMotion,
      npcs: fase.encontros.map((e) => ({
        id: e.id,
        x: 0,
        guardiao: !!e.guardiao,
        look: e.look,
      })),
      events: {
        onEncounter: (id) => {
          const encontro = fase.encontros.find((e) => e.id === id);
          if (!encontro) return;
          engine.pause();
          abrirDuelo(encontro);
        },
        onReachFinish: () => {
          setWon(true);
          voice.speak(`Você atravessou ${fase.nome} declarando a Palavra!`);
        },
        onFall: () => sfx.gentle(),
        onJump: () => pfx.jump(),
        onLand: () => pfx.land(),
        onStep: () => pfx.step(),
      },
    });
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
      canvas.remove();
    };
    // recriar só ao trocar de fase
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faseN]);

  // Música de fundo + pausa de verdade.
  useEffect(() => {
    if (won) return;
    music.play('game');
  }, [faseN, won]);

  useEffect(() => {
    if (paused) {
      engineRef.current?.pause();
      voice.stopSpeaking();
      music.pause();
    } else if (!duelo && !mapOpen && !won) {
      engineRef.current?.resume();
      music.play('game');
    }
  }, [paused, duelo, mapOpen, won]);

  useEffect(() => () => voice.stopSpeaking(), []);

  /* ------------------------------- duelos ------------------------------- */

  const abrirDuelo = useCallback(
    (encontro: Encontro) => {
      const carta = escolherVariante(encontro, usadas.current);
      marcarUso(encontro, carta, usadas.current);
      const emb = embaralharCarta(carta);
      setFeedback(null);
      setDuelo({
        encontro,
        carta,
        opcoes: emb.opcoes,
        certa: emb.certa,
        removidas: [],
        rodadaGuardiao: encontro.guardiao ? 1 : 0,
      });
      sfx.open();
    },
    [],
  );

  function responder(idx: number, ev: { currentTarget: HTMLElement }) {
    if (!duelo || feedback) return;
    const stage = duelRef.current;
    const box = ev.currentTarget.getBoundingClientRect();
    const host = stage?.getBoundingClientRect();
    const x = box.left + box.width / 2 - (host?.left ?? 0);
    const y = box.top + box.height / 2 - (host?.top ?? 0);

    if (idx === duelo.certa) {
      pfx.declare();
      burst(stage, x, y, { kind: 'spark', count: 16 });
      setConexao((c) => Math.min(CONEXAO_MAX, c + 1));
      const texto = duelo.carta.msg;
      setFeedback({ good: true, text: texto, ref: duelo.carta.ref });
      voice.speak(`${texto} ${duelo.carta.ref}`);
    } else {
      sfx.wrong();
      shake(stage);
      burst(stage, x, y, { kind: 'puff', count: 8, spread: 24 });
      setWrongCount((w) => w + 1);
      setConexao((c) => Math.max(1, c - 1));
      setDuelo({ ...duelo, removidas: [...duelo.removidas, idx] });
      setFeedback({
        good: false,
        text: 'Quase! Esse erro esfriou um pouquinho a sua conexão. Mas Deus continua com você — declare a Palavra certa! 🙏',
      });
      voice.speak(
        'Quase! Esse erro esfriou um pouquinho a sua conexão. Mas Deus continua com você! Declare a Palavra certa!',
      );
    }
    if (showHand) {
      setShowHand(false);
      markPlayed();
    }
  }

  function continuarDuelo() {
    if (!duelo) return;
    sfx.click();
    const { encontro, rodadaGuardiao } = duelo;

    // Guardião: 3 rodadas antes de abrir a passagem.
    if (encontro.guardiao && rodadaGuardiao < 3) {
      const carta = escolherVariante(encontro, usadas.current);
      marcarUso(encontro, carta, usadas.current);
      const emb = embaralharCarta(carta);
      setDuelo({
        encontro,
        carta,
        opcoes: emb.opcoes,
        certa: emb.certa,
        removidas: [],
        rodadaGuardiao: rodadaGuardiao + 1,
      });
      setFeedback(null);
      voice.speak(`Rodada ${rodadaGuardiao + 1} de 3! Declare a Palavra certa.`);
      return;
    }

    // Encontro vencido.
    pfx.gateOpen();
    engineRef.current?.setDefeated(encontro.id);
    if (encontro.guardiao) {
      engineRef.current?.setFinishOpen(true);
      voice.speak('O portão abriu! Caminhe até a luz!');
    }
    setVencidos((v) => new Set(v).add(encontro.id));
    setDuelo(null);
    setFeedback(null);
    engineRef.current?.resume();
  }

  /* ------------------------------- vitória ------------------------------- */

  function estrelas() {
    return starsForWrong(wrongCount);
  }

  function proximaFase() {
    const prox = Math.min(TOTAL_FASES, faseN + 1);
    if (prox === faseN) {
      onExit();
      return;
    }
    setFaseN(prox);
    setConexao(CONEXAO_MAX);
    setWrongCount(0);
    setVencidos(new Set());
    setWon(false);
    setDuelo(null);
    setFeedback(null);
    usadas.current = new Set();
  }

  function irParaFase(n: number) {
    setFaseN(n);
    setConexao(CONEXAO_MAX);
    setWrongCount(0);
    setVencidos(new Set());
    setWon(false);
    setDuelo(null);
    setFeedback(null);
    setMapOpen(false);
    setPaused(false);
    usadas.current = new Set();
    engineRef.current?.reset();
    engineRef.current?.resume();
    music.play('game');
  }

  // Confete da vitória + medição do palco.
  useEffect(() => {
    if (!won) return;
    const host = stageRef.current;
    if (!host) return;
    setLevels(completeLevel(GAME_ID, faseN, estrelas()));
    sfx.star(estrelas());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: host.clientWidth, h: host.clientHeight });
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  // Narração: situação → pergunta → (modo pequeninos) opções.
  useEffect(() => {
    if (!duelo) return;
    voice.stopSpeaking();
    const t1 = window.setTimeout(() => {
      voice.speak(`${duelo.encontro.nome}: ${duelo.carta.s}`);
    }, 350);
    const t2 = window.setTimeout(() => {
      voice.speak(duelo.carta.q);
    }, 350 + Math.min(3800, duelo.carta.s.length * 32 + 900));
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [duelo?.carta.s, duelo?.encontro.id]);

  useEffect(() => {
    if (!smallKids || !duelo || feedback) return;
    const id = window.setTimeout(() => {
      voice.speakQueue(duelo.opcoes.filter((_, i) => !duelo.removidas.includes(i)));
    }, 2600 + duelo.carta.q.length * 30);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelo?.carta.s, smallKids]);

  /* --------------------------------- UI --------------------------------- */

  const jogando = !won;

  return (
    <GameShell
      title="A Palavra Certa"
      subtitle="Declare a Palavra certa e siga viagem!"
      onExit={onExit}
      onPause={jogando ? () => setPaused(true) : undefined}
      bg="bg-gradient-to-b from-sky-950 via-indigo-900 to-emerald-900"
      titleClass="text-yellow-300"
    >
      <div ref={stageRef} className="relative flex w-full max-w-4xl flex-1 flex-col gap-2">
        {/* HUD: nível + conexão */}
        <div className="flex items-start justify-between gap-2 px-1">
          <LevelHUD
            level={faseN}
            totalLevels={TOTAL_FASES}
            step={vencidos.size}
            steps={fase.encontros.length}
          />
          <div className="hud-pill flex items-center gap-1.5 px-3 py-1.5" title="Conexão com Deus">
            <Flame className="h-4 w-4 text-amber-300" />
            {Array.from({ length: CONEXAO_MAX }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                  i < conexao ? 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Palco do jogo (o canvas é anexado imperativamente num nó folha) */}
        <div className="relative w-full flex-1" style={{ minHeight: 260, maxHeight: 430 }}>
          <div
            ref={canvasRef}
            className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-white/15 bg-sky-300"
          />
          {/* Onboarding sem texto (dentro do palco, nunca solto na página) */}
          {showHand && !duelo && !won ? (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
              <HandHint />
            </div>
          ) : null}
        </div>

        {/* Controles de toque */}
        {jogando ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Andar para a esquerda"
                className="ui-press flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-lg"
                onPointerDown={(e) => {
                  e.preventDefault();
                  engineRef.current?.setInput({ left: true });
                }}
                onPointerUp={() => engineRef.current?.setInput({ left: false })}
                onPointerLeave={() => engineRef.current?.setInput({ left: false })}
                onPointerCancel={() => engineRef.current?.setInput({ left: false })}
              >
                <ArrowLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                aria-label="Andar para a direita"
                className="ui-press flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-lg"
                onPointerDown={(e) => {
                  e.preventDefault();
                  engineRef.current?.setInput({ right: true });
                }}
                onPointerUp={() => engineRef.current?.setInput({ right: false })}
                onPointerLeave={() => engineRef.current?.setInput({ right: false })}
                onPointerCancel={() => engineRef.current?.setInput({ right: false })}
              >
                <ArrowRight className="h-7 w-7" />
              </button>
            </div>
            <button
              type="button"
              aria-label="Pular"
              className="ui-press flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-amber-950 shadow-[0_6px_0_rgba(202,138,4,0.9)]"
              onPointerDown={(e) => {
                e.preventDefault();
                engineRef.current?.setInput({ jump: true });
              }}
              onPointerUp={() => engineRef.current?.setInput({ jump: false })}
              onPointerLeave={() => engineRef.current?.setInput({ jump: false })}
              onPointerCancel={() => engineRef.current?.setInput({ jump: false })}
            >
              <span className="text-2xl font-black">PULAR</span>
            </button>
            <button
              type="button"
              aria-label="Mapa das fases"
              className="ui-press flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-lg"
              onClick={() => {
                sfx.click();
                engineRef.current?.pause();
                setMapOpen(true);
              }}
            >
              <MapIcon className="h-6 w-6" />
            </button>
          </div>
        ) : null}

        {/* ─────────────────────── Duelo de Palavra ─────────────────────── */}
        {duelo ? (
          <div className="absolute inset-0 z-[65] flex items-center justify-center bg-slate-950/70 p-3">
            <div
              ref={duelRef}
              className="animate-pop flex w-full max-w-lg flex-col gap-3 rounded-3xl bg-slate-900/95 p-4 shadow-2xl ring-2 ring-white/15"
            >
              {/* Cabeçalho: personagem + situação */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="rounded-2xl bg-white/10 p-1">
                    <Npc
                      motif="palavra"
                      look={toNpcLook(duelo.encontro.look)}
                      state={feedback?.good ? 'happy' : 'idle'}
                      size={72}
                    />
                  </div>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-black text-white">
                    {duelo.encontro.guardiao ? `👑 ${duelo.encontro.nome}` : duelo.encontro.nome}
                  </span>
                </div>
                <div className="relative flex-1 rounded-2xl bg-white/10 p-3">
                  <SpeakChip text={duelo.carta.s} className="absolute -top-2 -right-2" />
                  <p className="pr-6 text-sm font-bold text-white/90">{duelo.carta.s}</p>
                  <p className="mt-2 text-base font-black text-yellow-200">{duelo.carta.q}</p>
                  {duelo.encontro.guardiao ? (
                    <p className="mt-1 text-[11px] font-bold text-white/60">
                      Rodada {duelo.rodadaGuardiao} de 3
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Opções quase iguais */}
              <div className="flex flex-col gap-2">
                {duelo.opcoes.map((op, i) => {
                  const removida = duelo.removidas.includes(i);
                  const acertou = feedback?.good && i === duelo.certa;
                  return (
                    <div key={i} className="relative">
                      <button
                        type="button"
                        disabled={removida}
                        onClick={(e) => responder(i, e)}
                        className={`ui-press w-full rounded-2xl px-4 py-3 text-left text-[15px] font-bold shadow-md transition-all ${
                          acertou
                            ? 'bg-emerald-400 text-emerald-950 ring-4 ring-emerald-300'
                            : removida
                              ? 'bg-slate-700/60 text-white/35 line-through'
                              : 'bg-white text-slate-800 hover:bg-yellow-50'
                        }`}
                      >
                        <span className="pr-7">{op}</span>
                      </button>
                      {!removida ? <SpeakChip text={op} className="absolute top-2 right-2" /> : null}
                    </div>
                  );
                })}
              </div>

              {/* Feedback de graça */}
              {feedback ? (
                <div
                  className={`rounded-2xl p-3 text-sm font-bold ${
                    feedback.good ? 'bg-emerald-500/20 text-emerald-100' : 'bg-sky-500/15 text-sky-100'
                  }`}
                >
                  <p>{feedback.text}</p>
                  {feedback.ref ? (
                    <p className="mt-1 text-xs font-black text-yellow-300">📖 {feedback.ref}</p>
                  ) : null}
                  {feedback.good ? (
                    <button
                      type="button"
                      onClick={continuarDuelo}
                      className="ui-press mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 px-6 py-2.5 font-black text-amber-950 shadow-[0_5px_0_rgba(202,138,4,0.9)]"
                    >
                      {duelo.encontro.guardiao && duelo.rodadaGuardiao < 3
                        ? 'Próxima rodada'
                        : 'Continuar'}
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <p className="mt-1 text-xs text-white/70">Toque na resposta certa para seguir.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Mapa das fases */}
        {mapOpen ? (
          <LevelMap
            title="Mapa da jornada"
            subtitle="Escolha a fase que quiser jogar!"
            items={FASES.map((f) => {
              const rec = levelRecordSafe(levels, GAME_ID, f.n);
              return {
                id: String(f.n),
                label: `${f.n}. ${f.nome}`,
                sublabel: f.sub,
                stars: rec.best,
                maxStars: 3,
                locked: !isLevelUnlocked(levels, GAME_ID, f.n),
                done: rec.plays > 0,
                emoji: BIOME_EMOJI[f.biome],
              };
            })}
            onPick={(id) => irParaFase(Number(id))}
            onClose={() => {
              sfx.close();
              setMapOpen(false);
              engineRef.current?.resume();
            }}
          />
        ) : null}

        {/* Pausa */}
        {paused ? (
          <PauseOverlay
            title="Pausa na jornada"
            onResume={() => {
              setPaused(false);
              engineRef.current?.resume();
            }}
            onRestart={() => {
              setPaused(false);
              setWrongCount(0);
              setConexao(CONEXAO_MAX);
              setVencidos(new Set());
              usadas.current = new Set();
              engineRef.current?.reset();
              engineRef.current?.resume();
            }}
            onExit={onExit}
          />
        ) : null}

        {/* Fim de fase */}
        {won && !reducedMotion ? (
          <Confetti
            width={size.w || 320}
            height={size.h || 480}
            recycle={false}
            numberOfPieces={confettiPieces()}
            gravity={confettiGravity()}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          />
        ) : null}
        {won ? (
          <div className="absolute inset-0 z-[75] flex items-center justify-center bg-slate-950/75 p-4">
            <LevelDone
              stars={estrelas()}
              wrong={wrongCount}
              headline={
                faseN === TOTAL_FASES
                  ? 'Jornada completa! 🌟'
                  : `Fase ${faseN} concluída!`
              }
              lesson={
                faseN === TOTAL_FASES
                  ? 'Você chegou ao Portão da Luz declarando a Palavra! Deus fará todas as coisas novas. 🌈'
                  : `Você atravessou ${fase.nome} declarando a Palavra certa. ${fase.sub} — Deus segue com você! ✨`
              }
              onNext={faseN < TOTAL_FASES ? proximaFase : undefined}
              onOpenMap={() => {
                setWon(false);
                setMapOpen(true);
              }}
              onExit={onExit}
            />
          </div>
        ) : null}
      </div>
    </GameShell>
  );
}

function levelRecordSafe(map: ProgressMap, gameId: string, level: number) {
  return map[gameId]?.[level] ?? { best: 0, plays: 0 };
}
