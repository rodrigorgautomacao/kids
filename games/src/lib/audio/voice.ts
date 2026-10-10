// Narração por síntese de voz do sistema (decisão D2 do ADR-002).
//
// Por que `speechSynthesis` e não arquivos gravados:
// - grátis, offline, zero peso no repositório e nenhuma licença de voz a resolver;
// - atende o público 4–6 anos que ainda não lê (pré-leitores);
// - o preço é a voz variar por aparelho — por isso TODO texto narrado também
//   aparece na tela (áudio nunca é o único canal — skill jogos-audio §8).
//
// Cuidados de iOS: a primeira fala precisa sair de um gesto do usuário; por isso
// `primeVoice()` é chamado no primeiro toque (ver App.tsx). A voz também é
// cortada se o usuário mudar de tela ou mutar.

import { setDuck } from './context';
import { isVoiceMuted } from './preferences';
import { hashText } from './hash';

const BASE = import.meta.env.BASE_URL;

/**
 * Voz de estúdio pré-gerada (Piper, grátis): `public/voice/<hash>.ogg`.
 * O manifesto mapeia hash(cleanForSpeech(texto)) → arquivo. Quando o texto tem
 * áudio, ele toca (igual em todo aparelho e offline); senão cai na voz do
 * sistema (`speechSynthesis`). Gerado por `scripts/gen-voice.mjs`.
 */
let manifest: Record<string, string> | null = null;
let manifestRequested = false;
let audioEl: HTMLAudioElement | null = null;

