// Trilha sonora autoral, gerada por síntese (decisão D6 do ADR-002).
//
// Por que síntese em vez de arquivos:
// - licença limpa (não depende de faixa CC0 de terceiros), peso ~zero, offline;
// - permite música ADAPTATIVA de graça: as camadas entram/saem conforme o
//   desempenho (combo/streak), sem precisar de várias versões mixadas.
//
// Estrutura: um agendador com lookahead (padrão Web Audio) agenda as notas um
// pouco à frente do relógio, o que mantém o ritmo estável mesmo com a aba
// ocupada. Cada cena tem BPM, progressão e melodia próprios.

import { audioNow, getAudioContext, getMusicBus } from './context';
import { isMusicMuted } from './preferences';

export type MusicScene = 'hub' | 'game' | 'victory';

interface SceneDef {
  bpm: number;
  /** 4 compassos; cada acorde é um compasso (8 colcheias). */
  chords: number[][];
  /** Melodia por passo (32 passos = 4 compassos). */
  melody: Array<number | null>;
  /** Tipo de onda da melodia. */
  melodyType: OscillatorType;
}

/** Constrói um padrão de 32 passos a partir de pares [passo, nota]. */
function pattern(pairs: Array<[number, number]>): Array<number | null> {
  const out: Array<number | null> = new Array(32).fill(null);
  for (const [step, midi] of pairs) out[step % 32] = midi;
  return out;
}

const SCENES: Record<MusicScene, SceneDef> = {
  // Hub: calmo e acolhedor (C Am F G).
  hub: {
    bpm: 92,
    chords: [
      [60, 64, 67],
      [57, 60, 64],
      [53, 57, 60],
      [55, 59, 62],
    ],
    melody: pattern([
      [0, 76],
      [4, 79],
      [8, 81],
      [12, 76],
      [16, 77],
      [20, 81],
      [24, 79],
      [28, 74],
    ]),
    melodyType: 'sine',
  },
  // Jogo: um pouco mais vivo, com movimento (F C G Am).
  game: {
    bpm: 106,
    chords: [
      [53, 57, 60],
      [60, 64, 67],
      [55, 59, 62],
      [57, 60, 64],
    ],
    melody: pattern([
      [0, 72],
      [2, 76],
      [4, 79],
      [6, 76],
      [8, 84],
      [10, 79],
      [12, 76],
      [14, 72],
      [16, 79],
      [18, 74],
      [20, 79],
      [22, 83],
      [24, 81],
      [26, 76],
      [28, 74],
      [30, 72],
    ]),
    melodyType: 'triangle',
  },
  // Vitória: mais rápido e brilhante (C F G C), uma oitava acima.
  victory: {
    bpm: 124,
    chords: [
      [60, 64, 67],
      [53, 57, 60],
      [55, 59, 62],
      [60, 64, 67],
    ],
    melody: pattern([
      [0, 84],
      [2, 88],
      [4, 91],
      [6, 88],
      [8, 84],
      [10, 88],
      [12, 86],
      [14, 81],
      [16, 83],
      [18, 86],
      [20, 91],
      [22, 88],
      [24, 84],
      [26, 88],
      [28, 91],
      [30, 96],
    ]),
    melodyType: 'triangle',
  },
};

/** Volumes por camada (música bem abaixo dos efeitos — skill jogos-audio §1). */
const PAD_VOL = 0.026;
const BASS_VOL = 0.05;
const MELODY_VOL = 0.034;
const KICK_VOL = 0.04;
const HAT_VOL = 0.012;

/** Intensidade adaptativa: 0 = só base · 1 = melodia esparsa · 2 = melodia cheia · 3 = +percussão. */
export type Intensity = 0 | 1 | 2 | 3;

const LOOKAHEAD_S = 0.12;
const TICK_MS = 40;

let schedulerId: number | null = null;
let scene: MusicScene | null = null;
let pending: MusicScene | null = null;
let step = 0;
let nextTime = 0;
let intensity: Intensity = 0;
let paused = false;
let melodyMode: 0 | 1 | 2 = 0;
let percOn = false;

const mtof = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

