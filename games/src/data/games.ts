import type { ComponentType } from 'react';
import { BookOpen, Candy, Coins, HeartHandshake, Scale, Star, Users } from 'lucide-react';
import GameBalanca from '../components/games/GameBalanca';
import GameEstrelas from '../components/games/GameEstrelas';
import GameLivroDaVida from '../components/games/GameLivroDaVida';
import GameMentirinhaQueCresce from '../components/games/GameMentirinhaQueCresce';
import GameMoedaNoChao from '../components/games/GameMoedaNoChao';
import GameSeguirATurma from '../components/games/GameSeguirATurma';
import GameSoMaisUmPedaco from '../components/games/GameSoMaisUmPedaco';

export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  /** Classes Tailwind (literais) do cartucho do Hub */
  color: string;
  component: ComponentType<{ onExit: () => void }>;
}

// Para adicionar um novo jogo no futuro:
// 1. Crie o componente em src/components/games/NovoJogo.tsx (props: { onExit: () => void })
// 2. Importe-o aqui e adicione um novo objeto no array abaixo.
// Nenhuma outra alteração é necessária no Hub ou no App.
export const games: GameDefinition[] = [
  {
    id: 'balanca',
    title: 'A Balança das Escolhas',
    subtitle: 'Deus sempre faz o que é certo',
    icon: Scale,
    color: 'bg-gradient-to-b from-amber-300 to-amber-500',
    component: GameBalanca,
  },
  {
    id: 'livro-da-vida',
    title: 'O Livro da Vida',
    subtitle: 'Seu nome guardado para sempre',
    icon: BookOpen,
    color: 'bg-gradient-to-b from-sky-300 to-sky-500',
    component: GameLivroDaVida,
  },
  {
    id: 'conte-as-estrelas',
    title: 'Conte as Estrelas',
    subtitle: 'Cada escolha boa brilha no céu',
    icon: Star,
    color: 'bg-gradient-to-b from-fuchsia-400 to-fuchsia-600',
    component: GameEstrelas,
  },
  {
    id: 'moeda-no-chao',
    title: 'A Moeda no Chão',
    subtitle: 'Devolver alegra o dono',
    icon: Coins,
    color: 'bg-gradient-to-b from-yellow-300 to-yellow-500',
    component: GameMoedaNoChao,
  },
  {
    id: 'mentirinha-que-cresce',
    title: 'A Mentirinha que Cresce',
    subtitle: 'A verdade liberta',
    icon: HeartHandshake,
    color: 'bg-gradient-to-b from-emerald-300 to-emerald-500',
    component: GameMentirinhaQueCresce,
  },
  {
    id: 'so-mais-um-pedaco',
    title: 'Só Mais um Pedaço',
    subtitle: 'Dividir dobra a alegria',
    icon: Candy,
    color: 'bg-gradient-to-b from-pink-300 to-rose-500',
    component: GameSoMaisUmPedaco,
  },
  {
    id: 'seguir-a-turma',
    title: 'Seguir a Turma',
    subtitle: 'Brincar inclui todo mundo',
    icon: Users,
    color: 'bg-gradient-to-b from-violet-400 to-purple-600',
    component: GameSeguirATurma,
  },
];