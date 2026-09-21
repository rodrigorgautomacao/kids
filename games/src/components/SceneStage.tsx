// Palco de teatro da Aventura (Fase 6) — decisão D11 do ADR-004.
//
// Quando a criança escolhe uma história no menu do personagem, o mundo vira
// um PALCO: cortina abre, refletores acendem, o cenário de fundo (`Backdrop`)
// aparece, o personagem entra com adereços e a história acontece em ATOS
// narrados (cada "Continuar ▶" avança um ato). No fim, uma perguntinha vale
// a FIGURINHA da cena (coleção — skill jogos-game-design §12).
//
// Acessibilidade/ritmo: todo áudio tem texto na tela (o texto nunca depende
// da narração); no modo pequeninos as opções do quiz também são narradas em
// fila (quem não lê precisa OUVIR as escolhas — ver skill jogos-audio §8).

import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Volume2, X } from 'lucide-react';
import { Backdrop, Npc } from './art';
import { usePrefersReducedMotion } from '../lib/motion';
import { confettiGravity, confettiPieces } from '../lib/confetti';
import { sfx, voice } from '../lib/audio';
import { collectSticker } from '../lib/stickers';
import { t } from '../lib/i18n';
import type { Scene, SceneChoice } from '../data/scenes';

type Phase = 'acts' | 'quiz' | 'won';

interface SceneStageProps {
  scene: Scene;
  /** chave de `LOOKS` do narrador/ator principal (ex.: 'moises') */
  npcPreset: string;
  /** id da estação para o motivo no peito do NPC */
  npcMotif: string;
  smallKids: boolean;
  /** volta ao mundo — chamado ao fechar */
  onExit: () => void;
  /** notifica a Aventura que a figurinha mudou (para marcar no menu) */
  onCollect?: (scene: Scene) => void;
}

/** Posições dos adereços no palco (lados do personagem, em % da área). */
const PROP_SLOTS = [
  { left: '14%', top: '70%', delay: '0s' },
  { left: '72%', top: '64%', delay: '0.5s' },
  { left: '26%', top: '46%', delay: '1s' },
  { left: '66%', top: '42%', delay: '0.25s' },
];