function layerNote(
  dest: AudioNode,
  midi: number,
  at: number,
  dur: number,
  vol: number,
  type: OscillatorType,
  filter: number,
  attack = 0.03,
) {
  const ac = getAudioContext();
  if (!ac) return;
  try {
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = filter;
    lp.Q.value = 0.6;
    lp.connect(dest);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(vol, at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    gain.connect(lp);

    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(mtof(midi), at);
    osc.connect(gain);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  } catch {
    /* ignore */
  }
}

function kick(at: number) {
  const ac = getAudioContext();
  if (!ac) return;
  try {
    const gain = ac.createGain();
    gain.gain.setValueAtTime(KICK_VOL, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
    gain.connect(getMusicBus() ?? ac.destination);
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, at);
    osc.frequency.exponentialRampToValueAtTime(70, at + 0.12);
    osc.connect(gain);
    osc.start(at);
    osc.stop(at + 0.18);
  } catch {
    /* ignore */
  }
}

function hat(at: number) {
  const ac = getAudioContext();
  if (!ac) return;
  try {
    const gain = ac.createGain();
    gain.gain.setValueAtTime(HAT_VOL, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6000;
    gain.connect(getMusicBus() ?? ac.destination);
    hp.connect(gain);
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(9000, at);
    osc.connect(hp);
    osc.start(at);
    osc.stop(at + 0.06);
  } catch {
    /* ignore */
  }
}

function scheduleStep(def: SceneDef, index: number, at: number, stepDur: number) {
  const bus = getMusicBus();
  if (!bus) return;
  const bar = Math.floor(index / 8) % def.chords.length;
  const inBar = index % 8;
  const chord = def.chords[bar];

  // Base: acorde sustentado (pad suave).
  if (inBar === 0) {
    const dur = stepDur * 7.6;
    for (const midi of chord) {
      layerNote(bus, midi, at, dur, PAD_VOL, 'sine', 1800, 0.12);
      layerNote(bus, midi, at, dur, PAD_VOL * 0.35, 'triangle', 1400, 0.2);
    }
  }

  // Baixo: fundamental nos tempos 1 e 3.
  if (inBar === 0 || inBar === 4) {
    layerNote(bus, chord[0] - 24, at, stepDur * 3.4, BASS_VOL, 'triangle', 700, 0.02);
  }

  // Melodia (camadas adaptativas).
  if (melodyMode > 0) {
    const notas = def.melody;
    const midi = notas[index % 32];
    const outro = notas[(index + 1) % 32];
    const play = midi !== null && (melodyMode === 2 || outro === null);
    if (play && midi !== null) {
      layerNote(bus, midi, at, stepDur * 1.6, MELODY_VOL, def.melodyType, 3200, 0.02);
    }
  }

  // Percussão suave (só na intensidade máxima).
  if (percOn) {
    if (inBar === 0 || inBar === 4) kick(at);
    if (inBar % 2 === 1) hat(at);
  }
}

function tick() {
  const ac = getAudioContext();
  if (!ac || !scene) return;
  const def = SCENES[scene];
  const stepDur = 60 / def.bpm / 2;
  if (nextTime < ac.currentTime) nextTime = ac.currentTime + 0.05;
  while (nextTime < ac.currentTime + LOOKAHEAD_S) {
    scheduleStep(def, step, nextTime, stepDur);
    step += 1;
    nextTime += stepDur;
  }
}

function startScheduler() {
  if (schedulerId !== null) return;
  step = 0;
  nextTime = audioNow() + 0.08;
  tick();
  schedulerId = window.setInterval(tick, TICK_MS);
}

function stopScheduler() {
  if (schedulerId === null) return;
  window.clearInterval(schedulerId);
  schedulerId = null;
}

function fadeMusic(to: number, seconds: number) {
  const ac = getAudioContext();
  const bus = getMusicBus();
  if (!ac || !bus) return;
  try {
    bus.gain.cancelScheduledValues(ac.currentTime);
    bus.gain.setValueAtTime(bus.gain.value, ac.currentTime);
    bus.gain.linearRampToValueAtTime(to, ac.currentTime + seconds);
  } catch {
    /* ignore */
  }
}

/**
 * Troca a faixa da cena atual. Se o áudio ainda não foi destravado, guarda a
 * intenção e `sync()` aplica depois do primeiro gesto.
 */
export function playMusic(next: MusicScene, fade = 0.5) {
  if (isMusicMuted()) {
    pending = next;
    scene = next;
    return;
  }
  const ac = getAudioContext();
  if (!ac || ac.state !== 'running') {
    pending = next;
    return;
  }
  if (scene === next && schedulerId !== null && !paused) return;

  pending = null;
  if (schedulerId !== null && scene !== next) {
    fadeMusic(0, 0.25);
    stopScheduler();
  }
  scene = next;
  paused = false;
  startScheduler();
  fadeMusic(1, fade);
}

/** Para a música (com fade) e esquece a cena. */
export function stopMusic(fade = 0.35) {
  fadeMusic(0, fade);
  stopScheduler();
  scene = null;
  pending = null;
}

/** Pausa (aba em segundo plano, modal). */
export function pauseMusic() {
  if (paused) return;
  paused = true;
  fadeMusic(0, 0.3);
  stopScheduler();
}

/** Retoma a última cena. */
export function resumeMusic() {
  if (!paused || !scene) return;
  paused = false;
  playMusic(scene, 0.45);
}

/** Reaplica a cena guardada — chamar depois de `unlockAudio()`. */
export function syncMusic() {
  const ac = getAudioContext();
  if (!ac || ac.state !== 'running') return;
  if (isMusicMuted()) return;
  const target = pending ?? scene;
  if (target) playMusic(target);
}

/** Muda a camada adaptativa sem trocar de faixa. */
export function setIntensity(level: number) {
  const next = Math.max(0, Math.min(3, Math.round(level))) as Intensity;
  intensity = next;
  melodyMode = next >= 2 ? 2 : next >= 1 ? 1 : 0;
  percOn = next >= 3;
  // se a música está ligada e a percussão entrou agora, o agendador já pega
}

export function getIntensity(): Intensity {
  return intensity;
}

export function getScene(): MusicScene | null {
  return scene;
}

/**
 * Música de vitória com retorno automático para a do jogo.
 * Usado nas telas de fim de nível.
 */
export function playVictory(returnTo: MusicScene = 'game', seconds = 6) {
  playMusic('victory', 0.3);
  window.setTimeout(() => {
    if (getScene() === 'victory') playMusic(returnTo, 0.6);
  }, seconds * 1000);
}

/* Aliases curtos para uso nos jogos: music.play(...), music.sync(), ... */
export const play = playMusic;
export const stop = stopMusic;
export const pause = pauseMusic;
export const resume = resumeMusic;
export const sync = syncMusic;
