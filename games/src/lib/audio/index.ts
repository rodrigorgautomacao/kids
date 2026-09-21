// Ponto único de importação do áudio do app.
//
//   import { sfx, music, voice, unlockAudio } from '../lib/audio';
//   sfx.correct();
//   music.play('game');
//   voice.speak('Quem construiu a arca?');
//
// Layout (skill jogos-audio §7):
//   context.ts      ← AudioContext único, barramentos, unlock, ducking
//   preferences.ts  ← mudo de efeitos/música/voz (persistido)
//   sfx.ts          ← efeitos
//   music.ts        ← trilha por cena + camadas adaptativas
//   voice.ts        ← narração (speechSynthesis)

export {
  audioNow,
  getAudioContext,
  isAudioReady,
  resumeAudio,
  setDuck,
  suspendAudio,
  unlockAudio,
} from './context';

export {
  isAllMuted,
  isMusicMuted,
  isSfxMuted,
  isVoiceMuted,
  setAllMuted,
  setMusicMuted,
  setSfxMuted,
  setVoiceMuted,
  subscribeSoundPrefs,
} from './preferences';

export * as sfx from './sfx';
export * as music from './music';
export * as voice from './voice';
