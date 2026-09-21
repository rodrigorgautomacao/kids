import type { ComponentType } from 'react';
import {
  GameEstradaDaLuz,
  GameHeroisDaBiblia,
  GameAventuraBiblia,
  GameEncontreACena,
  GameParesDaArca,
  GameQueSomEsse,
  GameHistoriaEmOrdem,
  GameMostreOLivro,
  GameLinhaDoTempo,
  GameCacadoresDoVersiculo,
  GameQuebraCabeca,
  GameContaNaArca,
  GameAcheOIgual,
  GameSimOuNao,
  GameAcheOEscondido,
  GameQuebraCabecaMedio,
  GameLigueOsPares,
  GameAntigoOuNovo,
  GameQuantosNaHistoria,
  GameQualNaoPertence,
  GameQuemFalou,
  GameSeparePorTestamento,
  GameVerdadeiroOuFalso,
  GameCompleteOVersiculo,
  GameSombraDoHeroi,
} from '../components/games';

export type Faixa = '3-4' | '5-6' | '7-9';
export type Tipo = 'at' | 'nt' | 'at-nt';
export type GameStatus = 'pronto' | 'em-breve';

export const FAIXAS: readonly { id: Faixa; nome: string; idade: string; mascote: string; gradient: string; text: string }[] = [
  { id: '3-4', nome: 'Pequeninos',  idade: '3 e 4 anos',  mascote: '🐣', gradient: 'from-amber-200 via-rose-100 to-pink-200', text: 'text-amber-900' },
  { id: '5-6', nome: 'Exploradores', idade: '5 e 6 anos',  mascote: '🦊', gradient: 'from-sky-200 via-emerald-50 to-teal-200',   text: 'text-sky-900' },
  { id: '7-9', nome: 'Heróis',       idade: '7 a 9 anos',  mascote: '🦁', gradient: 'from-indigo-200 via-violet-50 to-purple-200', text: 'text-indigo-900' },
];

export const TIPOS: readonly { id: Tipo; nome: string; emoji: string; badge: string; bg: string; text: string }[] = [
  { id: 'at',    nome: 'Antigo Testamento',        emoji: '📜', badge: 'bg-amber-100',  bg: 'bg-amber-50',    text: 'text-amber-800'  },
  { id: 'nt',    nome: 'Novo Testamento',          emoji: '✝️', badge: 'bg-sky-100',    bg: 'bg-sky-50',      text: 'text-sky-800'    },
  { id: 'at-nt', nome: 'Antigo + Novo Testamento', emoji: '📖', badge: 'bg-emerald-100', bg: 'bg-emerald-50', text: 'text-emerald-800' },
];

export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  sinopse: string;
  faixa: Faixa;
  tipo: Tipo;
  status: GameStatus;
  habilidades: string[];              // tags curtas para o card (ex.: 'memória', 'narrativa')
  emBreveMotivo?: string;             // texto "Em breve!" no card
  totalLevels?: number;               // usado em games que têm fases (Estrada/Heróis) — None = piloto contínuo
  icon: ComponentType<{ size?: number }>;
  color: string;
  component?: ComponentType<{ onExit: () => void }>;
}

