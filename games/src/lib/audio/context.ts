// AudioContext único da sessão + barramentos (efeitos / música) + ducking.
//
// Por que um módulo só para isso:
// - No iOS/Safari o AudioContext nasce SUSPENSO e só destrava dentro de um gesto.
//   `unlockAudio()` é chamado no primeiro toque/tecla (App.tsx); sem isso, sons
//   disparados fora de gesto (ex.: coleta de estrela dentro do rAF) ficam mudos.
// - Tudo passa por um `master` → dá para baixar/aumentar o app inteiro num lugar.
// - A música tem um `duckGain` próprio: baixar a trilha durante narração/vitória
//   não briga com os fades de troca de cena (que mexem no `music` bus).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let music: GainNode | null = null;
let duck: GainNode | null = null;
let unlocked = false;

/** Volume geral do app (não confundir com os mutes de preferência). */
const MASTER_VOLUME = 0.9;
/** Quanto a música abaixa durante fala/fanfarra (50%). */
const DUCK_LEVEL = 0.5;

function buildGraph(ac: AudioContext) {
  master = ac.createGain();
  master.gain.value = MASTER_VOLUME;
  master.connect(ac.destination);

  sfx = ac.createGain();
  sfx.gain.value = 1;
  sfx.connect(master);

  duck = ac.createGain();
  duck.gain.value = 1;
  duck.connect(master);

  music = ac.createGain();
  music.gain.value = 0; // começa mudo: quem sobe é o fade de cena
  music.connect(duck);
}

/** Contexto único (cria na primeira chamada). `null` se o navegador não tiver áudio. */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      buildGraph(ctx);
    }
    return ctx;
  } catch {
    return null;
  }
}

export function getSfxBus(): GainNode | null {
  getAudioContext();
  return sfx;
}

export function getMusicBus(): GainNode | null {
  getAudioContext();
  return music;
}

/** Tempo atual do contexto (0 quando não há áudio — os agendamentos só se deslocam). */
export function audioNow(): number {
  return ctx ? ctx.currentTime : 0;
}

export function isAudioReady(): boolean {
  return unlocked && ctx !== null && ctx.state === 'running';
}

/**
 * Destrava o áudio. Precisa rodar **dentro de um gesto do usuário**.
 * Toca também um buffer silencioso — truque necessário no iOS antigo.
 */
export function unlockAudio() {
  const ac = getAudioContext();
  if (!ac || !master) return;
  try {
    if (ac.state === 'suspended') void ac.resume();
    const buffer = ac.createBuffer(1, 1, 22050);
    const source = ac.createBufferSource();
    source.buffer = buffer;
    source.connect(master);
    source.start(0);
    unlocked = true;
  } catch {
    /* áudio indisponível: o jogo segue sem som */
  }
}

/** Resume depois de uma interrupção (ligação, troca de app, aba em segundo plano). */
export function resumeAudio() {
  const ac = getAudioContext();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') void ac.resume();
  } catch {
    /* ignore */
  }
}

export function suspendAudio() {
  const ac = ctx;
  if (!ac) return;
  try {
    if (ac.state === 'running') void ac.suspend();
  } catch {
    /* ignore */
  }
}

/** Baixa a música (narração, fanfarra) e devolve depois. */
export function setDuck(on: boolean, seconds = 0.25) {
  const ac = getAudioContext();
  if (!ac || !duck) return;
  try {
    duck.gain.cancelScheduledValues(ac.currentTime);
    duck.gain.setValueAtTime(duck.gain.value, ac.currentTime);
    duck.gain.linearRampToValueAtTime(on ? DUCK_LEVEL : 1, ac.currentTime + seconds);
  } catch {
    /* ignore */
  }
}
