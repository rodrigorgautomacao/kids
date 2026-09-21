// Efeitos sonoros sintetizados (zero arquivos, funciona offline).
//
// Regras de ouro (skill jogos-audio §1):
// - curto: ≤ 400 ms (fanfarras até ~1,5 s), sem atravessar a próxima pergunta;
// - nunca estridente, nunca assustador: erro é descendente e macio;
// - todo som tem reforço visual equivalente (a parte visual já existe).
//
// Cada efeito usa o mesmo "instrumento": 1–2 osciladores + filtro passa-baixa +
// envelope. A segunda voz (oitava/quinta, bem baixa) é o que dá corpo — sem ela
// todos os sons soariam como o mesmo bipe.

import { audioNow, getSfxBus, getAudioContext, setDuck } from './context';
import { isSfxMuted } from './preferences';

interface NoteOptions {
  /** Nota em MIDI (ex.: 72 = C5). Usar `freq` para varreduras. */
  midi?: number;
  /** Frequência em Hz (ignorada se `midi` existir). */
  freq?: number;
  /** Atraso em segundos a partir de agora. */
  at?: number;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
  /** Segunda voz de reforço. */
  layer?: 'octave' | 'fifth' | 'none';
  /** Corte do passa-baixa (Hz). */
  filter?: number;
  /** Frequência final (portamento). */
  glide?: number;
  /** Variação aleatória de ±3% — evita fadiga em sons repetidos. */
  vary?: boolean;
}

const mtof = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

function note({
  midi,
  freq,
  at = 0,
  dur = 0.16,
  type = 'triangle',
  vol = 0.12,
  layer = 'none',
  filter = 2600,
  glide,
  vary = false,
}: NoteOptions) {
  const ac = getAudioContext();
  const bus = getSfxBus();
  if (!ac || !bus) return;

  const base = midi !== undefined ? mtof(midi) : (freq ?? 440);
  const f = vary ? base * (1 + (Math.random() * 0.06 - 0.03)) : base;
  const t = audioNow() + at;

  try {
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = filter;
    lp.Q.value = 0.7;
    lp.connect(bus);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    gain.connect(lp);

    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t);
    if (glide !== undefined) osc.frequency.linearRampToValueAtTime(glide, t + dur);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + dur + 0.05);

    if (layer !== 'none') {
      const lf = layer === 'octave' ? f * 2 : f * 1.5;
      const lg = ac.createGain();
      lg.gain.setValueAtTime(0.0001, t);
      lg.gain.linearRampToValueAtTime(vol * 0.28, t + 0.02);
      lg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      lg.connect(lp);
      const osc2 = ac.createOscillator();
      osc2.type = type === 'sine' ? 'sine' : 'triangle';
      osc2.frequency.setValueAtTime(lf, t);
      osc2.connect(lg);
      osc2.start(t);
      osc2.stop(t + dur + 0.05);
    }
  } catch {
    /* áudio indisponível: seguir em silêncio */
  }
}

/** Ruído branco curto (só para o "swoosh" de transição). */
let noiseCache: AudioBuffer | null = null;
function noise(seconds: number): AudioBuffer | null {
  const ac = getAudioContext();
  if (!ac) return null;
  if (noiseCache) return noiseCache;
  try {
    const len = Math.max(1, Math.floor(ac.sampleRate * seconds));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseCache = buf;
    return buf;
  } catch {
    return null;
  }
}

/* --------------------------------- efeitos --------------------------------- */

/** Tick discreto de interface (toque em botão). */
export function click() {
  if (isSfxMuted()) return;
  note({ midi: 90, dur: 0.05, type: 'triangle', vol: 0.05, filter: 3400 });
  note({ midi: 97, at: 0.012, dur: 0.05, type: 'sine', vol: 0.03, filter: 4200 });
}

/** Blip genérico (avançar fala, toques leves). */
export function pop() {
  if (isSfxMuted()) return;
  note({ midi: 84, dur: 0.09, type: 'sine', vol: 0.08, filter: 3000, vary: true });
}

/** Card/pergunta abrindo. */
export function open() {
  if (isSfxMuted()) return;
  note({ freq: 320, glide: 720, dur: 0.2, type: 'sine', vol: 0.07, filter: 2200 });
  note({ midi: 88, at: 0.08, dur: 0.16, type: 'triangle', vol: 0.05 });
}

/** Card fechando. */
export function close() {
  if (isSfxMuted()) return;
  note({ freq: 680, glide: 300, dur: 0.18, type: 'sine', vol: 0.06, filter: 2000 });
}

/**
 * Acerto: duas notas ascendentes. `combo` (acertos seguidos) sobe a tonalidade —
 * recompensa progressiva sem ficar estridente.
 */
export function correct(combo = 0) {
  if (isSfxMuted()) return;
  const bump = Math.min(combo, 5) * 2;
  note({ midi: 72 + bump, dur: 0.14, type: 'triangle', vol: 0.12, layer: 'octave', filter: 3200 });
  note({ midi: 79 + bump, at: 0.1, dur: 0.26, type: 'triangle', vol: 0.11, layer: 'octave', filter: 3400 });
}

