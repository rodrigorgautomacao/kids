// Sons simples via Web Audio (sem bibliotecas). Pequenos e seguros para crianças.

const MUTE_KEY = 'kids-sound-muted-v1';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.14) {
  const ac = getCtx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ac.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + dur + 0.05);
  } catch {
    /* áudio indisponível: seguir sem som */
  }
}

export function playCorrect() {
  if (isMuted()) return;
  tone(660, 0, 0.16);
  tone(880, 0.13, 0.22);
}

export function playWrong() {
  if (isMuted()) return;
  tone(233, 0, 0.22, 'triangle', 0.11);
  tone(196, 0.22, 0.3, 'triangle', 0.09);
}

export function playPop() {
  if (isMuted()) return;
  tone(520, 0, 0.1, 'sine', 0.09);
}

export function playWin() {
  if (isMuted()) return;
  tone(523, 0, 0.18);
  tone(659, 0.14, 0.18);
  tone(784, 0.28, 0.2);
  tone(1047, 0.42, 0.4);
}