// ─── Jogos PRONTOS ────────────────────────────────────────────────
const GAMES: GameDefinition[] = [
  {
    id: 'encontre-a-cena',
    title: 'Encontre a Cena',
    subtitle: 'Piloto para Pequeninos',
    sinopse: 'Toque na figura certa! Uma dica é narrada e você escolhe a cena da Bíblia.',
    faixa: '3-4', tipo: 'at-nt', status: 'pronto',
    habilidades: ['reconhecimento visual', 'compreensão auditiva', 'memória'],
    icon: StarIcon,
    color: 'bg-amber-300 text-amber-900',
    component: GameEncontreACena,
  },
  {
    id: 'estrada-da-luz',
    title: 'A Estrada da Luz',
    subtitle: 'Quiz com caminhos',
    sinopse: 'Responda certo para caminhar pela estrada e chegar à luz!',
    faixa: '7-9', tipo: 'at-nt', status: 'pronto',
    habilidades: ['conhecimento bíblico', 'raciocínio', 'leitura rápida'],
    totalLevels: 3,                     // 3 trechos × 4 perguntas
    icon: SunIcon,
    color: 'bg-yellow-200 text-amber-900',
    component: GameEstradaDaLuz,
  },
  {
    id: 'herois-da-biblia',
    title: 'Heróis da Bíblia',
    subtitle: 'Quiz com vidas',
    sinopse: 'Conheça os heróis da Bíblia! Responda certo e evite perder as 3 vidas.',
    faixa: '7-9', tipo: 'at-nt', status: 'pronto',
    habilidades: ['conhecimento bíblico', 'memória de longo prazo'],
    totalLevels: 3,                     // 3 trechos × 4 perguntas
    icon: CrownIcon,
    color: 'bg-indigo-200 text-indigo-900',
    component: GameHeroisDaBiblia,
  },
  {
    id: 'aventura-biblia',
    title: 'Aventura na Bíblia',
    subtitle: 'Mundo aberto',
    sinopse: 'Explore um mundo e encontre 12 personagens! Ouça suas histórias e responda a pergunta.',
    faixa: '5-6', tipo: 'at-nt', status: 'pronto',
    habilidades: ['narrativa', 'compreensão auditiva', 'conhecimento bíblico'],
    icon: CompassIcon,
    color: 'bg-emerald-200 text-emerald-900',
    component: GameAventuraBiblia,
  },

  // ─── Prontos (continuação: Fase 11) ────────────────────────────
  { id: 'pares-da-arca',    title: 'Pares da Arca',       subtitle: 'Memória de pares', sinopse: 'Encontre os pares de animais!', faixa: '3-4', tipo: 'at', status: 'pronto', habilidades: ['memória', 'pares'], icon: StarIcon, color: 'bg-pink-200 text-pink-900', component: GameParesDaArca },
  { id: 'que-som-e-esse',   title: 'Que Som é Esse?',      subtitle: 'Escuta e escolha', sinopse: 'Ouça a pista sonora e toque no personagem certo!', faixa: '3-4', tipo: 'at-nt', status: 'pronto', habilidades: ['audição', 'reconhecimento'], icon: StarIcon, color: 'bg-amber-100 text-amber-900', component: GameQueSomEsse },
  { id: 'historia-em-ordem', title: 'A História em Ordem',  subtitle: 'Sequência da história', sinopse: 'Toque nas cenas na ordem em que aconteceram!', faixa: '5-6', tipo: 'at-nt', status: 'pronto', habilidades: ['sequência', 'tempo', 'narrativa'], icon: CompassIcon, color: 'bg-teal-200 text-teal-900', component: GameHistoriaEmOrdem },
  { id: 'mostre-o-livro',   title: 'Mostre o Livro',       subtitle: 'Qual livro da Bíblia?', sinopse: 'Ouça a pista e toque no livro certo!', faixa: '5-6', tipo: 'at-nt', status: 'pronto', habilidades: ['classificação', 'conhecimento bíblico'], icon: CompassIcon, color: 'bg-cyan-200 text-cyan-900', component: GameMostreOLivro },
  { id: 'linha-do-tempo',   title: 'Linha do Tempo',       subtitle: 'Ordene os eventos', sinopse: 'Organize os eventos bíblicos na ordem certa!', faixa: '7-9', tipo: 'at-nt', status: 'pronto', habilidades: ['sequência', 'memória', 'conhecimento bíblico'], icon: CrownIcon, color: 'bg-violet-200 text-violet-900', component: GameLinhaDoTempo },
  { id: 'cacadores-versiculo', title: 'Caçadores do Versículo', subtitle: 'Complete o versículo', sinopse: 'Ache a palavra que falta no versículo!', faixa: '7-9', tipo: 'at-nt', status: 'pronto', habilidades: ['leitura', 'velocidade', 'conhecimento bíblico'], icon: CrownIcon, color: 'bg-purple-200 text-purple-900', component: GameCacadoresDoVersiculo },

  // ─── Fase 12 — +5 por faixa (quebra-cabeça e mecânicas novas) ──
  // 3–4
  { id: 'quebra-cabeca', title: 'Quebra-Cabeça Bíblico', subtitle: 'Monte a cena 2×2', sinopse: 'Troque as peças e remonte a cena bíblica!', faixa: '3-4', tipo: 'at-nt', status: 'pronto', habilidades: ['visão espacial', 'reconhecimento'], icon: StarIcon, color: 'bg-indigo-200 text-indigo-900', component: GameQuebraCabeca },
  { id: 'conta-na-arca', title: 'Conta na Arca', subtitle: 'Conte os animais', sinopse: 'Conte os animais e toque no número certo!', faixa: '3-4', tipo: 'at', status: 'pronto', habilidades: ['contagem', 'números'], icon: StarIcon, color: 'bg-lime-200 text-lime-900', component: GameContaNaArca },
  { id: 'ache-o-igual', title: 'Ache o Igual', subtitle: 'Discriminação visual', sinopse: 'Ache a figura igual ao modelo!', faixa: '3-4', tipo: 'at-nt', status: 'pronto', habilidades: ['atenção visual', 'comparação'], icon: StarIcon, color: 'bg-rose-200 text-rose-900', component: GameAcheOIgual },
  { id: 'sim-ou-nao', title: 'Sim ou Não?', subtitle: 'Verdadeiro ou falso', sinopse: 'A história é verdadeira? Toque em ✅ ou ❌!', faixa: '3-4', tipo: 'at-nt', status: 'pronto', habilidades: ['compreensão', 'decisão'], icon: StarIcon, color: 'bg-emerald-200 text-emerald-900', component: GameSimOuNao },
  { id: 'ache-o-escondido', title: 'Ache o Escondido', subtitle: 'Atenção visual', sinopse: 'Encontre a figura pedida na cena!', faixa: '3-4', tipo: 'at-nt', status: 'pronto', habilidades: ['atenção', 'vocabulário'], icon: StarIcon, color: 'bg-orange-200 text-orange-900', component: GameAcheOEscondido },
  // 5–6
  { id: 'quebra-cabeca-medio', title: 'Quebra-Cabeça Bíblico', subtitle: 'Monte a cena 3×3', sinopse: 'Remonte a cena com 9 peças!', faixa: '5-6', tipo: 'at-nt', status: 'pronto', habilidades: ['visão espacial', 'raciocínio'], icon: CompassIcon, color: 'bg-indigo-200 text-indigo-900', component: GameQuebraCabecaMedio },
  { id: 'ligue-os-pares', title: 'Ligue os Pares', subtitle: 'Associação', sinopse: 'Ligue cada personagem ao seu par!', faixa: '5-6', tipo: 'at-nt', status: 'pronto', habilidades: ['associação', 'memória'], icon: CompassIcon, color: 'bg-emerald-200 text-emerald-900', component: GameLigueOsPares },
  { id: 'antigo-ou-novo', title: 'Antigo ou Novo?', subtitle: 'Classificação', sinopse: 'Coloque cada história no testamento certo!', faixa: '5-6', tipo: 'at-nt', status: 'pronto', habilidades: ['classificação', 'conhecimento bíblico'], icon: CompassIcon, color: 'bg-cyan-200 text-cyan-900', component: GameAntigoOuNovo },
  { id: 'quantos-na-historia', title: 'Quantos na História?', subtitle: 'Somar e subtrair', sinopse: 'Resolva o probleminha da história!', faixa: '5-6', tipo: 'at', status: 'pronto', habilidades: ['soma', 'subtração', 'raciocínio'], icon: CompassIcon, color: 'bg-teal-200 text-teal-900', component: GameQuantosNaHistoria },
  { id: 'qual-nao-pertence', title: 'Qual Não Pertence?', subtitle: 'Categorias', sinopse: 'Ache a figura que não combina!', faixa: '5-6', tipo: 'at-nt', status: 'pronto', habilidades: ['categorização', 'lógica'], icon: CompassIcon, color: 'bg-fuchsia-200 text-fuchsia-900', component: GameQualNaoPertence },
  // 7–9
  { id: 'quem-falou', title: 'Quem Falou?', subtitle: 'Citações', sinopse: 'Descubra quem disse cada frase!', faixa: '7-9', tipo: 'nt', status: 'pronto', habilidades: ['leitura', 'conhecimento bíblico'], icon: CrownIcon, color: 'bg-sky-200 text-sky-900', component: GameQuemFalou },
  { id: 'separe-por-testamento', title: 'Separe por Testamento', subtitle: 'AT × NT (desafio)', sinopse: 'Separe histórias e eventos por testamento!', faixa: '7-9', tipo: 'at-nt', status: 'pronto', habilidades: ['classificação', 'conhecimento bíblico'], icon: CrownIcon, color: 'bg-blue-200 text-blue-900', component: GameSeparePorTestamento },
  { id: 'verdadeiro-ou-falso', title: 'Verdadeiro ou Falso?', subtitle: 'Afirmações', sinopse: 'Decida se a afirmação está certa!', faixa: '7-9', tipo: 'at-nt', status: 'pronto', habilidades: ['conhecimento bíblico', 'atenção'], icon: CrownIcon, color: 'bg-slate-200 text-slate-800', component: GameVerdadeiroOuFalso },
  { id: 'complete-o-versiculo', title: 'Complete o Versículo', subtitle: 'Desafio de leitura', sinopse: 'Escolha a palavra que completa o versículo!', faixa: '7-9', tipo: 'at-nt', status: 'pronto', habilidades: ['leitura', 'conhecimento bíblico'], icon: CrownIcon, color: 'bg-violet-200 text-violet-900', component: GameCompleteOVersiculo },
  { id: 'sombra-do-heroi', title: 'Sombra do Herói', subtitle: 'Silhuetas', sinopse: 'Descubra o personagem pela silhueta!', faixa: '7-9', tipo: 'at-nt', status: 'pronto', habilidades: ['reconhecimento', 'memória'], icon: CrownIcon, color: 'bg-slate-200 text-slate-800', component: GameSombraDoHeroi },
];

// ─── Ícones simples (evita importar lucide em games.ts) ──────────
function StarIcon({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>;
}
function SunIcon({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
}
function CrownIcon({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20L19 8l-5 5-2-7-2 7-5-5z"/></svg>;
}
function CompassIcon({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>;
}

// Backward compat — jogos antigos importam MAX_LEVELS_PER_GAME do aqui
export const MAX_LEVELS_PER_GAME = 3;

export const games = GAMES;