/** Erro: descendente e macio — informação, nunca castigo. */
export function wrong() {
  if (isSfxMuted()) return;
  note({ midi: 58, dur: 0.22, type: 'triangle', vol: 0.1, filter: 1300 });
  note({ midi: 53, at: 0.2, dur: 0.3, type: 'triangle', vol: 0.08, filter: 1100 });
}

/** Coleta de estrela: "ping" cristalino com eco curto. */
export function collect() {
  if (isSfxMuted()) return;
  note({ midi: 88, dur: 0.12, type: 'sine', vol: 0.07, filter: 5200, vary: true });
  note({ midi: 88, at: 0.09, dur: 0.12, type: 'sine', vol: 0.03, filter: 5200 });
  note({ midi: 95, at: 0.02, dur: 0.18, type: 'sine', vol: 0.04, filter: 6000 });
}

/** Subida de faixa (streak): uma nota por degrau, escala pentatônica. */
export function streak(level: number) {
  if (isSfxMuted()) return;
  const scale = [76, 79, 81, 84, 86, 88, 91];
  const i = Math.max(0, Math.min(scale.length - 1, level));
  note({ midi: scale[i], dur: 0.16, type: 'triangle', vol: 0.11, layer: 'fifth', filter: 3600 });
}

/** Estrelas ganhas no nível (1 a 3 notas). */
export function star(earned = 1) {
  if (isSfxMuted()) return;
  const notes = [84, 88, 91];
  for (let i = 0; i < Math.max(1, Math.min(3, earned)); i++) {
    note({ midi: notes[i], at: i * 0.12, dur: 0.18, type: 'triangle', vol: 0.1, layer: 'octave' });
  }
}

/** Selo/história conquistada. */
export function badge() {
  if (isSfxMuted()) return;
  note({ midi: 45, dur: 0.14, type: 'sine', vol: 0.11, filter: 900 });
  note({ midi: 91, at: 0.07, dur: 0.3, type: 'triangle', vol: 0.09, layer: 'octave', filter: 4600 });
}

/**
 * Figurinha colada no livrinho: brilho ascendente e curtinho (distinto do
 * `badge` de história) — é o "colei!" da coleção.
 */
export function sticker() {
  if (isSfxMuted()) return;
  note({ midi: 84, dur: 0.1, type: 'sine', vol: 0.06, filter: 5600, vary: true });
  note({ midi: 88, at: 0.07, dur: 0.12, type: 'sine', vol: 0.07, filter: 5800 });
  note({ midi: 93, at: 0.15, dur: 0.2, type: 'triangle', vol: 0.08, layer: 'octave', filter: 6000 });
}

/** Vitória de nível: fanfarra de 4 notas + acorde. */
export function win() {
  if (isSfxMuted()) return;
  const melody = [72, 76, 79, 84];
  melody.forEach((midi, i) => note({ midi, at: i * 0.13, dur: 0.18, type: 'triangle', vol: 0.12, layer: 'octave', filter: 3600 }));
  [72, 76, 79].forEach((midi) => note({ midi, at: 0.56, dur: 0.55, type: 'triangle', vol: 0.07, filter: 3000 }));
}

/** Capítulo completo: jingle maior, ~1,5 s. */
export function chapter() {
  if (isSfxMuted()) return;
  const melody: Array<[number, number]> = [
    [72, 0],
    [76, 0.12],
    [79, 0.24],
    [84, 0.36],
    [79, 0.52],
    [84, 0.64],
    [88, 0.78],
  ];
  melody.forEach(([midi, at]) => note({ midi, at, dur: 0.2, type: 'triangle', vol: 0.11, layer: 'octave', filter: 3800 }));
  [72, 76, 79, 84].forEach((midi) => note({ midi, at: 1.0, dur: 0.6, type: 'triangle', vol: 0.06, filter: 3000 }));
}

/** Transição de tela ("swoosh"). */
export function swoosh() {
  if (isSfxMuted()) return;
  const ac = getAudioContext();
  const bus = getSfxBus();
  if (!ac || !bus) return;
  try {
    const src = ac.createBufferSource();
    const buf = noise(0.4);
    if (!buf) return;
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.8;
    const t = audioNow();
    bp.frequency.setValueAtTime(320, t);
    bp.frequency.linearRampToValueAtTime(2400, t + 0.3);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    src.connect(bp);
    bp.connect(gain);
    gain.connect(bus);
    src.start(t);
    src.stop(t + 0.4);
  } catch {
    /* ignore */
  }
}

/** Perdeu uma vida / fim de jogo sem drama: descendente macio e acolhedor. */
export function gentle() {
  if (isSfxMuted()) return;
  note({ midi: 69, dur: 0.24, type: 'sine', vol: 0.1, filter: 2000 });
  note({ midi: 64, at: 0.22, dur: 0.26, type: 'sine', vol: 0.09, filter: 1800 });
  note({ midi: 57, at: 0.46, dur: 0.44, type: 'sine', vol: 0.08, filter: 1500 });
}

/**
 * Toca uma fanfarra e baixa a música junto (`duck`), devolvendo depois.
 * Usado por `win`/`chapter` para a trilha não competir com o efeito.
 */
export function withDuck(fn: () => void, seconds = 1.6) {
  setDuck(true, 0.15);
  fn();
  window.setTimeout(() => setDuck(false, 0.5), Math.max(300, seconds * 1000 - 200));
}