export default function SceneStage({ scene, npcPreset, npcMotif, smallKids, onExit, onCollect }: SceneStageProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('acts');
  const [act, setAct] = useState(0);
  const [removed, setRemoved] = useState<string[]>([]);
  const [fails, setFails] = useState(0);
  const [options, setOptions] = useState<SceneChoice[]>([]);
  const collected = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  // Cortina abre um instante após montar (efeito de "luzes, câmera…").
  useEffect(() => {
    const id = window.setTimeout(() => setOpen(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  /* ------------------------------ narração ------------------------------ */
  // Cada ato é narrado ao entrar; o texto continua na tela para quem não
  // ouvir nem precisar de voz (todo áudio tem par textual).
  useEffect(() => {
    if (phase !== 'acts') return;
    voice.speak(scene.acts[act] ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, act, phase]);

  // Perguntinha: narra a pergunta e, no modo pequeninos, as opções em fila.
  useEffect(() => {
    if (phase !== 'quiz') return;
    voice.speak(scene.q);
    const id = window.setTimeout(() => {
      if (smallKids) voice.speakQueue(options.map((o) => o.t));
    }, Math.min(4500, Math.max(2400, scene.q.length * 30)));
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, scene.id, options]);

  useEffect(() => () => voice.stopSpeaking(), []);

  /* ------------------------------- ações ------------------------------- */
  function startQuiz() {
    sfx.open();
    setFails(0);
    setRemoved([]);
    // Modo pequeninos: 3 opções (certa + 2); padrão: 4 (certa + 3).
    const wrongs = scene.wrongs.slice(0, smallKids ? 2 : 3);
    setOptions([scene.right, ...wrongs].sort(() => Math.random() - 0.5));
    setPhase('quiz');
  }

  function advance() {
    if (act + 1 < scene.acts.length) {
      sfx.pop();
      setAct((a) => a + 1);
    } else {
      startQuiz();
    }
  }

  function answer(opt: SceneChoice) {
    if (opt.t === scene.right.t) {
      sfx.correct(fails === 0 ? 2 : 0);
      if (!collected.current) {
        collected.current = true;
        collectSticker(scene.id);
        onCollect?.(scene);
        sfx.sticker();
      }
      sfx.badge();
      sfx.star(3);
      voice.speak(`${scene.title}. Leia em ${scene.ref}. Você ganhou a figurinha!`);
      setPhase('won');
      return;
    }
    sfx.wrong();
    setFails((f) => f + 1);
    setRemoved((list) => (list.includes(opt.t) ? list : [...list, opt.t]));
    voice.speak('Quase! Uma opção errada saiu do caminho.');
  }

  function replay() {
    setPhase('acts');
    setAct(0);
    voice.stopSpeaking();
  }

  const showProps = phase !== 'won';

  return (
    <div className="absolute inset-0 z-[70] flex flex-col bg-black/75 p-2 sm:p-3" role="dialog" aria-label={scene.title}>
      {phase === 'won' && !reducedMotion ? (
        <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
      ) : null}

      {/* barra superior: fechar + título + referência */}
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="Fechar"
          className="ui-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white shadow-lg"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-base font-black text-white drop-shadow sm:text-xl">🎭 {scene.title}</p>
          <p className="text-[11px] font-bold text-amber-300 sm:text-sm">📖 {scene.ref}</p>
        </div>
        <span className="h-10 w-10 shrink-0" />
      </div>

      {/* ---------------- palco ---------------- */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] shadow-2xl ring-4 ring-white/15">
        {/* cenário */}
        <div className="absolute inset-0">
          <Backdrop id={scene.backdrop} />
        </div>

        {/* refletores */}
        <svg className="pointer-events-none absolute inset-0" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="spotL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fef9c3" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="spotR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fef9c3" stopOpacity="0.5" />
              <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="150,0 210,0 300,300 90,300" fill="url(#spotL)" />
          <polygon points="196,0 250,0 330,300 170,300" fill="url(#spotR)" />
        </svg>

        {showProps
          ? scene.props.slice(0, 4).map((p, i) => (
              <span
                key={i}
                aria-hidden
                className="text-3xl drop-shadow-lg sm:text-4xl"
                style={{
                  position: 'absolute',
                  left: PROP_SLOTS[i].left,
                  top: PROP_SLOTS[i].top,
                  animation: 'float 3.5s ease-in-out infinite',
                  animationDelay: PROP_SLOTS[i].delay,
                  zIndex: 10,
                }}
              >
                {p}
              </span>
            ))
          : null}

        {/* personagem no proscênio */}
        <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 drop-shadow-2xl">
          <Npc
            motif={npcMotif}
            preset={npcPreset}
            state={phase === 'won' ? 'happy' : 'idle'}
            size={150}
            className={phase === 'won' ? '' : 'animate-hero-sway'}
          />
        </div>

        {/* cortina pleated, abre na montagem */}
        <div
          aria-hidden
          className={`absolute top-0 left-0 h-full w-[16%] transition-transform duration-700 ease-out ${
            open ? '-translate-x-[115%]' : ''
          }`}
          style={{
            background:
              'repeating-linear-gradient(90deg, #dc2626 0 14px, #b91c1c 14px 22px, #ef4444 22px 30px)',
            zIndex: 30,
          }}
        />
        <div
          aria-hidden
          className={`absolute top-0 right-0 h-full w-[16%] transition-transform duration-700 ease-out ${
            open ? 'translate-x-[115%]' : ''
          }`}
          style={{
            background:
              'repeating-linear-gradient(270deg, #dc2626 0 14px, #b91c1c 14px 22px, #ef4444 22px 30px)',
            zIndex: 30,
          }}
        />

        {/* ---------------- atos ---------------- */}
        {phase === 'acts' ? (
          <div className="absolute inset-x-0 bottom-0 z-40 p-3 sm:p-4">
            <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-3xl bg-white/95 p-4 text-center shadow-2xl sm:p-5">
              <p className="min-h-14 text-lg font-extrabold text-slate-800 sm:text-xl">{scene.acts[act]}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => voice.speak(scene.acts[act] ?? '')}
                  aria-label={t('stage.ouvir')}
                  className="ui-press flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-800 shadow"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
                <span className="flex gap-1.5">
                  {scene.acts.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 w-2.5 rounded-full ${i === act ? 'bg-amber-400' : 'bg-slate-200'}`}
                    />
                  ))}
                </span>
              </div>
              <button
                type="button"
                onClick={advance}
                className="ui-press w-full rounded-full bg-emerald-500 px-8 py-4 text-xl font-black text-white shadow-[0_8px_0_rgba(5,150,105,0.9)] hover:scale-105 sm:text-2xl"
              >
                {act + 1 < scene.acts.length ? t('stage.continuar') : 'Perguntinha 🤔'}
              </button>
            </div>
          </div>
        ) : null}

        {/* ---------------- perguntinha ---------------- */}
        {phase === 'quiz' ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 p-3">
            <div className="flex w-full max-w-2xl flex-col items-center gap-3 rounded-3xl bg-white/95 p-4 shadow-2xl sm:gap-4 sm:p-6">
              <p className="text-center text-lg font-black text-indigo-900 sm:text-xl">{scene.q}</p>
              <button
                type="button"
                onClick={() => voice.speak(scene.q)}
                aria-label={t('stage.pergunta-nova')}
                className="ui-press flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-sky-800 shadow"
              >
                <Volume2 className="h-4 w-4" /> {t('stage.pergunta-nova')}
              </button>
              <div className="grid w-full grid-cols-2 gap-3">
                {options.map((opt, i) => {
                  const gone = removed.includes(opt.t);
                  return (
                    <div key={opt.t} className={`relative ${!gone && i === options.length - 1 ? 'col-span-2' : ''}`}>
                      <button
                        type="button"
                        disabled={gone}
                        onClick={() => answer(opt)}
                        aria-label={`Responder: ${opt.t}`}
                        className={`ui-press flex min-h-16 w-full items-center justify-center gap-2 rounded-3xl border-2 px-3 py-3 pr-12 font-bold shadow-md ${
                          gone
                            ? 'border-slate-200 bg-slate-100 text-slate-400 line-through opacity-60'
                            : 'border-slate-200 bg-white text-slate-600 hover:scale-105'
                        } ${smallKids ? 'text-lg' : 'text-base'}`}
                      >
                        <span className={smallKids ? 'text-3xl' : 'text-2xl'}>{opt.e}</span> {opt.t}
                      </button>
                      {!gone ? (
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            sfx.pop();
                            voice.speak(opt.t);
                          }}
                          aria-label={`Ouvir: ${opt.t}`}
                          className="ui-press absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-amber-300 text-amber-950 shadow-md"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {removed.length > 0 ? (
                <p className="rounded-full bg-amber-100 px-4 py-1 text-sm font-black text-amber-800">
                  💡 {removed.length} {removed.length === 1 ? t('stage.erradas') : t('stage.erradas-pl')}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ---------------- figurinha! ---------------- */}
        {phase === 'won' ? (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/55 p-4">
            <div className="animate-pop flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl bg-white/95 p-6 text-center shadow-2xl">
              <p className="text-sm font-black text-emerald-700 uppercase">{t('stage.figurinha-nova')}</p>
              <span className="animate-float flex h-28 w-28 items-center justify-center rounded-full border-8 border-amber-300 bg-gradient-to-b from-amber-100 to-orange-100 text-6xl shadow-[0_6px_0_rgba(202,138,4,0.55)]">
                {scene.sticker}
              </span>
              <p className="text-lg font-black text-slate-800">{scene.title}</p>
              <p className="text-xs font-bold text-slate-500">
                {t('stage.coletada')} {scene.sticker} · 📖 {scene.ref}
              </p>
              <div className="mt-1 flex w-full flex-col gap-2">
                <button
                  type="button"
                  onClick={onExit}
                  className="ui-press w-full rounded-full bg-emerald-500 px-8 py-4 text-xl font-black text-white shadow-[0_6px_0_rgba(5,150,105,0.9)]"
                >
                  {t('stage.voltar')}
                </button>
                <button
                  type="button"
                  onClick={replay}
                  className="ui-press w-full rounded-full bg-white px-6 py-3 text-base font-bold text-slate-700 shadow ring-1 ring-slate-200"
                >
                  {t('stage.ver-novo')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}