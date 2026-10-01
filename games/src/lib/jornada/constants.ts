// Constantes de física do platformer — o "feel" fica aqui (skill `jogos-platformer` §2).
// Unidades: pixels de mundo e segundos. Tile = 24 px.

export const TILE = 24;

// ─── Player ───────────────────────────────────────────────────────
export const PLAYER_W = 18;
export const PLAYER_H = 28;

// ─── Movimento horizontal ─────────────────────────────────────────
export const RUN_ACCEL = 1800;
export const RUN_FRICTION = 1600;
export const RUN_MAX = 160;
export const RUN_MAX_SMALL_KIDS = 128;

// ─── Pulo ─────────────────────────────────────────────────────────
export const GRAVITY = 2100;
export const MAX_FALL = 780;
/** Impulso inicial (negativo = sobe). Altura ≈ 3,5 tiles. */
export const JUMP_VELOCITY = -600;
/** Soltar o botão corta a subida → pulo de altura variável. */
export const JUMP_CUT = 0.45;
/** Ainda pula depois de sair da borda. */
export const COYOTE_TIME = 0.08;
/** Toque antes de aterrissar conta no chão. */
export const JUMP_BUFFER = 0.1;
/** Perto do topo do pulo a gravidade cai → "hang" no ar. */
export const APEX_HANG = 0.85;
export const APEX_SPEED = 90;
/** Rebote ao pisar em inimigo (stomp transforma, nunca mata). */
export const STOMP_BOUNCE = -330;

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
