// "A Grande Jornada" — platformer bíblico (GAME_DESIGN.md §6.1, ADR-010).
//
// Casca React: o motor (`lib/jornada/`) roda fora do React; aqui só entram
// eventos discretos (coleta, queda, portão), pausa, mapa de etapas e estrelas.
// 🔒 Referência NAA aparece DEPOIS da ação, como prêmio (regra de ouro).

import { useCallback, useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import GameShell from '../GameShell';
import HandHint from '../HandHint';
import LevelDone from '../LevelDone';
import LevelHUD from '../LevelHUD';
import LevelMap from '../LevelMap';
import PauseOverlay from '../PauseOverlay';
import RotateHint from '../RotateHint';
import { JORNADA_CREDITO, JORNADA_GAME_LEVELS, JORNADA_LEVELS } from '../../data/jornada';
import { useIsPortraitPhone } from '../../lib/device';
import { JornadaEngine, type EngineEvent } from '../../lib/jornada';
import { levelMapItems, useLevelState } from '../../lib/levels';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { music, sfx, voice } from '../../lib/audio';
import { prefersReducedMotion, usePrefersReducedMotion } from '../../lib/motion';
import { isFirstTime, isSmallKidsMode, markPlayed } from '../../lib/prefs';

const GAME_ID = 'a-grande-jornada';
const ACT_EMOJI = ['🌅', '🌿', '⛰️', '✨'];

export default function GameAGrandeJornada({ onExit }: { onExit: () => void }) {
  const ls = useLevelState(GAME_ID, JORNADA_GAME_LEVELS);
  const level = ls.round ?? JORNADA_LEVELS[0];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<JornadaEngine | null>(null);
  const onEventRef = useRef<(e: EngineEvent) => void>(() => {});
  const keys = useRef({ left: false, right: false, jump: false });
  const msgTimer = useRef(0);
  const lastSpeak = useRef({ text: '', at: 0 });
  const [paused, setPaused] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [seeds, setSeeds] = useState(0);
  const [rotateOk, setRotateOk] = useState(false);
  const [showHand, setShowHand] = useState(false);
  // A narrativa de entrada aparece uma vez por etapa, sobre o cenário novo —
  // é onde a criança sabe ONDE está e COMO é o lugar antes de correr (ADR-010).
  const [intro, setIntro] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const portraitPhone = useIsPortraitPhone();

  /* ------------------------------- mensagens ------------------------------ */

  const showMessage = useCallback((text: string) => {
    setMsg(text);
    window.clearTimeout(msgTimer.current);
    msgTimer.current = window.setTimeout(() => setMsg(null), 4800);
    const now = Date.now();
    if (lastSpeak.current.text !== text || now - lastSpeak.current.at > 3200) {
      lastSpeak.current = { text, at: now };
      voice.speak(text);
    }
  }, []);

  /* --------------------------------- eventos ------------------------------ */

  onEventRef.current = (e: EngineEvent) => {
    switch (e.type) {
      case 'seed':
        sfx.collect();
        setSeeds(e.total);
        break;
      case 'shield':
        sfx.badge();
        break;
      case 'checkpoint':
        sfx.streak(1);
        break;
      case 'fall':
        // Punição única: volta ao Marco — sem perder semente, selo ou estrela.
        sfx.gentle();
        ls.addWrong();
        break;
      case 'stomp':
      case 'flower':
        sfx.pop();
        break;
      case 'rocha':
        sfx.open();
        break;
      case 'muro':
        sfx.streak(2);
        break;
      case 'canto':
        sfx.streak(2);
        break;
      case 'pray':
        sfx.open();
        break;
      case 'detour':
        sfx.close();
        break;
      case 'gate':
        // Referência da etapa como prêmio (a lição aparece na tela de fim).
        ls.completeRound();
        break;
      case 'message':
        showMessage(e.text);
        break;
    }
  };

  /* ------------------------------ ciclo do motor -------------------------- */

  useEffect(() => {
    if (ls.phase !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new JornadaEngine(level, {
      smallKids: isSmallKidsMode(),
      reducedMotion: prefersReducedMotion(),
      onEvent: (e) => onEventRef.current(e),
    });
    engine.canvas = canvas;
    engineRef.current = engine;
    engine.start();
    setSeeds(0);
    setMsg(null);
    const t = window.setTimeout(() => voice.speak(level.name), 450);
    return () => {
      window.clearTimeout(t);
      engine.stop();
      engineRef.current = null;
    };
    // `level` muda junto com `levelIdx` (1 rodada por etapa).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ls.levelIdx, ls.phase]);

  // Pausa de verdade: o laço para, a voz cala e a música recolhe.
  useEffect(() => {
    if (paused || ls.mapOpen) {
      engineRef.current?.pause();
      voice.stopSpeaking();
      music.pause();
    } else {
      engineRef.current?.resume();
      music.play('game');
    }
  }, [paused, ls.mapOpen]);

  useEffect(() => {
    music.play('game');
    return () => {
      voice.stopSpeaking();
      window.clearTimeout(msgTimer.current);
    };
  }, []);

  /* --------------------------------- entrada ------------------------------ */

  const syncKeys = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.setMove(keys.current.left, keys.current.right);
    eng.setJump(keys.current.jump);
  }, []);

  const stopHand = useCallback(() => {
    if (!showHand) return;
    setShowHand(false);
    markPlayed();
  }, [showHand]);

  useEffect(() => {
    setShowHand(isFirstTime());
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const eng = engineRef.current;
      if (k === 'arrowleft' || k === 'a') keys.current.left = true;
      else if (k === 'arrowright' || k === 'd') keys.current.right = true;
      else if (k === ' ' || k === 'arrowup' || k === 'w') keys.current.jump = true;
      else if (k === 'c' || k === 'x') {
        eng?.canto();
        stopHand();
        return;
      } else if (k === 'p' || k === 'enter') {
        eng?.pray();
        stopHand();
        return;
      } else if (k === 'escape') {
        setPaused((p) => !p);
        return;
      } else return;
      e.preventDefault();
      syncKeys();
      stopHand();
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.current.left = false;
      else if (k === 'arrowright' || k === 'd') keys.current.right = false;
      else if (k === ' ' || k === 'arrowup' || k === 'w') keys.current.jump = false;
      else return;
      syncKeys();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [syncKeys, stopHand]);

  const bindMove = (dir: 'left' | 'right') => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      keys.current[dir] = true;
      syncKeys();
      stopHand();
    },
    onPointerUp: () => {
      keys.current[dir] = false;
      syncKeys();
    },
    onPointerLeave: () => {
      keys.current[dir] = false;
      syncKeys();
    },
    onPointerCancel: () => {
      keys.current[dir] = false;
      syncKeys();
    },
  });

  const bindJump = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      keys.current.jump = true;
      syncKeys();
      stopHand();
    },
    onPointerUp: () => {
      keys.current.jump = false;
      syncKeys();
    },
    onPointerLeave: () => {
      keys.current.jump = false;
      syncKeys();
    },
    onPointerCancel: () => {
      keys.current.jump = false;
      syncKeys();
    },
  };

  /* --------------------------------- tamanho ------------------------------ */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [ls.phase]);

  /* ---------------------------------- telas ------------------------------- */

  // Ao trocar de etapa, a narrativa de entrada volta a aparecer.
  useEffect(() => {
    setIntro(true);
  }, [ls.levelIdx]);

  const mapItems = levelMapItems(
    GAME_ID,
    JORNADA_GAME_LEVELS,
    (i, l) => l.name ?? `Etapa ${i + 1}`,
    (i) => JORNADA_LEVELS[i]?.ref ?? '',
    (i) => ACT_EMOJI[(JORNADA_LEVELS[i]?.act ?? 1) - 1],
  );

  if (ls.phase === 'done') {
    const last = !ls.hasNextLevel;
    return (
      <GameShell
        title="A Grande Jornada"
        subtitle={level.name}
        bg="bg-gradient-to-b from-indigo-950 via-slate-900 to-amber-100"
        titleClass="text-amber-300"
        onExit={onExit}
      >
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <div className="flex flex-col items-center gap-3 px-4 pb-8">
          <span className="hud-pill px-5 py-2 text-sm font-black text-white">
            {level.ref}
          </span>
          <p className="max-w-md rounded-3xl bg-white/90 px-5 py-3 text-center text-base font-bold text-slate-800">
            {level.lesson}
          </p>
          <LevelDone
            stars={ls.stars}
            wrong={ls.wrong}
            headline={last ? 'A Grande Jornada concluída!' : `${level.name} — etapa concluída!`}
            lesson={last ? 'Deus cuidou de cada passo. Agora é hora de cuidar dos outros. (Mt 28.19)' : undefined}
            onNext={ls.hasNextLevel ? ls.goNextLevel : undefined}
            onExit={onExit}
            onOpenMap={() => ls.setMapOpen(true)}
            celebrate={false}
          />
          <button
            type="button"
            onClick={ls.replayLevel}
            className="ui-press rounded-full bg-white/20 px-6 py-2 text-sm font-black text-white"
          >
            Jogar esta etapa de novo 🔁
          </button>
          <p className="max-w-md text-center text-[11px] font-semibold text-white/70">
            {JORNADA_CREDITO}
            <br />
            NAA — Nova Almeida Atualizada® © 2017 Sociedade Bíblica do Brasil. Usada com permissão.
          </p>
        </div>
        {ls.mapOpen ? (
          <LevelMap
            title="As 12 etapas"
            subtitle="Cada etapa guarda uma referência da Bíblia"
            items={mapItems}
            onPick={(id) => ls.goToLevel(JORNADA_GAME_LEVELS.findIndex((l) => l.id === id))}
            onClose={() => ls.setMapOpen(false)}
          />
        ) : null}
      </GameShell>
    );
  }

  return (
    <GameShell
      title="A Grande Jornada"
      subtitle={`${level.name} · ${level.ref}`}
      bg="bg-gradient-to-b from-indigo-950 via-slate-900 to-amber-100"
      titleClass="text-amber-300"
      onPause={() => setPaused(true)}
      onExit={onExit}
    >
      <div className="flex w-full flex-col items-center gap-2 px-3 pb-4">
        <LevelHUD level={ls.levelIdx + 1} totalLevels={JORNADA_GAME_LEVELS.length} />

        <div className="game-surface relative w-full max-w-3xl overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl">
          <canvas ref={canvasRef} className="block h-[46vh] max-h-[420px] min-h-[240px] w-full" />

          {/* Narrativa de entrada: o marco de Bunyan e onde o Peregrino está. */}
          {intro ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/85 px-4 py-4 text-center">
              <span className="hud-pill px-4 py-1.5 text-xs font-black text-amber-300">
                {level.marco}
              </span>
              <p className="max-w-lg text-balance text-base font-bold leading-snug text-white sm:text-lg">
                {level.cenario}
              </p>
              <span className="text-xs font-semibold text-white/70">{level.ref}</span>
              <button
                type="button"
                onClick={() => {
                  setIntro(false);
                  stopHand();
                }}
                className="ui-press rounded-full bg-amber-300 px-7 py-3 text-base font-black text-slate-900 shadow-lg"
              >
                Vamos seguir ➜
              </button>
            </div>
          ) : null}

          {msg ? (
            <p className="pointer-events-none absolute inset-x-3 top-3 rounded-2xl bg-slate-950/80 px-4 py-2 text-center text-sm font-bold text-white shadow">
              {msg}
            </p>
          ) : null}

          {showHand ? <HandHint className="absolute bottom-24 left-1/2 -translate-x-1/2" /> : null}

          {/* Controles de toque — alvos grandes, uma mão só (skill §6). */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
            <div className="pointer-events-auto flex gap-2">
              <button
                type="button"
                aria-label="Andar para a esquerda"
                {...bindMove('left')}
                className="ui-press flex h-16 w-16 items-center justify-center rounded-2xl bg-white/85 text-3xl font-black text-slate-800 shadow-lg"
              >
                ◀
              </button>
              <button
                type="button"
                aria-label="Andar para a direita"
                {...bindMove('right')}
                className="ui-press flex h-16 w-16 items-center justify-center rounded-2xl bg-white/85 text-3xl font-black text-slate-800 shadow-lg"
              >
                ▶
              </button>
            </div>
            <div className="pointer-events-auto flex items-end gap-2">
              <button
                type="button"
                aria-label="Orar (acender a luz)"
                onPointerDown={(e) => {
                  e.preventDefault();
                  engineRef.current?.pray();
                  stopHand();
                }}
                className="ui-press flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-300/95 text-2xl shadow-lg"
              >
                🙏
              </button>
              <button
                type="button"
                aria-label="Cantar (derrubar o muro de Jericó)"
                onPointerDown={(e) => {
                  e.preventDefault();
                  engineRef.current?.canto();
                  stopHand();
                }}
                className="ui-press flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-300/95 text-2xl shadow-lg"
              >
                🎵
              </button>
              <button
                type="button"
                aria-label="Pular"
                {...bindJump}
                className="ui-press flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/95 text-4xl shadow-lg"
              >
                ⤒
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs font-bold text-white/80">
          Sementes: {seeds} · Segure para pular mais alto · 🙏 acende a luz · 🎵 canta
        </p>
      </div>

      {paused ? (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onRestart={() => {
            engineRef.current?.restart();
            setPaused(false);
          }}
          onExit={onExit}
        />
      ) : null}

      {ls.mapOpen ? (
        <LevelMap
          title="As 12 etapas"
          subtitle="Cada etapa guarda uma referência da Bíblia"
          items={mapItems}
          onPick={(id) => ls.goToLevel(JORNADA_GAME_LEVELS.findIndex((l) => l.id === id))}
          onClose={() => ls.setMapOpen(false)}
        />
      ) : null}

      <RotateHint show={portraitPhone && !rotateOk} onContinue={() => setRotateOk(true)} />
    </GameShell>
  );
}
