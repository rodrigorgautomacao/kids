// Tipos do motor da "A Grande Jornada" (platformer do GAME_DESIGN.md §6.1).
// Módulo próprio `lib/jornada/` — não misturar com `lib/platformer/` (outro jogo).

/** Char do mapa → significado (skill `jogos-platformer` §3). */
export type TileChar =
  | '.' // ar
  | '#' // chão / pedra sólida
  | '=' // plataforma (sobe só por cima — one-way)
  | '?' // A Rocha que Responde (bate por baixo, uma vez)
  | 'x' // Muro de Espinhos (rompe com luz/semente)
  | 'w' // O Muro que Cai (Jericó — cai com o canto)
  | 'o' // Semente da Palavra
  | 'E' // Escudo da Fé
  | 'g' // Rocha do Marco (checkpoint)
  | '!' // O Portão (fim de etapa)
  | 'c' // A Cancelinha (só aparece com luz)
  | 'S' // Espinho (patrulha; stomp → vira flor)
  | 'b' // Bichinho do Pomar (foge; stomp → figurinha)
  | 'n' // Serpente da Haste (pula por cima, não causa dano)
  | 'd' // Grande Desespero (senta na estrada; passa com Escudo/luz)
  | '~'; // água (cair volta ao Marco)

export type Facing = -1 | 1;

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: Facing;
  coyote: number;
  jumpBuffer: number;
  /** O corte de pulo (JUMP_CUT) já aconteceu neste pulo. */
  jumpCut: boolean;
  /** Escudo da Fé: anula 1 golpe/queda leve. */
  shield: boolean;
}

export interface EnemyState {
  kind: 'spike' | 'bug' | 'snake' | 'despair';
  x: number;
  y: number;
  vx: number;
  w: number;
  h: number;
  /** Depois do stomp vira flor/figurinha — nunca "morre". */
  transformed: boolean;
  timer: number;
  /** Grande Desespero: cresce enquanto a criança hesita. */
  grow: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  /** Botão de pular segurado. */
  jump: boolean;
  /** Borda de subida do botão de pular (só 1 frame). */
  jumpPressed: boolean;
}

/** Eventos discretos para a casca React (som, HUD, mensagens). */
export type EngineEvent =
  | { type: 'seed'; total: number }
  | { type: 'shield' }
  | { type: 'checkpoint' }
  | { type: 'fall' }
  | { type: 'stomp' }
  | { type: 'flower' }
  | { type: 'rocha' }
  | { type: 'muro' }
  | { type: 'canto' }
  | { type: 'pray' }
  | { type: 'detour' }
  | { type: 'encontro'; id: string; npc: string }
  | { type: 'bencao'; text: string }
  | { type: 'gate' }
  | { type: 'message'; text: string };

/**
 * Marcos de Bunyan desenhados como "cartão-postal" no cenário (skill
 * `jogos-visual` §6: cada zona precisa de silhueta única, reconhecível de longe).
 */
export type SceneryId =
  | 'ruins'
  | 'gate'
  | 'house'
  | 'cliff'
  | 'hearth'
  | 'gloom'
  | 'market'
  | 'castle'
  | 'mountains'
  | 'enchanted'
  | 'river'
  | 'celestial';

export interface PlatformerLevel {
  id: string;
  /** Nome da etapa (HUD/mapa). */
  name: string;
  /** Ato 1..4. */
  act: 1 | 2 | 3 | 4;
  /** Referência NAA da etapa. */
  ref: string;
  /** Marco de Bunyan (só informativo, nunca autoridade). */
  marco: string;
  /** Narração de entrada: quem é o Peregrino aqui e o que ele vai enfrentar. */
  cenario: string;
  /** Mensagem da tela de conclusão. */
  lesson: string;
  /** Silhueta do marco desenhada no plano médio. */
  scenery: SceneryId;
  /** Cores do céu (topo/base) do bioma. */
  sky: [string, string];
  /** Cores do chão (base/detalhe). */
  ground: [string, string];
  /** Linhas do mapa (192 colunas × 14). */
  map: string[];
  /** Escurecimento do cenário (etapa 6 etc.): 0..1. */
  darkness?: number;
}