function ensureManifest() {
  if (manifestRequested || typeof fetch === 'undefined') return;
  manifestRequested = true;
  try {
    fetch(`${BASE}voice/manifest.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (m && typeof m === 'object') manifest = m as Record<string, string>;
      })
      .catch(() => {
        /* sem manifesto: segue na voz do aparelho */
      });
  } catch {
    /* ignore */
  }
}
ensureManifest();

/** Toca o arquivo pré-gerado. Retorna false se nem começou (aí usa TTS). */
function playFile(file: string, onEnd?: () => void): boolean {
  try {
    if (!audioEl) audioEl = new Audio();
    const el = audioEl;
    el.pause();
    el.src = `${BASE}voice/${file}`;
    el.onended = () => {
      speaking = false;
      setDuck(false, 0.4);
      onEnd?.();
    };
    el.onerror = () => {
      speaking = false;
      setDuck(false, 0.3);
    };
    speaking = true;
    setDuck(true, 0.2);
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        speaking = false;
        setDuck(false, 0.3);
      });
    }
    return true;
  } catch {
    return false;
  }
}

interface SpeakOptions {
  /** 0.5–2. Velocidade da fala (padrão infantil: um pouco mais devagar). */
  rate?: number;
  /** 0–2. Tom (padrão levemente mais agudo para soar amigável). */
  pitch?: number;
  /** Chamado quando a fala termina (ou falha). */
  onEnd?: () => void;
}

const DEFAULT_RATE = 0.95;
const DEFAULT_PITCH = 1.05;

let cachedVoice: SpeechSynthesisVoice | null = null;
let speaking = false;

/**
 * A narração da jornada é **sempre masculina** (decisão do dono, 2026-09-30):
 * o narrador é o Peregrino, um homem, e a voz de estúdio Piper
 * (`pt_BR-faber-medium`) é masculina. O problema: as falas novas não estão no
 * manifesto Piper e caíam no `speechSynthesis` do aparelho — que escolhia
 *Francisca/Thalita/Luciana (femininas). Resultado: a mesma fase falava em duas
 * vozes diferentes. Aqui o fallback passa a preferir **masculino**.
 *
 * Nomes pt-BR masculino mais comuns em Synthesis/Web Speech (Edge, Chrome,
 * macOS, Android). `antonio`/`donato` já eram usados aqui.
 */
const MALE_NAMES =
  /antonio|antônio|donato|daniel|ricardo|felipe|gustavo|henrique|heitor|jorge|lu[ií]s|luis|marcelo|paulo|pedro|rafael|rodrigo|f[áa]bio|fabio|fernando|jo[ãa]o|joao|joaquim|leonardo|leandro|gabriel|tiago|diego|vitor|v[ií]tor|bruno|carlos|eduardo|felix|felix|m[áa]rcio|marcio|m[úu]rcio|murcio|n[íi]colas|ot[áa]vio|otavio|renato|s[ée]rgio|sergio|thiago|wallace|wagner|arnaldo|c[áa]ssio|cassio|em[íi]lio|emilio/i;

/**
 * Nomes pt-BR feminino conhecidos (e a voz neutra do Google pt-BR, que também é
 * feminina). A 1ª passada da escolha usa **só masculina** (decisão do dono); a
 * feminina só entra na 2ª passada, como último recurso — para nunca deixar a
 * escolha para a voz padrão do navegador (a "IA mulher" robótica).
 */
const FEMALE_NAMES =
  /francisca|thalita|maria|brenda|elza|luciana|fernanda|joana|in[eê]s|ines|ana|clara|luziana|sabrina|patr[íi]cia|patricia|juliana|adriana|let[íi]cia|leticia|vivian|camila|helena|isabel|rosana|denise|marceline|fabiana|jos[ée]|jose|google.*(portugu|brasil)/i;

/** Voz que o sistema já traz como "natural" (o tipo de voz que soa boa). */
const NATURAL = /natural|neural|online|premium|enhanced/i;

/** Microsoft pt-BR: os nomes é que dizem a qualidade da voz. */
const MS_PTBR = /microsoft/i;

/**
 * Ordem de preferência de **qualidade** (sem julgar gênero). As
 * "neurais/naturais" vencem; depois as Microsoft; a neutra do Google (feminina)
 * fica fora da 1ª passada pelo filtro de gênero.
 */
const VOICE_PREFERENCES: { re: RegExp; score: number }[] = [
  { re: /google.*(portugu|brasil)/i, score: 70 },
  { re: MS_PTBR, score: 80 },
  { re: MALE_NAMES, score: 85 },
  { re: /^pt[-_]br$/i, score: 40 },
  { re: /^pt/i, score: 20 },
];

/** Qualidade da voz, ignorando o gênero. */
function qualityScore(label: string): number {
  let best = 1;
  for (const p of VOICE_PREFERENCES) {
    if (p.re.test(label)) best = Math.max(best, p.score);
  }
  // Bônus de naturalidade só quando a voz já passou de um piso mínimo.
  if (NATURAL.test(label) && best >= 40) best += 20;
  return best;
}

/**
 * Pontuação de concorrência (0 = não concorre).
 * - Por padrão **só voz masculina** (decisão do dono, 2026-09-30) — feminina
 *   conhecida pontua 0.
 * - Com `includeFemale`, a feminina entra **rebaixada**: serve só de último
 *   recurso, para o fallback nunca cair na voz padrão arbitrária do navegador.
 */
function scoreVoice(v: SpeechSynthesisVoice, includeFemale = false): number {
  if (!/^pt/i.test(v.lang)) return 0;
  const label = `${v.name} ${v.voiceURI}`;
  const female = FEMALE_NAMES.test(label);
  if (female && !includeFemale) return 0;
  let best = qualityScore(label);
  // Masculina leva vantagem, mas a qualidade ainda decide dentro do gênero.
  if (!female) best += 15;
  return best;
}

/** Recalcula e guarda a melhor voz pt-BR disponível. */
export function refreshVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return cachedVoice;
    let best: SpeechSynthesisVoice | null = null;
    let bestScore = 0;
    // 1ª passada: só masculina.
    for (const v of voices) {
      const s = scoreVoice(v);
      if (s > bestScore) {
        bestScore = s;
        best = v;
      }
    }
    // 2ª passada: sem masculina pt-BR, escolhe a MELHOR feminina — nunca deixa
    // a fala sem voz definida (era aí que entrava a voz padrão ruim).
    if (!best) {
      for (const v of voices) {
        const s = scoreVoice(v, true);
        if (s > bestScore) {
          bestScore = s;
          best = v;
        }
      }
    }
    if (best) cachedVoice = best;
    return cachedVoice;
  } catch {
    return cachedVoice;
  }
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  return refreshVoice();
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Limpa o texto para leitura em voz alta: emoji não é falado de forma útil, e
 * "Gênesis 6.14 (NAA)" soa melhor como "Gênesis 6 versículo 14".
 */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}]/gu, ' ')
    .replace(/\(NAA\)/gi, '')
    .replace(/\b(\d+)\.(\d+)\b/g, '$1 versículo $2')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Destrava a síntese de voz no primeiro gesto (iOS). Fala um texto vazio.
 * Também aproveita para aquecer a lista de vozes (que chega assíncrona).
 */
export function primeVoice() {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.getVoices();
    refreshVoice();
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.lang = 'pt-BR';
    window.speechSynthesis.speak(u);
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

/** Fala um texto. Cancela a fala anterior para não enfileirar frases. */
export function speak(text: string, options: SpeakOptions = {}) {
  if (isVoiceMuted()) return;
  const clean = cleanForSpeech(text);
  if (!clean) return;

  // 1) Voz de estúdio pré-gerada (Piper) — toca se existir para este texto.
  const file = manifest?.[hashText(clean)];
  if (file) {
    if (playFile(file, options.onEnd)) return;
  } else {
    ensureManifest();
  }

  // 2) Fallback: voz do aparelho.
  if (!isSpeechSupported()) return;

  const synth = window.speechSynthesis;
  try {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'pt-BR';
    utterance.rate = options.rate ?? DEFAULT_RATE;
    utterance.pitch = options.pitch ?? DEFAULT_PITCH;
    utterance.volume = 1;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;

    const done = () => {
      speaking = false;
      setDuck(false, 0.4);
      options.onEnd?.();
    };
    utterance.onend = done;
    utterance.onerror = done;

    // Vozes carregam de forma assíncrona: escolhe a melhor quando chegarem.
    if (!voice) {
      synth.addEventListener(
        'voiceschanged',
        () => {
          refreshVoice();
        },
        { once: true },
      );
    }

    speaking = true;
    setDuck(true, 0.2);
    synth.speak(utterance);
  } catch {
    speaking = false;
    setDuck(false, 0.3);
  }
}

/** Interrompe a narração (troca de tela, mudo ligado). */
export function stopSpeaking() {
  if (audioEl) {
    try {
      audioEl.pause();
    } catch {
      /* ignore */
    }
  }
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  if (speaking) {
    speaking = false;
    setDuck(false, 0.3);
  }
}

/**
 * Fala uma sequência em ordem — cada texto começa quando o anterior termina.
 * Usado no modo pequeninos para narrar as opções de resposta de uma pergunta
 * (quem ainda não lê precisa OUVIR as escolhas). A cadeia para sozinha se o
 * mudo for ligado no meio ou se algum texto for vazio.
 */
export function speakQueue(texts: string[], options: SpeakOptions = {}) {
  let i = 0;
  const next = () => {
    if (i >= texts.length) return;
    const t = texts[i++];
    if (!isVoiceMuted() && cleanForSpeech(t)) {
      speak(t, { ...options, onEnd: next });
    } else {
      next();
    }
  };
  next();
}

export function isSpeaking(): boolean {
  return speaking;
}
