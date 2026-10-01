// Constantes de física do platformer — o "feel" fica aqui (skill `jogos-platformer` §2).
// Unidades: pixels de mundo e segundos. Tile = 24 px.

export const TILE = 24;

// ─── Player ───────────────────────────────────────────────────────
export const PLAYER_W = 18;
export const PLAYER_H = 28;

// ─── Movimento horizontal ─────────────────────────────────────────
// Atrito atinge a velocidade máxima em ~0,09 s (skill `jogos-game-feel` §2).
export const RUN_ACCEL = 1800;
export const RUN_FRICTION = 1600;
export const RUN_MAX = 160;
export const RUN_MAX_SMALL_KIDS = 150;

// ─── Pulo — física derivada de SENSAÇÃO (skill `jogos-game-feel` §2) ──
// Sensação escolhida: altura 3,5 tiles · tempo ao ápice 0,34 s · queda 1,6×
// mais pesada que a subida (fim do "flutuante").
//   JUMP_HEIGHT  = 3,5 × TILE = 84 px
//   GRAVITY_UP   = 2h / t²    = 1453
//   JUMP_VELOCITY= −2h / t    = −494
//   FALL_GRAVITY = UP × 1,6   = 2325
export const JUMP_HEIGHT_PX = 3.5 * TILE;
export const TIME_TO_APEX = 0.34;
export const GRAVITY = Math.round((2 * JUMP_HEIGHT_PX) / (TIME_TO_APEX * TIME_TO_APEX));
export const JUMP_VELOCITY = -Math.round((2 * JUMP_HEIGHT_PX) / TIME_TO_APEX);
/** Queda mais pesada que a subida (1,5–2×). */
export const FALL_GRAVITY = Math.round(GRAVITY * 1.6);
export const MAX_FALL = 780;
/** Soltar o botão corta a subida → pulo de altura variável. */
export const JUMP_CUT = 0.45;
/** Ainda pula depois de sair da borda (5–7 frames @60). */
export const COYOTE_TIME = 0.1;
/** Toque antes de aterrissar conta no chão. */
export const JUMP_BUFFER = 0.12;
/** Perto do topo do pulo a gravidade cai pela metade → "meio-suspiro". */
export const APEX_HANG = 0.5;
export const APEX_SPEED = 90;
/** Rebote ao pisar em inimigo (stomp transforma, nunca mata). */
export const STOMP_BOUNCE = -330;
/** Hit-stop (congelar) no pouso pesado — vende peso (skill §4). */
export const HIT_STOP = 0.05;
/** Empurrão de canto ("corner correction"): corrige quina de até 4 px. */
export const CORNER_NUDGE = 4;

// ─── Câmera ───────────────────────────────────────────────────────
/** Resolução virtual do mundo visível (o canvas escala isto). */
export const VIEW_W = 480;
export const VIEW_H = 270;
export const CAMERA_LERP = 0.12;

// ─── Semente da Palavra (luz + força) ─────────────────────────────
export const LIGHT_BASE = 60;
export const LIGHT_PER_SEED = 14;
export const LIGHT_MAX = 220;
/** Sementes necessárias para romper o Muro de Espinhos (a luz que cresce). */
export const SEEDS_TO_BREAK = 2;

// ─── Comunhão (oração) ────────────────────────────────────────────
/** 1 toque = 100%; esvazia por completo em ~20 s (3× mais lento nos pequeninos). */
export const COMUNHAO_DRAIN = 1 / 20;
export const COMUNHAO_DRAIN_SMALL_KIDS = 1 / 60;
export const COMUNHAO_FADE = 1.2;

// ─── Inimigos ─────────────────────────────────────────────────────
export const SPIKE_SPEED = 28;
export const BUG_FLEE_SPEED = 95;
export const BUG_FLEE_DIST = 72;
