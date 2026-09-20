import type { ComponentType } from 'react';
import {
  BookOpen,
  Candy,
  Coins,
  Crown,
  HeartHandshake,
  Scale,
  Star,
  Users,
} from 'lucide-react';
import GameBalanca from '../components/games/GameBalanca';
import GameEstrelas from '../components/games/GameEstrelas';
import GameEstradaDaLuz from '../components/games/GameEstradaDaLuz';
import GameLivroDaVida from '../components/games/GameLivroDaVida';
import GameMentirinhaQueCresce from '../components/games/GameMentirinhaQueCresce';
import GameMoedaNoChao from '../components/games/GameMoedaNoChao';
import GameSeguirATurma from '../components/games/GameSeguirATurma';
import GameSoMaisUmPedaco from '../components/games/GameSoMaisUmPedaco';

export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  /** Sinopse do capítulo: a lição do jogo (fazer o certo → recompensa em Deus) */
  sinopse: string;
  /** Quantos níveis o capítulo tem (padrão: MAX_LEVELS_PER_GAME = 10) */
  totalLevels?: number;
  icon: ComponentType<{ className?: string }>;
  /** Classes Tailwind (literais) do cartucho no Hub da saga */
  color: string;
  component: ComponentType<{ onExit: () => void }>;
}

// Para adicionar um novo capítulo à saga:
// 1. Crie o componente em src/components/games/NovoJogo.tsx (props: { onExit: () => void })
// 2. Importe-o aqui e adicione um novo objeto no array abaixo.
// Nenhuma outra alteração é necessária no Hub ou no App.
// A ordem do array é a ordem dos capítulos da jornada!
export const games: GameDefinition[] = [
  {
    id: 'balanca',
    title: 'A Balança das Escolhas',
    subtitle: 'Deus sempre faz o que é certo',
    sinopse: 'Deus pesa tudo na balança: a boa escolha vale mais que qualquer tesouro.',
    icon: Scale,
    color: 'bg-gradient-to-b from-amber-300 to-amber-500',
    component: GameBalanca,
  },
  {
    id: 'livro-da-vida',
    title: 'O Livro da Vida',
    subtitle: 'Seu nome guardado para sempre',
    sinopse: 'Quem ama a Deus e faz o certo tem o nome guardado para sempre no Livro da Vida.',
    icon: BookOpen,
    color: 'bg-gradient-to-b from-sky-300 to-sky-500',
    component: GameLivroDaVida,
  },
  {
    id: 'conte-as-estrelas',
    title: 'Conte as Estrelas',
    subtitle: 'Cada escolha boa brilha no céu',
    sinopse: 'Deus prometeu um céu cheio de estrelas: cada boa escolha acende uma delas.',
    icon: Star,
    color: 'bg-gradient-to-b from-fuchsia-400 to-fuchsia-600',
    component: GameEstrelas,
  },
  {
    id: 'moeda-no-chao',
    title: 'A Moeda no Chão',
    subtitle: 'Devolver alegra o dono',
    sinopse: 'Devolver o que não é seu é um passo de verdade na jornada até Deus.',
    icon: Coins,
    color: 'bg-gradient-to-b from-yellow-300 to-yellow-500',
    component: GameMoedaNoChao,
  },
  {
    id: 'mentirinha-que-cresce',
    title: 'A Mentirinha que Cresce',
    subtitle: 'A verdade liberta',
    sinopse: 'A verdade liberta. Cada verdade dita acende mais uma luz no caminho.',
    icon: HeartHandshake,
    color: 'bg-gradient-to-b from-emerald-300 to-emerald-500',
    component: GameMentirinhaQueCresce,
  },
  {
    id: 'so-mais-um-pedaco',
    title: 'Só Mais um Pedaço',
    subtitle: 'Dividir dobra a alegria',
    sinopse: 'Quem divide agrada a Deus: a alegria dobra quando a gente compartilha.',
    icon: Candy,
    color: 'bg-gradient-to-b from-pink-300 to-rose-500',
    component: GameSoMaisUmPedaco,
  },
  {
    id: 'seguir-a-turma',
    title: 'Seguir a Turma',
    subtitle: 'Brincar inclui todo mundo',
    sinopse: 'Fazer o certo mesmo sozinho te aproxima da Luz. Cada amigo importa.',
    icon: Users,
    color: 'bg-gradient-to-b from-violet-400 to-purple-600',
    component: GameSeguirATurma,
  },
  {
    id: 'estrada-da-luz',
    title: 'A Estrada da Luz',
    subtitle: 'Faça o certo e caminhe até Deus',
    sinopse:
      'O capítulo final! Cada resposta certa te caminha até a Luz. Errar acende o fogo do inferno — mas Deus sempre espera você voltar!',
    icon: Crown,
    color: 'bg-gradient-to-b from-indigo-700 via-blue-600 to-sky-500',
    totalLevels: 3,
    component: GameEstradaDaLuz,
  },
];