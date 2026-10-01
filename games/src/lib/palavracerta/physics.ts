/**
 * Física do A Palavra Certa em UM lugar só.
 *
 * O motor (`engine.ts`) e o gate (`clearability.test.ts`) importam daqui. Antes
 * eles tinham cópia: o teste usava uma fórmula que ignorava o *apex hang* e a
 * aceleração aérea, então dava verde com 6 plataformas inalcançáveis por fase
 * (achado sev 3 da revisão `jogos-2d`). Regra de ouro da skill `jogos-qa` §6:
 * a garantia tem que ver o mesmo motor que a criança joga.
 *
 * Constantes derivadas de sensação (skill `jogos-game-feel` §2), não "números
 * mágicos": queda mais pesada que subida, ápice que "paira" para mirar o pouso,
 * pulo variável por altura ∝ v², correção de quina pequena e teleporte curto.
 */

export const GRAVITY = 2350;
/** Queda mais pesada que a subida (1,5–2×) — fim do pulo flutuante. */
export const FALL_MULT = 1.55;
/** Perto do ápice a gravidade cai → "hang" para mirar o pouso. */
export const APEX_HANG = 0.62;
export const APEX_SPEED = 160;
export const MAX_FALL = 900;
export const RUN_ACCEL = 3500;
export const AIR_ACCEL = 1900;
export const FRICTION = 2700;
export const MAX_SPEED = 335;
export const JUMP_VEL = 870;
/** Altura do pulo variável ∝ v²: soltar cedo deixa ~68 px (era 28 px, inalcançável). */
export const JUMP_CUT = 580;
export const COYOTE = 0.1;
export const JUMP_BUFFER = 0.12;
/** Correção de quina: empurra até 5 px para pousar em plataforma quase alcançada. */
export const CORNER_FIX = 5;
/** Passo fixo da simulação (o motor roda em passo fixo — determinístico). */
export const DT = 1 / 60;

/** Multiplicador de gravidade do passo — é o que cria o "feel", então é compartilhado. */
export function gravityScale(vy: number): number {
  return (vy > 0 ? FALL_MULT : 1) * (Math.abs(vy) < APEX_SPEED ? APEX_HANG : 1);
}

/** Um passo vertical completo (sem colisão), exatamente como o motor faz. */
export function stepVertical(vy: number, dt = DT): number {
  return Math.min(MAX_FALL, vy + GRAVITY * gravityScale(vy) * dt);
}

/** Um passo horizontal com aceleração aérea (é o que o motor aplica no ar). */
export function stepHorizontal(vx: number, dt = DT): number {
  return Math.max(-MAX_SPEED, Math.min(MAX_SPEED, vx + AIR_ACCEL * dt));
}

export interface JumpProfile {
  /** Altura máxima do pulo (px, medida da posição dos pés). */
  apex: number;
  /** Tempo até o ápice (ms). */
  apexMs: number;
  /** Arco total subida+queda até voltar à mesma altura (ms). */
  arcMs: number;
  /** Avanço horizontal em queda de 1 px (px). */
  reach: number;
  /** Avanço horizontal parado, saindo do ápice (px). */
  reachFromApex: number;
  /** Altura do "pulinho" (toque curto) (px). */
  hop: number;
  /** Velocidade horizontal logo após o ápice (px/s). */
  vxAtApex: number;
}

/**
 * Simula um pulo inteiro com a física real do motor (passo fixo).
 * `release`: 1 = segura até o chão; < 1 = solta o botão nessa fração do arco
 * (é o pulo variável da criança).
 */
export function simulateJump(release: number | 'hold' = 'hold', fromVx = MAX_SPEED): JumpProfile {
  const cut = release === 'hold' ? 0 : release;
  let y = 0;
  let x = 0;
  let vy = -JUMP_VEL;
  let vx = fromVx;
  let t = 0;
  let apex = 0;
  let apexMs = 0;
  let cutApplied = false;
  let vxAtApex = fromVx;

  for (let i = 0; i < 600; i++) {
    // Soltar o botão corta a subida uma única vez, no momento do release.
    if (cut > 0 && !cutApplied && t >= cut * 0.4) {
      if (vy < -JUMP_CUT) vy = -JUMP_CUT;
      cutApplied = true;
    }
    vy = stepVertical(vy);
    y += vy * DT;
    vx = stepHorizontal(vx);
    x += vx * DT;
    t += DT * 1000;
    if (y < apex) {
      apex = y;
      apexMs = t;
      vxAtApex = vx;
    }
    if (y >= 0 && i > 2) {
      return {
        apex: -apex,
        apexMs,
        arcMs: t,
        reach: x,
        reachFromApex: vxAtApex * ((t - apexMs) / 1000),
        hop: -apex,
        vxAtApex,
      };
    }
  }
  return { apex: -apex, apexMs, arcMs: t, reach: x, reachFromApex: x, hop: -apex, vxAtApex };
}

/** Perfil do pulo cheio (segurando o botão). */
export const JUMP = simulateJump('hold');
/** Perfil do pulinho (toque curto — a criança que só toca). */
export const HOP = simulateJump(0.35);
