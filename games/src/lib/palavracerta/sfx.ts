// Efeitos sonoros de A Palavra Certa — sintetizados, fora do `lib/audio/sfx.ts`
// compartilhado (cada jogo cuida do seu; regra "cada um no seu jogo").
//
// Mesmo instrumento do sfx da casa: oscilador + passa-baixa + envelope, com
// segunda voz de reforço. Curto (≤ 500 ms), nunca estridente.

import { audioNow, getAudioContext, getSfxBus } from '../audio/context';
import { isSfxMuted } from '../audio/preferences';

interface NoteOptions {
  midi?: number;
  freq?: number;
  at?: number;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
  layer?: 'octave' | 'fifth' | 'none';
  filter?: number;
  glide?: number;
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

/** Pulo do herói — ascendente curto e alegre. */
export function jump() {
  if (isSfxMuted()) return;
  note({ midi: 62, dur: 0.14, type: 'triangle', vol: 0.09, filter: 2800, glide: 84, vary: true });
  note({ midi: 74, at: 0.03, dur: 0.1, type: 'sine', vol: 0.05, filter: 3600 });
}

/** Aterrissagem — baque macio de terra. */
export function land() {
  if (isSfxMuted()) return;
  note({ freq: 180, dur: 0.1, type: 'sine', vol: 0.07, filter: 900, glide: 90, vary: true });
  note({ midi: 45, at: 0.015, dur: 0.08, type: 'triangle', vol: 0.05, filter: 700, vary: true });
}

/** Passo no chão (discreto). */
export function step() {
  if (isSfxMuted()) return;
  note({ freq: 240, dur: 0.045, type: 'sine', vol: 0.028, filter: 800, vary: true });
}

/** Declarar a Palavra — quem leve, com corpo (o "soco" virou palavra). */
export function declare() {
  if (isSfxMuted()) return;
  note({ midi: 67, dur: 0.18, type: 'triangle', vol: 0.1, filter: 3000, layer: 'fifth', vary: true });
  note({ midi: 74, at: 0.09, dur: 0.22, type: 'triangle', vol: 0.1, filter: 3400, layer: 'octave', vary: true });
}

/** Guardião cedendo à Palavra — brilho ascendente de 3 notas. */
export function gateOpen() {
  if (isSfxMuted()) return;
  [67, 72, 79].forEach((midi, i) =>
    note({ midi, at: i * 0.11, dur: 0.32, type: 'triangle', vol: 0.1, layer: 'octave', filter: 3600 }),
  );
  note({ midi: 84, at: 0.34, dur: 0.5, type: 'sine', vol: 0.07, filter: 4200 });
}

/**
 * Vibração sutil (haptics) — só quando o som está ativo e o aparelho vibra.
 * iOS não expõe `navigator.vibrate`: degrada em silêncio, sem erro.
 */
export function buzz(pattern: number | number[]) {
  if (isSfxMuted()) return;
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    /* aparelho sem vibração */
  }
}
